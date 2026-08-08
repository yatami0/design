// 工程2 — Redmine の API 表現（**題材**の層。コアではない）。
//
// 🟥 **ここは Redmine の JSON をそのまま写す場所。手を加えない。**
//    加えると「実 API では何が来るか」が分からなくなり、Q3（実 API に繋ぐとき
//    どこが書き換わるか）が測れなくなる。camelCase 化・表示用の加工は convert.ts でやる。
//
// 出典と印（🟦 wiki に明記 / 🟨 版で変わる）は docs/データモデル.md §2。
// 🟥 **この層は src/index.ts から export しない**（出荷物は Redmine を知らない・DR-0078）。

/** Redmine はステータスも優先度も列挙型ではなく `{ id, name }` で返す（データモデル §2.1）。 */
export interface RedmineNamed {
  id: number;
  name: string;
}

/** 🟦 10 値。`delay` が意味を持つのは precedes / follows のときだけ。 */
export type RedmineRelationType =
  | 'relates'
  | 'duplicates'
  | 'duplicated'
  | 'blocks'
  | 'blocked'
  | 'precedes'
  | 'follows'
  | 'copied_to'
  | 'copied_from';

export interface RedmineIssueRelation {
  id: number;
  issue_id: number;
  issue_to_id: number;
  relation_type: RedmineRelationType;
  /** precedes / follows のときの遅延日数。それ以外は null。 */
  delay: number | null;
}

/** 変更履歴の 1 行。🟥 **単票（`include=journals`）でしか返らない**（データモデル §4 ②）。 */
export interface RedmineJournalDetail {
  property: 'attr' | 'cf' | 'attachment' | 'relation';
  name: string;
  old_value: string | null;
  new_value: string | null;
}

export interface RedmineJournal {
  id: number;
  user: RedmineNamed;
  notes: string;
  created_on: string;
  details: RedmineJournalDetail[];
}

export interface RedmineIssue {
  id: number;
  project: RedmineNamed;
  tracker: RedmineNamed;
  status: RedmineNamed;
  priority: RedmineNamed;
  author: RedmineNamed;
  /** 未割当のチケットではキーごと来ない。 */
  assigned_to?: RedmineNamed;
  fixed_version?: RedmineNamed;
  parent?: { id: number };
  subject: string;
  description: string;
  /** `YYYY-MM-DD`。未設定は null。 */
  start_date: string | null;
  due_date: string | null;
  /** 0〜100（既定は 10 刻み）。 */
  done_ratio: number;
  estimated_hours: number | null;
  /** 🟨 単票では返る（wiki の一覧に無い）。 */
  spent_hours?: number;
  created_on: string;
  updated_on: string;
  /** `include=relations` のときだけ。一覧でも指定できる（データモデル §2.1）。 */
  relations?: RedmineIssueRelation[];
  /** 🟥 `include=journals` は**単票専用**。 */
  journals?: RedmineJournal[];
}

export interface RedmineTimeEntry {
  id: number;
  project: RedmineNamed;
  /** プロジェクトに直接付けた工数にはチケットが無い。 */
  issue?: { id: number };
  user: RedmineNamed;
  activity: RedmineNamed;
  hours: number;
  comments: string;
  /** `YYYY-MM-DD`。🟦 **AC（実績）が日次で取れる唯一の足がかり。** */
  spent_on: string;
  created_on: string;
  updated_on: string;
}

export interface RedmineVersion {
  id: number;
  project: RedmineNamed;
  name: string;
  description: string;
  status: 'open' | 'locked' | 'closed';
  due_date: string | null;
  sharing: 'none' | 'descendants' | 'hierarchy' | 'tree' | 'system';
  created_on: string;
  updated_on: string;
}

export interface RedmineUser {
  id: number;
  login: string;
  /** 🟥 表示名は API に無い。firstname + lastname を**我々が連結する**（データモデル §2.5）。 */
  firstname: string;
  lastname: string;
  mail: string;
  created_on: string;
}

export interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description: string;
  /** 1 = active。 */
  status: number;
  created_on: string;
  updated_on: string;
}

/** 一覧の封筒。ページングは `total_count` / `offset` / `limit`。 */
export interface RedminePage {
  total_count: number;
  offset: number;
  limit: number;
}

export type RedmineIssuesResponse = RedminePage & { issues: RedmineIssue[] };
export type RedmineTimeEntriesResponse = RedminePage & {
  time_entries: RedmineTimeEntry[];
};
export type RedmineUsersResponse = RedminePage & { users: RedmineUser[] };
export type RedmineProjectsResponse = RedminePage & {
  projects: RedmineProject[];
};
export type RedmineVersionsResponse = RedminePage & {
  versions: RedmineVersion[];
};
export type RedmineIssueResponse = { issue: RedmineIssue };

// 🆕 工程4 D15=B: 編集で選べる値の集合。**ページングの封筒を持たない**——
//    Redmine のこの 2 端点は `total_count` / `offset` / `limit` を返さない（配列だけ）。
//    出典: <https://www.redmine.org/projects/redmine/wiki/Rest_IssueStatuses>
//          <https://www.redmine.org/projects/redmine/wiki/Rest_Enumerations>
export interface RedmineIssueStatus extends RedmineNamed {
  is_closed: boolean;
}

export interface RedmineIssuePriority extends RedmineNamed {
  is_default: boolean;
}

export type RedmineIssueStatusesResponse = {
  issue_statuses: RedmineIssueStatus[];
};
export type RedmineIssuePrioritiesResponse = {
  issue_priorities: RedmineIssuePriority[];
};
