// 工程2 — 取得の層（**題材**の層）。
//
// 🟥 **URL の形を知ってよいのはこのファイルだけ。**部品（33 件）は 8 手連続で
//    「props だけ」を守ってきた（手順書 D4）。取得を部品に入れると、story が全部
//    ネットワーク依存になり、見た目の検証装置（Storybook）が壊れる。
//
// 🟦 **実 API に繋ぐ日に書き換わるのはここの 3 点だけ**という設計（Q3）:
//    ① `REDMINE_BASE_URL` ② 認証ヘッダ（Redmine は `X-Redmine-API-Key`）③ convert.ts
//    それ以外（画面・部品）は 1 行も変わらないはず——という主張の検証は工程3 以降。
import {
  toIssue,
  toIssueDetail,
  toTimeEntry,
  toUserPerson,
  toVersion,
} from './convert';
import type {
  Issue,
  IssueDetail,
  Page,
  Person,
  TimeEntry,
  Version,
} from './model';
import type {
  RedmineIssueResponse,
  RedmineIssuesResponse,
  RedmineTimeEntriesResponse,
  RedmineUsersResponse,
  RedmineVersionsResponse,
} from './types';

/**
 * Redmine のマウント先。
 * 🟨 `/issues.json` を repo の直下に置くと Storybook 自身のルート（`/index.json` 等）と
 *    紛らわしいので、実運用でよくある「サブパスにマウント」の形にしてある。
 */
export const REDMINE_BASE_URL = '/redmine';

type QueryValue = string | number | undefined;

function buildUrl(
  path: string,
  query: Record<string, QueryValue> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${REDMINE_BASE_URL}${path}?${qs}` : `${REDMINE_BASE_URL}${path}`;
}

async function getJson<T>(
  path: string,
  query?: Record<string, QueryValue>,
): Promise<T> {
  const url = buildUrl(path, query);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Redmine API ${String(res.status)}: ${url}`);
  }
  return (await res.json()) as T;
}

export interface IssueQuery {
  /** `open` / `closed` / `*` / ステータス id（データモデル §2.1 の逐語）。 */
  status_id?: string | number;
  assigned_to_id?: number;
  project_id?: number;
  /** 一覧で許されるのは `attachments` と `relations` の 2 つだけ。 */
  include?: 'relations' | 'attachments' | 'attachments,relations';
  offset?: number;
  limit?: number;
  sort?: string;
  /**
   * 更新日の絞り込み（工程3 D14=B）。`><YYYY-MM-DD|YYYY-MM-DD` の演算子記法は
   * Redmine 固有の知識なので、組み立ては period.ts（対応表）だけが持つ。
   */
  updated_on?: string;
}

export async function fetchIssues(
  query: IssueQuery = {},
): Promise<Page<Issue>> {
  const data = await getJson<RedmineIssuesResponse>('/issues.json', {
    ...query,
  });
  return {
    items: data.issues.map(toIssue),
    totalCount: data.total_count,
    offset: data.offset,
    limit: data.limit,
  };
}

/** 🟥 変更履歴（`journals`）が取れるのは**この単票だけ**（データモデル §4 ②）。 */
export async function fetchIssue(id: number): Promise<IssueDetail> {
  const data = await getJson<RedmineIssueResponse>(
    `/issues/${String(id)}.json`,
    { include: 'journals,relations' },
  );
  return toIssueDetail(data.issue);
}

/** Redmine の PUT は本文を返さない（204 No Content）。 */
export interface IssuePatch {
  subject?: string;
  description?: string;
  status_id?: number;
  priority_id?: number;
  assigned_to_id?: number | null;
  done_ratio?: number;
  estimated_hours?: number | null;
  start_date?: string | null;
  due_date?: string | null;
  notes?: string;
}

export async function updateIssue(
  id: number,
  patch: IssuePatch,
): Promise<void> {
  const url = buildUrl(`/issues/${String(id)}.json`);
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ issue: patch }),
  });
  if (!res.ok) {
    throw new Error(`Redmine API ${String(res.status)}: ${url}`);
  }
}

export interface TimeEntryQuery {
  /** `spent_on` の範囲。Redmine のフィルタ記法は `><2026-05-01|2026-08-07`。 */
  from?: string;
  to?: string;
  user_id?: number;
  project_id?: number;
  offset?: number;
  limit?: number;
}

export async function fetchTimeEntries(
  query: TimeEntryQuery = {},
): Promise<Page<TimeEntry>> {
  const data = await getJson<RedmineTimeEntriesResponse>('/time_entries.json', {
    ...query,
  });
  return {
    items: data.time_entries.map(toTimeEntry),
    totalCount: data.total_count,
    offset: data.offset,
    limit: data.limit,
  };
}

export async function fetchUsers(): Promise<Person[]> {
  const data = await getJson<RedmineUsersResponse>('/users.json');
  return data.users.map(toUserPerson);
}

export async function fetchVersions(projectId: number): Promise<Version[]> {
  const data = await getJson<RedmineVersionsResponse>(
    `/projects/${String(projectId)}/versions.json`,
  );
  return data.versions.map(toVersion);
}
