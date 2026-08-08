// 工程2 — MSW のハンドラ（**Redmine の端点をそのまま模す**）。
//
// 🟥 **モックが実 API より親切になってはいけない。**この工程の規律は
//    「Redmine が返せるものしか返さない」（docs/データモデル.md §1）。だから:
//      ① 一覧は `journals` を**返さない**（単票専用・データモデル §4 ②）
//      ② `limit` は **100 で頭打ち**（Redmine の上限。EVM は必ずページングが要る）
//      ③ `status_id` の既定は **open だけ**（Redmine の既定挙動）
//    ここで手加減すると、実 API に繋いだ日に画面が壊れる。
import { http, HttpResponse } from 'msw';

import { REDMINE_BASE_URL } from '@/redmine/client';
import type {
  RedmineIssue,
  RedmineIssueRelation,
  RedmineTimeEntry,
} from '@/redmine/types';

import { BASE_DATE } from './data';
import { getDb } from './db';
import { atNoon } from './random';

/** 🟥 Redmine の `limit` 上限。EVM の日次系列はこの壁に当たる。 */
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;

/** 🟨 既定ステータス（データモデル §2）のうち完了系。 */
const CLOSED_STATUS_IDS = new Set([5, 6]);

function readPaging(url: URL): { offset: number; limit: number } {
  const offset = Number(url.searchParams.get('offset') ?? 0);
  const requested = Number(url.searchParams.get('limit') ?? DEFAULT_LIMIT);
  return {
    offset: Number.isFinite(offset) ? Math.max(0, offset) : 0,
    limit: Number.isFinite(requested)
      ? Math.min(Math.max(1, requested), MAX_LIMIT)
      : DEFAULT_LIMIT,
  };
}

function matchesStatus(issue: RedmineIssue, statusId: string): boolean {
  if (statusId === '*') return true;
  if (statusId === 'open') return !CLOSED_STATUS_IDS.has(issue.status.id);
  if (statusId === 'closed') return CLOSED_STATUS_IDS.has(issue.status.id);
  return issue.status.id === Number(statusId);
}

/**
 * 工程3 D14=B — `updated_on` の絞り込み。実装するのは `><YYYY-MM-DD|YYYY-MM-DD`
 * （両端含む・period.ts が組む形）**だけ**。実 API は `>=` 単独なども受けるが、
 * 使っていない形をモックに足すと「実 API より親切」になる（工程2 の規律）。
 */
function matchesUpdatedOn(issue: RedmineIssue, param: string | null): boolean {
  if (param === null) return true;
  const match = /^><(\d{4}-\d{2}-\d{2})\|(\d{4}-\d{2}-\d{2})$/.exec(param);
  const from = match?.[1];
  const to = match?.[2];
  // 解釈できない形は絞らない（実 API はフィルタ不成立として無視する）
  if (from === undefined || to === undefined) return true;
  const day = issue.updated_on.slice(0, 10);
  return from <= day && day <= to;
}

/**
 * 工程3 P3-06 — `sort`。一覧画面が使う分だけ（`updated_on:desc` / `id` とその逆順）。
 * 未指定の既定は id 降順（工程2 と同じ）。
 */
function compareIssues(
  sort: string | null,
): (a: RedmineIssue, b: RedmineIssue) => number {
  const [field = 'id', direction] = (sort ?? 'id:desc').split(':');
  const sign = direction === 'desc' ? -1 : 1;
  if (field === 'updated_on') {
    return (a, b) => sign * a.updated_on.localeCompare(b.updated_on);
  }
  return (a, b) => sign * (a.id - b.id);
}

function relationsOf(id: number): RedmineIssueRelation[] {
  return getDb().relations.filter(
    (relation) => relation.issue_id === id || relation.issue_to_id === id,
  );
}

/** 一覧が返す形。🟥 `journals` は必ず落とす（実 API では一覧に出ないため）。 */
function forList(issue: RedmineIssue, withRelations: boolean): RedmineIssue {
  const copy = { ...issue };
  delete copy.journals;
  if (withRelations) copy.relations = relationsOf(issue.id);
  return copy;
}

