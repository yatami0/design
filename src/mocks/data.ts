// 工程2 — 5 画面ぶんのデータ（**Redmine の形のまま**）。
//
// 🟥 **モックは Redmine が返せるものしか返さない**（docs/データモデル.md §1）。
//    返せないもの（ベースライン・稼働可能時間・単価）をここで作ると、
//    実 API に繋いだ日に画面が壊れる＝モックが嘘をついたことになる。
// 🟥 **現在時刻を読まない。**基準日は BASE_DATE の定数。seed も固定なので、
//    createData() は何度呼んでも同じ JSON を返す（P2-05 の検証項目）。
import type {
  RedmineIssue,
  RedmineIssueRelation,
  RedmineJournal,
  RedmineNamed,
  RedmineProject,
  RedmineTimeEntry,
  RedmineUser,
  RedmineVersion,
} from '@/redmine/types';

import { addDays, atNoon, isWeekend, makeRng, pick, randomInt } from './random';

/** ★ 「今日」。実行日ではなくこの定数（D5）。 */
export const BASE_DATE = '2026-08-07';

const SEED = 20_260_807;

// ── 語彙（🟨 Redmine の既定 seed に合わせた。版・運用で変わる）────────────
const TRACKERS: readonly RedmineNamed[] = [
  { id: 1, name: 'バグ' },
  { id: 2, name: '機能' },
  { id: 3, name: 'サポート' },
];

/**
 * 🆕 工程4 D15=B: **編集の選択肢の正本。**生成にも `/issue_statuses.json` にも
 * PUT の適用にもこの 1 つを使う（工程2 は PUT ハンドラにインラインの複製を持っていた）。
 */
export const STATUSES: readonly RedmineNamed[] = [
  { id: 1, name: '新規' },
  { id: 2, name: '進行中' },
  { id: 3, name: '解決' },
  { id: 4, name: 'フィードバック' },
  { id: 5, name: '終了' },
  { id: 6, name: '却下' },
];

export const PRIORITIES: readonly RedmineNamed[] = [
  { id: 3, name: '低め' },
  { id: 4, name: '通常' },
  { id: 5, name: '高め' },
  { id: 6, name: '急いで' },
  { id: 7, name: '今すぐ' },
];

const ACTIVITIES: readonly RedmineNamed[] = [
  { id: 8, name: '設計' },
  { id: 9, name: '開発' },
  { id: 10, name: 'レビュー' },
];

const PROJECTS: readonly RedmineProject[] = [
  {
    id: 1,
    name: '基幹システム刷新',
    identifier: 'core-renewal',
    description: '既存の基幹システムを段階的に置き換える',
    status: 1,
    created_on: atNoon('2026-01-06'),
    updated_on: atNoon('2026-08-03'),
  },
  {
    id: 2,
    name: '社内ポータル',
    identifier: 'portal',
    description: '社内向けの情報共有基盤',
    status: 1,
    created_on: atNoon('2026-02-02'),
    updated_on: atNoon('2026-07-28'),
  },
  {
    id: 3,
    name: 'データ基盤',
    identifier: 'data-platform',
    description: '集計とレポートの土台',
    status: 1,
    created_on: atNoon('2026-03-09'),
    updated_on: atNoon('2026-08-05'),
  },
];

/** 🟥 表示名は API に無い。firstname / lastname の 2 本で持つのが Redmine の形。 */
const USERS: readonly RedmineUser[] = [
  {
    id: 11,
    login: 'sato',
    firstname: '花子',
    lastname: '佐藤',
    mail: 'sato@example.com',
    created_on: atNoon('2026-01-06'),
  },
  {
    id: 12,
    login: 'tanaka',
    firstname: '太郎',
    lastname: '田中',
    mail: 'tanaka@example.com',
    created_on: atNoon('2026-01-06'),
  },
  {
    id: 13,
    login: 'suzuki',
    firstname: '一郎',
    lastname: '鈴木',
    mail: 'suzuki@example.com',
    created_on: atNoon('2026-01-20'),
  },
  {
    id: 14,
    login: 'takahashi',
    firstname: 'みどり',
    lastname: '高橋',
    mail: 'takahashi@example.com',
    created_on: atNoon('2026-02-03'),
  },
  {
    id: 15,
    login: 'ito',
    firstname: '健',
    lastname: '伊藤',
    mail: 'ito@example.com',
    created_on: atNoon('2026-03-02'),
  },
  {
    id: 16,
    login: 'watanabe',
    firstname: 'さくら',
    lastname: '渡辺',
    mail: 'watanabe@example.com',
    created_on: atNoon('2026-04-06'),
  },
];

