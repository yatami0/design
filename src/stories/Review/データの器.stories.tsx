// 工程2 — ★ 検体（手順書 D11=B）。**画面ではない。**
//
// この story だけが「取得する側」を持つ。目的は 2 つ:
//   ① MSW が**本当に介在していること**を、目で見える形で残す（Q4）
//   ② 編集（PUT）の結果が**残ること**を、往復の実測として残す（Q2・K3）
//
// 🟥 **既存の 4 story は触っていない。**部品の story は props 直渡しのまま
//    （部品は取得を持たない・手順書 D4=B）。画面を組むのは工程3。
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  DataGrid,
  type DataGridColumn,
} from '@/components/DataDisplay/DataGrid';
import { StatusPill } from '@/components/DataDisplay/StatusPill';
import { Section } from '@/components/Layout/Section';
import { Stack } from '@/components/Layout/Stack';
import { resetDb } from '@/mocks/db';
import { fetchIssue, fetchIssues, updateIssue } from '@/redmine/client';
import type { Issue, Page } from '@/redmine/model';

const meta = {
  title: '★ Review/データの器（MSW）',
  // 🟦 own: 検証用の検体。部品ではない
  tags: ['own'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const columns: DataGridColumn<Issue>[] = [
  {
    key: 'id',
    header: 'ID',
    accessor: (row) => row.displayId,
    kind: 'numeric',
  },
  {
    key: 'subject',
    header: '件名',
    accessor: (row) => row.subject,
    emphasis: true,
  },
  {
    key: 'status',
    header: '状態',
    // ★ コアの `StatusPill` は tone しか知らない。Redmine の status id → tone の
    //    対応表は題材側（src/redmine/convert.ts）にある（データモデル §6）
    accessor: (row) => (
      <StatusPill tone={row.status.tone}>{row.status.name}</StatusPill>
    ),
  },
  {
    key: 'assignee',
    header: '担当',
    accessor: (row) => row.assignee?.name ?? '—',
  },
  {
    key: 'due',
    header: '期限',
    accessor: (row) => row.dueDate ?? '—',
    kind: 'numeric',
  },
  {
    key: 'done',
    header: '進捗',
    accessor: (row) => `${String(row.doneRatio)}%`,
    kind: 'numeric',
  },
];

/** 🟥 取得は story の loader が持つ。部品には 1 行も入れない。 */
export const FetchList: Story = {
  // 表示名は日本語、export 名は PascalCase（storybook/prefer-pascal-case）
  name: '一覧を取得する',
  loaders: [
    async () => {
      resetDb();
      return { page: await fetchIssues({ limit: 10, include: 'relations' }) };
    },
  ],
  render: (_args, { loaded }) => {
    const { page } = loaded as { page: Page<Issue> };
    return (
      <Stack gap="md" inset="md">
        <Section heading="MSW から取得したチケット">
          <p className="text-label text-muted-foreground">
            総件数 {page.totalCount} 件のうち {page.items.length} 件を表示（
            <code>GET /redmine/issues.json?limit=10</code>）。 🟥 既定の{' '}
            <code>status_id</code> は <code>open</code> なので、
            終了・却下は数に入っていない（Redmine の既定挙動）。
          </p>
          <DataGrid data={page.items} columns={columns} />
        </Section>
      </Stack>
    );
  },
};

interface RoundTrip {
  label: string;
  before: string;
  after: string;
}

const roundTripColumns: DataGridColumn<RoundTrip>[] = [
  {
    key: 'label',
    header: '項目',
    accessor: (row) => row.label,
    emphasis: true,
  },
  {
    key: 'before',
    header: '編集前',
    accessor: (row) => row.before,
    kind: 'numeric',
  },
  {
    key: 'after',
    header: '取り直した後',
    accessor: (row) => row.after,
    kind: 'numeric',
  },
];

/**
 * ★ K3（Q2）— **PUT の結果が残るか**。
 * 🟥 「残った」ことが目で見えるのは、**編集前と編集後を両方描いている**から。
 *    片方だけ出す作りにすると、残っていなくても絵は成立してしまう（＝「対象 0 件で緑」の形）。
 */
export const EditAndRefetch: Story = {
  name: '編集して取り直す',
  loaders: [
    async () => {
      resetDb();
      const page = await fetchIssues({ limit: 1, include: 'relations' });
      const target = page.items[0];
      if (!target)
        throw new Error('検体が取れなかった（ハンドラが当たっていない）');

      const before = await fetchIssue(target.id);
      await updateIssue(target.id, {
        done_ratio: 95,
        status_id: 2,
        subject: `${before.subject}（編集済み）`,
        notes: '工程2 の検体から更新した',
      });
      const after = await fetchIssue(target.id);
      return { before, after };
    },
  ],
  render: (_args, { loaded }) => {
    const { before, after } = loaded as {
      before: Awaited<ReturnType<typeof fetchIssue>>;
      after: Awaited<ReturnType<typeof fetchIssue>>;
    };
    const rows: RoundTrip[] = [
      { label: 'ID', before: before.displayId, after: after.displayId },
      { label: '件名', before: before.subject, after: after.subject },
      {
        label: '状態',
        before: before.status.name,
        after: after.status.name,
      },
      {
        label: '進捗',
        before: `${String(before.doneRatio)}%`,
        after: `${String(after.doneRatio)}%`,
      },
      {
        label: '変更履歴の件数',
        before: String(before.events.length),
        after: String(after.events.length),
      },
    ];
    return (
      <Stack gap="md" inset="md">
        <Section heading="PUT → 取り直し（インメモリに残るか）">
          <p className="text-label text-muted-foreground">
            <code>PUT /redmine/issues/:id.json</code> を 1 回打ってから
            <code>GET</code> し直した結果。**右の列が動いていれば Q2 = yes**。
          </p>
          <DataGrid data={rows} columns={roundTripColumns} />
        </Section>
      </Stack>
    );
  },
};
