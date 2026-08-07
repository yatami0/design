// 工程2 — 画面が使う型（**題材**の層）。
//
// API 表現（types.ts）との違いは 3 つだけ:
//   ① camelCase        ② null の扱いを揃える     ③ **表示に要る語彙（tone）を持つ**
// ③ が肝。コアの `StatusPill` は tone（success / warning / danger / neutral）しか知らず、
// 「Redmine の status 5 番が完了」という知識は**題材が持つ**（docs/データモデル.md §6）。
//
// 🟥 この層も src/index.ts から export しない。
import type { StatusTone } from '@/components/DataDisplay/StatusPill';

export interface Person {
  id: number;
  /** firstname + lastname を連結したもの（API には無い・データモデル §2.5）。 */
  name: string;
}

export interface IssueStatus {
  id: number;
  name: string;
  /** ★ コアの語彙へ落とした結果。対応表は convert.ts が持つ。 */
  tone: StatusTone;
  /** 完了系のステータスか（Redmine の `is_closed` に相当。API の一覧には出ない）。 */
  closed: boolean;
}

export interface IssuePriority {
  id: number;
  name: string;
  /** 並べ替え用。id の大小がそのまま優先度の順（既定の enumeration・🟨 版で変わる）。 */
  rank: number;
}

export interface IssueRelation {
  id: number;
  fromId: number;
  toId: number;
  type: string;
  /** precedes / follows のときの遅延日数。 */
  delayDays: number | null;
}

export interface Issue {
  id: number;
  /** 画面に出す識別子。Redmine の慣習は `#1042`（`REDMINE-1042` のような key は無い）。 */
  displayId: string;
  subject: string;
  description: string;
  project: Person;
  tracker: Person;
  status: IssueStatus;
  priority: IssuePriority;
  author: Person;
  assignee: Person | null;
  version: Person | null;
  parentId: number | null;
  /** `YYYY-MM-DD`。 */
  startDate: string | null;
  dueDate: string | null;
  /** 0〜100。 */
  doneRatio: number;
  estimatedHours: number | null;
  spentHours: number | null;
  createdAt: string;
  updatedAt: string;
  /** `include=relations` を付けたときだけ埋まる。ガントの依存線の材料。 */
  relations: IssueRelation[];
}

/** 変更履歴。🟥 単票でしか取れない（データモデル §4 ②）。 */
export interface IssueEvent {
  id: number;
  user: Person;
  notes: string;
  at: string;
  changes: { field: string; from: string | null; to: string | null }[];
}

export interface IssueDetail extends Issue {
  events: IssueEvent[];
}

export interface TimeEntry {
  id: number;
  issueId: number | null;
  project: Person;
  user: Person;
  activity: Person;
  hours: number;
  comments: string;
  /** `YYYY-MM-DD`。稼働表も EVM の AC もこの 1 フィールドで畳む。 */
  spentOn: string;
}

export interface Version {
  id: number;
  name: string;
  project: Person;
  status: 'open' | 'locked' | 'closed';
  /** ガントのマイルストーン。 */
  dueDate: string | null;
}

export interface Page<T> {
  items: T[];
  totalCount: number;
  offset: number;
  limit: number;
}
