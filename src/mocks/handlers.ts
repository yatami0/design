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

import { BASE_DATE, PRIORITIES, STATUSES } from './data';
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

      // 🟥 工程4 K1/K2 の証拠——「保存された絵が出た」ではなく
      //    「**この method・URL・body が・何回**飛んだ」を残す。
      //    🟥 とくに **body に変えていない項目まで載っていないか**を見る
      //    （全項目 PUT は他人の編集を踏み潰す形。手順書 §0.1 K1）。
      console.info(
        `[msw] PUT /issues/${String(id)}.json ${JSON.stringify(patch)}`,
      );
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
      // 🆕 工程4 D15=B: 工程2 はここに表のインライン複製を持っていた。
      //    編集で「選べる値の集合」が要るようになり複製が 3 箇所になるところだったので、
      //    `data.ts` の 1 つに寄せた（生成・端点・適用がすべて同じ表を見る）。
      applyNamed('status', patch['status_id'], STATUSES);
      applyNamed('priority', patch['priority_id'], PRIORITIES);

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
    // 🆕 工程5 K2: 一覧（`/issues.json`）と同じ形で証拠を残す。
    //    **飛んだ URL を機械が数える**ための口（`tools/pivot-probe.mjs`）。
    console.info(`[msw] GET /time_entries.json${url.search}`);
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

  // 🆕 工程4 D15=B: 編集で選べる値の集合。**どちらも Redmine に実在する端点**
  //    （`/issue_statuses.json` ／ `/enumerations/issue_priorities.json`）。
  //    🟨 一覧の絞り込みで使う `open` / `closed` / `*` は**絞り込み専用の語**で、
  //       ここには出てこない（実 API も返さない）——出どころが違う（手順書 D15）。
  http.get(`${REDMINE_BASE_URL}/issue_statuses.json`, () => {
    return HttpResponse.json({
      issue_statuses: STATUSES.map((status) => ({
        ...status,
        is_closed: CLOSED_STATUS_IDS.has(status.id),
      })),
    });
  }),

  http.get(`${REDMINE_BASE_URL}/enumerations/issue_priorities.json`, () => {
    return HttpResponse.json({
      issue_priorities: PRIORITIES.map((priority) => ({
        ...priority,
        is_default: priority.id === 4,
      })),
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
