// 手5 — ④ Templates 層。**見た目の検証はここが本番。**
//
// 部品を 1 つずつ見ても「面が 3 層になっているか」は分からない。
// tmp-admin §4.1 の chrome / キャンバス / 白カードが**実際に成立しているか**は、
// 中身が詰まった画面でしか判定できない。
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
import { Card, CardContent } from '@/components/Layout/Card';
import { Grid } from '@/components/Layout/Grid';
import { Inline } from '@/components/Layout/Inline';
import { Section } from '@/components/Layout/Section';
import { Stack } from '@/components/Layout/Stack';
import { SidebarProvider } from '@/components/Navigation/Sidebar';
import { EmptyState } from '@/patterns/EmptyState';
import { AppShell } from '@/templates/AppShell';
import { issues, type Issue, type IssueStatus } from '@/lib/fixtures/issues';

const meta = {
  title: '④ Templates/AppShell',
  component: AppShell,
  // 🟦 own: ④ 層の自作。tmp-admin §4.1「面は 3 層」を構造として写したもの
  tags: ['own'],
  parameters: { layout: 'fullscreen' },
  // 🟥 **配線が要る。**AppShell は中で Sidebar を使うので SidebarProvider が要る。
  //    最初これを忘れて story が `useSidebar must be used within a SidebarProvider` で
  //    落ちていたが、**`pnpm build-storybook` は exit 0 だった**（→ DR-0048）。
  //    本体アプリでは `AppProviders`（src/components/providers.tsx）が配っている。
  decorators: [
    (Story) => (
      <SidebarProvider>
        <Story />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof AppShell>;

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
  {
    key: 'updatedAt',
    header: '更新',
    accessor: (row) => row.updatedAt.slice(0, 16).replace('T', ' '),
    kind: 'numeric',
  },
];

const NAV = [
  { key: 'issues', label: 'チケット', active: true },
  { key: 'projects', label: 'プロジェクト' },
  { key: 'reports', label: 'レポート' },
];

/**
 * **面が 3 層になっているかを見る本命。**
 *
 * 🟥 目で確かめたいこと（観点 H・V5）:
 * 1. 濃紺サイドバー（chrome）／グレーのキャンバス／白カード の **3 層が分離して見えるか**
 * 2. **本文側に濃紺が漏れていないか**（on-dark は `--sidebar-*` に隔離されているはず）
 * 3. 一覧の行高が 60px（tmp-admin §4.4）・ID と更新日時が**等幅で桁が揃っているか**
 * 4. ステータスの tint pill が**面の上で沈まず読めるか**
 */
export const Default: Story = {
  args: {
    brand: 'Redmine',
    nav: NAV,
    children: (
      <Section heading="チケット一覧" gap="md">
        <Inline justify="between">
          <span className="text-label text-muted-foreground">
            {issues.length} 件
          </span>
          <Button>新規チケット</Button>
        </Inline>
        <DataGrid data={issues} columns={columns} />
      </Section>
    ),
  },
};

/**
 * カードを並べた面。**白カード（面 3）がキャンバス（面 2）から浮いて見えるか。**
 * 影を apple の 2 段へ潰した影響（観点 C）が、実寸で出るのはここ。
 *
 * 🟥 **`Card` の直下に中身を置かない**（[DR-0053](../../../docs/DR/DR-0053-viewpoints-must-be-answerable-by-eye.md)）。
 *    `card.tsx` の root は `py-(--card-spacing)` しか持たず、**左右の余白は `CardContent` 側**にある。
 *    素の children を直接入れると左右がゼロになり、目視レビューで「カードの左右の余白がない」として出た。
 */
export const CardSurfaces: Story = {
  args: {
    brand: 'Redmine',
    nav: NAV,
    children: (
      <Section heading="ダッシュボード" gap="md">
        <Grid columns={3} gap="md">
          <Card>
            <CardContent>
              <Stack gap="sm">
                <span className="text-label text-muted-foreground">未対応</span>
                <span className="text-heading font-emphasis tabular-nums">
                  12
                </span>
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Stack gap="sm">
                <span className="text-label text-muted-foreground">進行中</span>
                <span className="text-heading font-emphasis tabular-nums">
                  5
                </span>
              </Stack>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Stack gap="sm">
                <span className="text-label text-muted-foreground">
                  今週解決
                </span>
                <span className="text-heading font-emphasis tabular-nums">
                  28
                </span>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Card>
          <CardContent>
            <Stack gap="sm">
              <span className="text-emphasis font-emphasis">最近の更新</span>
              <DataGrid data={issues.slice(0, 3)} columns={columns} />
            </Stack>
          </CardContent>
        </Card>
      </Section>
    ),
  },
};

/** 空状態。**キャンバスだけが残ったとき、面の階層が読めるか。** */
export const Empty: Story = {
  args: {
    brand: 'Redmine',
    nav: NAV,
    children: (
      <Section heading="チケット一覧" gap="md">
        <Inline justify="between">
          <span className="text-label text-muted-foreground">0 件</span>
          <Button>新規チケット</Button>
        </Inline>
        <EmptyState
          title="チケットがありません"
          description="条件を変えて検索するか、新しいチケットを作成してください。"
          action={<Button>新規チケット</Button>}
        />
      </Section>
    ),
  },
};

/**
 * ナビを増やした状態。**nav-item の min-height 44px（DR-0034）が
 * 並んだときに間延びして見えないか。**tmp-admin が 44px を名指しした唯一の箇所。
 */
export const LongNavigation: Story = {
  args: {
    brand: 'Redmine',
    nav: [
      { key: 'issues', label: 'チケット', active: true },
      { key: 'projects', label: 'プロジェクト' },
      { key: 'reports', label: 'レポート' },
      { key: 'gantt', label: 'ガントチャート' },
      { key: 'calendar', label: 'カレンダー' },
      { key: 'news', label: 'ニュース' },
      { key: 'docs', label: '文書' },
      { key: 'files', label: 'ファイル' },
      { key: 'settings', label: '設定' },
    ],
    children: (
      <Section heading="チケット一覧" gap="md">
        <DataGrid data={issues} columns={columns} />
      </Section>
    ),
  },
};