const AREAS = [
  'ログイン',
  'チケット一覧',
  '添付ファイル',
  '検索',
  'CSV エクスポート',
  '通知メール',
  'ガントチャート',
  '権限設定',
  'ダッシュボード',
  'API',
  '稼働表',
  '監査ログ',
] as const;

const BUGS = [
  'で選択状態が復元されない',
  'で例外が発生する',
  'の並び順が崩れる',
  'が二重に登録される',
  'の応答が 3 秒を超える',
  'の値が保存されない',
  'で日本語が文字化けする',
  'がモバイル幅で見切れる',
] as const;

const FEATURES = [
  'に絞り込みを追加する',
  'の一括操作に対応する',
  'を印刷用に整える',
  'にキーボード操作を足す',
  'の表示項目を選べるようにする',
] as const;

/** 🟥 Redmine の JSON では利用者は `{ id, name }` で出てくる。表示名はここで作る。 */
function asNamed(user: RedmineUser): RedmineNamed {
  return { id: user.id, name: `${user.lastname} ${user.firstname}` };
}

function subjectOf(rng: () => number, trackerId: number): string {
  const area = pick(rng, AREAS);
  if (trackerId === 1) return `${area}${pick(rng, BUGS)}`;
  if (trackerId === 2) return `${area}${pick(rng, FEATURES)}`;
  return `${area}の使い方を案内する`;
}

/** ステータスから進捗率を決める（Redmine の運用でよくある形）。 */
function doneRatioOf(rng: () => number, statusId: number): number {
  if (statusId === 1) return 0;
  if (statusId === 6) return 0;
  if (statusId === 3 || statusId === 5) return 100;
  if (statusId === 4) return 30 + randomInt(rng, 5) * 10;
  return 10 + randomInt(rng, 8) * 10;
}

export interface MockData {
  projects: RedmineProject[];
  users: RedmineUser[];
  versions: RedmineVersion[];
  issues: RedmineIssue[];
  timeEntries: RedmineTimeEntry[];
  relations: RedmineIssueRelation[];
}

/**
 * ★ 決定論的な生成。**同じ seed からは同じ JSON**（P2-05 の検証項目）。
 * 件数は EVM の線が引ける規模にしてある（チケット 60・期間 3 か月・作業時間は自動）。
 */