export const handlers = [
  // ── 一覧 ───────────────────────────────────────────────────────────
  http.get(`${REDMINE_BASE_URL}/issues.json`, ({ request }) => {
    const url = new URL(request.url);
    // 🟥 K1 の証拠——「絵が変わった」ではなく「このクエリが飛んだ」を残す（工程3 P3-06）
    console.info(`[msw] GET /issues.json${url.search}`);
    const { offset, limit } = readPaging(url);
    const statusId = url.searchParams.get('status_id') ?? 'open';
    const assignedTo = url.searchParams.get('assigned_to_id');
    const projectId = url.searchParams.get('project_id');
    const updatedOn = url.searchParams.get('updated_on');
    const withRelations = (url.searchParams.get('include') ?? '').includes(
      'relations',
    );

    const filtered = getDb()
      .issues.filter((issue) => matchesStatus(issue, statusId))
      .filter(
        (issue) =>
          assignedTo === null || issue.assigned_to?.id === Number(assignedTo),
      )
      .filter(
        (issue) => projectId === null || issue.project.id === Number(projectId),
      )
      .filter((issue) => matchesUpdatedOn(issue, updatedOn))
      .sort(compareIssues(url.searchParams.get('sort')));

    return HttpResponse.json({
      issues: filtered
        .slice(offset, offset + limit)
        .map((issue) => forList(issue, withRelations)),
      total_count: filtered.length,
      offset,
      limit,
    });
  }),

  // ── 単票（★ journals が取れるのはここだけ）──────────────────────────
  http.get(`${REDMINE_BASE_URL}/issues/:id.json`, ({ request, params }) => {
    const id = Number(params.id);
    const issue = getDb().issues.find((candidate) => candidate.id === id);
    if (!issue) {
      return HttpResponse.json({ errors: ['Not found'] }, { status: 404 });
    }
    const include = new URL(request.url).searchParams.get('include') ?? '';
    const { journals, ...rest } = issue;
    return HttpResponse.json({
      issue: {
        ...rest,
        ...(include.includes('journals') ? { journals } : {}),
        ...(include.includes('relations')
          ? { relations: relationsOf(id) }
          : {}),
      },
    });
  }),

  // ── 編集（Redmine は 204 No Content を返す）─────────────────────────
  http.put(
    `${REDMINE_BASE_URL}/issues/:id.json`,
    async ({ request, params }) => {
      const id = Number(params.id);
      const issue = getDb().issues.find((candidate) => candidate.id === id);
      if (!issue) {
        return HttpResponse.json({ errors: ['Not found'] }, { status: 404 });
      }

      const body = (await request.json()) as {
        issue?: Record<string, unknown>;
      };
      const patch = body.issue ?? {};
      const changes: { name: string; from: string | null; to: string }[] = [];

      const applyNamed = (
        key: 'status' | 'priority',
        value: unknown,
        table: readonly { id: number; name: string }[],
      ): void => {
        if (typeof value !== 'number') return;
        const next = table.find((entry) => entry.id === value);
        if (!next) return;
        changes.push({
          name: `${key}_id`,
          from: String(issue[key].id),
          to: String(value),
        });
        issue[key] = next;
      };

      if (typeof patch['subject'] === 'string') {
        changes.push({
          name: 'subject',
          from: issue.subject,
          to: patch['subject'],
        });
        issue.subject = patch['subject'];
      }
      if (typeof patch['description'] === 'string') {
        issue.description = patch['description'];
      }
      if (typeof patch['done_ratio'] === 'number') {
        changes.push({
          name: 'done_ratio',
          from: String(issue.done_ratio),
          to: String(patch['done_ratio']),
        });
        issue.done_ratio = patch['done_ratio'];
      }
      applyNamed('status', patch['status_id'], [
        { id: 1, name: '新規' },
        { id: 2, name: '進行中' },
        { id: 3, name: '解決' },
        { id: 4, name: 'フィードバック' },
        { id: 5, name: '終了' },
        { id: 6, name: '却下' },
      ]);
      applyNamed('priority', patch['priority_id'], [
        { id: 3, name: '低め' },
        { id: 4, name: '通常' },
        { id: 5, name: '高め' },
        { id: 6, name: '急いで' },
        { id: 7, name: '今すぐ' },
      ]);

      // 🟥 現在時刻を読まない（D5）。基準日で固定しておく——story の再現性が優先。
      issue.updated_on = atNoon(BASE_DATE);
      issue.journals = [
        ...(issue.journals ?? []),
        {
          id: 9000 + (issue.journals?.length ?? 0),
          user: issue.assigned_to ?? issue.author,
          notes: typeof patch['notes'] === 'string' ? patch['notes'] : '',
          created_on: atNoon(BASE_DATE),
          details: changes.map((change) => ({
            property: 'attr' as const,
            name: change.name,
            old_value: change.from,
            new_value: change.to,
          })),
        },
      ];

      return new HttpResponse(null, { status: 204 });
    },
  ),

  // ── 作業時間（🟦 AC が日次で取れる唯一の端点）───────────────────────
  http.get(`${REDMINE_BASE_URL}/time_entries.json`, ({ request }) => {
    const url = new URL(request.url);
    const { offset, limit } = readPaging(url);
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const userId = url.searchParams.get('user_id');
    const projectId = url.searchParams.get('project_id');

    const filtered = getDb().timeEntries.filter((entry: RedmineTimeEntry) => {
      if (from !== null && entry.spent_on < from) return false;
      if (to !== null && entry.spent_on > to) return false;
      if (userId !== null && entry.user.id !== Number(userId)) return false;
      if (projectId !== null && entry.project.id !== Number(projectId)) {
        return false;
      }
      return true;
    });

    return HttpResponse.json({
      time_entries: filtered.slice(offset, offset + limit),
      total_count: filtered.length,
      offset,
      limit,
    });
  }),

  // ── 付随するもの ───────────────────────────────────────────────────
  http.get(`${REDMINE_BASE_URL}/projects.json`, () => {
    const { projects } = getDb();
    return HttpResponse.json({
      projects,
      total_count: projects.length,
      offset: 0,
      limit: DEFAULT_LIMIT,
    });
  }),

  http.get(`${REDMINE_BASE_URL}/users.json`, () => {
    const { users } = getDb();
    return HttpResponse.json({
      users,
      total_count: users.length,
      offset: 0,
      limit: DEFAULT_LIMIT,
    });
  }),

  http.get(`${REDMINE_BASE_URL}/projects/:id/versions.json`, ({ params }) => {
    const projectId = Number(params.id);
    const versions = getDb().versions.filter(
      (version) => version.project.id === projectId,
    );
    return HttpResponse.json({
      versions,
      total_count: versions.length,
      offset: 0,
      limit: DEFAULT_LIMIT,
    });
  }),
];
