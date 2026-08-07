// 工程2 — ★ 変換の境界（**題材**の層）。
//
// 🟥 **実 API に繋ぐ日に書き換わるのは、原則このファイルだけ**という設計（手順書 D1）。
//    Q3（実 API に繋ぐときどこが書き換わるか）は、この設計が守れているかで測る。
//    → 画面が snake_case を 1 度でも直接読んだら、この設計は破れている。
//
// ★ もう 1 つの役目: **Redmine の id を、コアの語彙（tone）へ落とす対応表**を持つ。
//    コアの `StatusPill` は tone しか知らない（docs/データモデル.md §6）。
import type { StatusTone } from '@/components/DataDisplay/StatusPill';

import type {
  Issue,
  IssueDetail,
  IssuePriority,
  IssueRelation,
  IssueStatus,
  Person,
  TimeEntry,
  Version,
} from './model';
import type {
  RedmineIssue,
  RedmineIssueRelation,
  RedmineNamed,
  RedmineTimeEntry,
  RedmineUser,
  RedmineVersion,
} from './types';

/**
 * ★ 題材の知識。**Redmine の既定ステータス**（🟨 版・運用で変わる）。
 * 🟥 コア側にこの表を置いてはいけない——置いた瞬間に、出荷物が Redmine を知ることになる。
 */
const STATUS_TONE: Record<number, StatusTone> = {
  1: 'neutral', // New
  2: 'warning', // In Progress
  3: 'success', // Resolved
  4: 'danger', // Feedback（差し戻し）
  5: 'neutral', // Closed
  6: 'neutral', // Rejected
};

/** 🟨 Redmine の `is_closed` は一覧の JSON に出ないので、既定の id で判定する。 */
const CLOSED_STATUS_IDS = new Set([5, 6]);

export function toPerson(named: RedmineNamed): Person {
  return { id: named.id, name: named.name };
}

export function toStatus(named: RedmineNamed): IssueStatus {
  return {
    id: named.id,
    name: named.name,
    tone: STATUS_TONE[named.id] ?? 'neutral',
    closed: CLOSED_STATUS_IDS.has(named.id),
  };
}

export function toPriority(named: RedmineNamed): IssuePriority {
  // 既定の enumeration は Low(3) 〜 Immediate(7)。id の大小がそのまま優先度の順。
  return { id: named.id, name: named.name, rank: named.id - 2 };
}

export function toRelation(relation: RedmineIssueRelation): IssueRelation {
  return {
    id: relation.id,
    fromId: relation.issue_id,
    toId: relation.issue_to_id,
    type: relation.relation_type,
    delayDays: relation.delay,
  };
}

export function toIssue(issue: RedmineIssue): Issue {
  return {
    id: issue.id,
    // Redmine の慣習は `#1042`。`REDMINE-1042` のような key は API に無い。
    displayId: `#${String(issue.id)}`,
    subject: issue.subject,
    description: issue.description,
    project: toPerson(issue.project),
    tracker: toPerson(issue.tracker),
    status: toStatus(issue.status),
    priority: toPriority(issue.priority),
    author: toPerson(issue.author),
    assignee: issue.assigned_to ? toPerson(issue.assigned_to) : null,
    version: issue.fixed_version ? toPerson(issue.fixed_version) : null,
    parentId: issue.parent?.id ?? null,
    startDate: issue.start_date,
    dueDate: issue.due_date,
    doneRatio: issue.done_ratio,
    estimatedHours: issue.estimated_hours,
    spentHours: issue.spent_hours ?? null,
    createdAt: issue.created_on,
    updatedAt: issue.updated_on,
    relations: (issue.relations ?? []).map(toRelation),
  };
}

export function toIssueDetail(issue: RedmineIssue): IssueDetail {
  return {
    ...toIssue(issue),
    events: (issue.journals ?? []).map((journal) => ({
      id: journal.id,
      user: toPerson(journal.user),
      notes: journal.notes,
      at: journal.created_on,
      changes: journal.details.map((detail) => ({
        field: detail.name,
        from: detail.old_value,
        to: detail.new_value,
      })),
    })),
  };
}

export function toTimeEntry(entry: RedmineTimeEntry): TimeEntry {
  return {
    id: entry.id,
    issueId: entry.issue?.id ?? null,
    project: toPerson(entry.project),
    user: toPerson(entry.user),
    activity: toPerson(entry.activity),
    hours: entry.hours,
    comments: entry.comments,
    spentOn: entry.spent_on,
  };
}

export function toVersion(version: RedmineVersion): Version {
  return {
    id: version.id,
    name: version.name,
    project: toPerson(version.project),
    status: version.status,
    dueDate: version.due_date,
  };
}

/** 🟥 表示名は API に無いので**ここで作る**（データモデル §2.5）。 */
export function toUserPerson(user: RedmineUser): Person {
  return { id: user.id, name: `${user.lastname} ${user.firstname}` };
}