export function createData(): MockData {
  const rng = makeRng(SEED);

  const versions: RedmineVersion[] = PROJECTS.flatMap((project, index) => [
    {
      id: 100 + index * 2 + 1,
      project: { id: project.id, name: project.name },
      name: 'v1.0',
      description: '最初のリリース',
      status: 'open' as const,
      due_date: addDays(BASE_DATE, -14 + index * 7),
      sharing: 'none' as const,
      created_on: project.created_on,
      updated_on: project.updated_on,
    },
    {
      id: 100 + index * 2 + 2,
      project: { id: project.id, name: project.name },
      name: 'v1.1',
      description: '次のリリース',
      status: 'open' as const,
      due_date: addDays(BASE_DATE, 21 + index * 7),
      sharing: 'none' as const,
      created_on: project.created_on,
      updated_on: project.updated_on,
    },
  ]);

  const issues: RedmineIssue[] = [];
  const timeEntries: RedmineTimeEntry[] = [];
  const relations: RedmineIssueRelation[] = [];
  let journalId = 5000;
  let timeEntryId = 3000;

  for (let index = 0; index < 60; index += 1) {
    const id = 1001 + index;
    const project = pick(rng, PROJECTS);
    const tracker = pick(rng, TRACKERS);
    const status = pick(rng, STATUSES);
    const priority = pick(rng, PRIORITIES);
    const author = pick(rng, USERS);
    const assignee = rng() < 0.85 ? pick(rng, USERS) : undefined;
    const version = versions.find((v) => v.project.id === project.id);

    const startDate = addDays(BASE_DATE, -70 + randomInt(rng, 90));
    const dueDate = addDays(startDate, 3 + randomInt(rng, 18));
    const doneRatio = doneRatioOf(rng, status.id);
    const estimatedHours = rng() < 0.9 ? 4 + randomInt(rng, 19) * 2 : null;

    // ── 変更履歴（🟥 単票でしか返さない。データモデル §4 ②）──────────
    const journals: RedmineJournal[] = [];
    let recorded = 0;
    let cursor = startDate;
    while (recorded < doneRatio) {
      const step = Math.min(doneRatio - recorded, 10 + randomInt(rng, 3) * 10);
      cursor = addDays(cursor, 1 + randomInt(rng, 6));
      if (cursor > BASE_DATE) break;
      journalId += 1;
      journals.push({
        id: journalId,
        user: asNamed(assignee ?? author),
        notes: '',
        created_on: atNoon(cursor),
        details: [
          {
            property: 'attr',
            name: 'done_ratio',
            old_value: String(recorded),
            new_value: String(recorded + step),
          },
        ],
      });
      recorded += step;
    }

    // ── 作業時間（🟦 AC の素材。日次で取れる唯一のもの）──────────────
    let spentHours = 0;
    if (estimatedHours !== null && doneRatio > 0) {
      const budget = (estimatedHours * doneRatio) / 100;
      let day = startDate;
      while (spentHours < budget && day <= BASE_DATE) {
        day = addDays(day, 1);
        if (isWeekend(day)) continue;
        if (rng() < 0.45) continue;
        const hours = Math.min(
          budget - spentHours,
          1 + randomInt(rng, 6) * 0.5,
        );
        if (hours <= 0) break;
        timeEntryId += 1;
        timeEntries.push({
          id: timeEntryId,
          project: { id: project.id, name: project.name },
          issue: { id },
          user: asNamed(assignee ?? author),
          activity: pick(rng, ACTIVITIES),
          hours: Math.round(hours * 4) / 4,
          comments: '',
          spent_on: day,
          created_on: atNoon(day),
          updated_on: atNoon(day),
        });
        spentHours += hours;
      }
    }

    const lastJournal = journals.at(-1);
    issues.push({
      id,
      project: { id: project.id, name: project.name },
      tracker,
      status,
      priority,
      author: asNamed(author),
      assigned_to: assignee ? asNamed(assignee) : undefined,
      fixed_version: version
        ? { id: version.id, name: version.name }
        : undefined,
      subject: subjectOf(rng, tracker.id),
      description: `${project.name}の${tracker.name}。再現手順と期待動作は説明欄に記載する。`,
      start_date: startDate,
      due_date: dueDate,
      done_ratio: doneRatio,
      estimated_hours: estimatedHours,
      spent_hours: Math.round(spentHours * 4) / 4,
      created_on: atNoon(addDays(startDate, -2)),
      updated_on: lastJournal?.created_on ?? atNoon(startDate),
      journals,
    });
  }

  // ── 依存関係（🟦 ガントの線。一覧の include でも取れる）───────────────
  let relationId = 900;
  for (let index = 0; index + 1 < issues.length; index += 7) {
    const from = issues[index];
    const to = issues[index + 1];
    if (!from || !to) continue;
    relationId += 1;
    relations.push({
      id: relationId,
      issue_id: from.id,
      issue_to_id: to.id,
      relation_type: 'precedes',
      delay: randomInt(rng, 4),
    });
  }

  return {
    projects: [...PROJECTS],
    users: [...USERS],
    versions,
    issues,
    timeEntries,
    relations,
  };
}
