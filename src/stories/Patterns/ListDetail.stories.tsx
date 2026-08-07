// 手5 案1 — 棚の穴を塞ぐ（1/2）。
// ③ Patterns 層で唯一 story が無かった部品。手4 で作ったが棚に並べていなかったため、
// **③ 層の追従を目視できない状態**だった（→ Storybookの設計と目視観点.md §3）。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/Action/Button';
import {
  DataGrid,
  type DataGridColumn,
} from '@/components/DataDisplay/DataGrid';
import {
  StatusPill,
  type StatusTone,
} from '@/components/DataDisplay/StatusPill';
import { Stack } from '@/components/Layout/Stack';
import { EmptyState } from '@/patterns/EmptyState';
import { ListDetail } from '@/patterns/ListDetail';
import { useListDetail } from '@/patterns/useListDetail';
import { issues, type Issue, type IssueStatus } from '@/lib/fixtures/issues';

const meta = {
  title: '③ Patterns/ListDetail',
  // 🟦 own: ③ 層の自作。DR-0039 の条件（状態を持つ／複数カテゴリをまたぐ）を両方満たす
  tags: ['own'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const STATUS_LABEL: Record<IssueStatus, string> = {
  new: '新規',
  inProgress: '進行中',
  resolved: '解決',
  closed: '却下',
};

const STATUS_TONE: Record<IssueStatus, StatusTone> = {
  new: 'neutral',
  inProgress: 'warning',
  resolved: 'success',
  closed: 'neutral',
};

const columns: DataGridColumn<Issue>[] = [
  { key: 'id', header: 'ID', accessor: (row) => row.id, kind: 'numeric' },
  {
    key: 'subject',
    header: '件名',
    accessor: (row) => row.subject,
    emphasis: true,
  },
  {
    key: 'status',
    header: 'ステータス',
    accessor: (row) => (
      <StatusPill tone={STATUS_TONE[row.status]}>
        {STATUS_LABEL[row.status]}
      </StatusPill>
    ),
  },
  { key: 'assignee', header: '担当者', accessor: (row) => row.assignee },
];

/**
 * 行を押すと詳細が右からスライドする（tmp-admin §4.4「行アクション列を持たない」）。
 *
 * 🟥 **目視の観点**: シートが開いたときの
 * ① スクリムの濃さ（観点 F・10% → 40%）
 * ② overlay の blur が消えているか（観点 E・V1）
 * ③ シートの角丸（観点 B・`rounded-xl` → 18px）
 */
export const Default: Story = {
  render: function Render() {
    const state = useListDetail<Issue>();
    return (
      <ListDetail
        state={state}
        list={
          <DataGrid
            data={issues}
            columns={columns}
            onRowSelect={state.select}
          />
        }
        title={(item) => item.subject}
        detail={(item) => (
          <Stack gap="sm">
            <span className="text-label text-muted-foreground">{item.id}</span>
            <StatusPill tone={STATUS_TONE[item.status]}>
              {STATUS_LABEL[item.status]}
            </StatusPill>
            <span className="text-body">担当: {item.assignee}</span>
          </Stack>
        )}
      />
    );
  },
};

/** 空状態。③ 層が ② 層のラッパー（EmptyState）をそのまま受けられることの確認。 */
export const Empty: Story = {
  render: function Render() {
    const state = useListDetail<Issue>();
    return (
      <ListDetail
        state={state}
        list={
          <DataGrid
            data={[]}
            columns={columns}
            onRowSelect={state.select}
            empty={
              <EmptyState
                title="チケットがありません"
                description="条件を変えて検索するか、新しいチケットを作成してください。"
                action={<Button>新規チケット</Button>}
              />
            }
          />
        }
        title={(item) => item.subject}
        detail={() => null}
      />
    );
  },
};
