// 手8 H8-05 — `artifacts/h7/RedmineIssueList.dc.html`（手7 の 1 周目）を TSX へ機械翻訳したもの。
//
// 🟥 これは検体であって製品ではない。手8 の Q3・Q5 を測るためだけに存在する。
// 🟥 翻訳で赤を消していない。元の `.dc.html` にあった禁止語彙は同じ数だけ残してある。
//
// 適用した変換規則（手順書 §2.2 の 5 本）:
//   1. <x-import component-from-global-scope="Design.X" …> → <X …>
//   2. ケバブ属性 → キャメル props（class-name → className）
//   3. {{ expr }} → {expr}
//   4. <sc-if value> / <sc-for list as> → {cond && …} / .map()
//   5. <script> の DCLogic クラス → コンポーネント本体。
//      🟥 React.createElement は JSX に書き換えない（lint が見る文脈が変わるため）
// 判断を挟んだ点（手順書 §2.10）:
//   D10 hint-size は落とした（元の出現数 8）／ D11 <style> は残した／ D12 import は @/index

import * as React from 'react';

import {
  AppProviders,
  AppShell,
  Box,
  Button,
  DataGrid,
  EmptyState,
  Inline,
  Section,
  Stack,
  StatusPill,
} from '@/index';

const ISSUES = [
  {
    id: 'REDM-1042',
    subject: 'ログイン後にダッシュボードが白紙になる',
    status: '新規',
    priority: '緊急',
    assignee: '佐藤 健',
    updated: '2026/08/01',
  },
  {
    id: 'REDM-1041',
    subject: 'チケット一覧の並び替えが保存されない',
    status: '進行中',
    priority: '高',
    assignee: '田中 実',
    updated: '2026/08/01',
  },
  {
    id: 'REDM-1038',
    subject: 'CSV エクスポートの文字化け',
    status: '進行中',
    priority: '通常',
    assignee: '鈴木 花子',
    updated: '2026/07/31',
  },
  {
    id: 'REDM-1035',
    subject: 'ガントチャートの祝日表示を追加',
    status: '新規',
    priority: '低',
    assignee: '未割り当て',
    updated: '2026/07/30',
  },
  {
    id: 'REDM-1031',
    subject: 'メール通知が二重に送信される',
    status: '解決',
    priority: '高',
    assignee: '田中 実',
    updated: '2026/07/30',
  },
  {
    id: 'REDM-1028',
    subject: '添付ファイルのサイズ上限を 50MB に',
    status: '却下',
    priority: '通常',
    assignee: '鈴木 花子',
    updated: '2026/07/29',
  },
  {
    id: 'REDM-1024',
    subject: 'プロジェクト切替時にフィルタが残る',
    status: '進行中',
    priority: '通常',
    assignee: '佐藤 健',
    updated: '2026/07/29',
  },
  {
    id: 'REDM-1019',
    subject: 'ワークフロー設定画面の権限チェック漏れ',
    status: '新規',
    priority: '緊急',
    assignee: '未割り当て',
    updated: '2026/07/28',
  },
  {
    id: 'REDM-1015',
    subject: 'API のレスポンスが 5 秒を超える',
    status: '解決',
    priority: '高',
    assignee: '佐藤 健',
    updated: '2026/07/27',
  },
  {
    id: 'REDM-1009',
    subject: 'リポジトリ連携のドキュメント更新',
    status: '解決',
    priority: '低',
    assignee: '鈴木 花子',
    updated: '2026/07/26',
  },
  {
    id: 'REDM-1004',
    subject: 'カスタムフィールドの入力検証を強化',
    status: '却下',
    priority: '低',
    assignee: '田中 実',
    updated: '2026/07/24',
  },
];

const STATUSES = ['新規', '進行中', '解決', '却下'];
const TONE: Record<string, 'neutral' | 'warning' | 'success' | 'danger'> = {
  新規: 'neutral',
  進行中: 'warning',
  解決: 'success',
  却下: 'danger',
};

interface Props {
  brand?: string;
  emptyPreview?: boolean;
}

interface State {
  status: string;
  assignee: string;
}

export class RedmineIssueList extends React.Component<Props, State> {
  state: State = { status: 'all', assignee: 'all' };

  filtered() {
    if (this.props.emptyPreview) return [];
    const { status, assignee } = this.state;
    return ISSUES.filter(
      (i) =>
        (status === 'all' || i.status === status) &&
        (assignee === 'all' || i.assignee === assignee)
    );
  }

  chips(key: 'status' | 'assignee', values: string[]) {
    const cur = this.state[key];
    return [
      { label: 'すべて', value: 'all' },
      ...values.map((v) => ({ label: v, value: v })),
    ].map((o) => ({
      label: o.label,
      variant: cur === o.value ? ('default' as const) : ('outline' as const),
      onClick: () => {
        this.setState({ [key]: o.value } as unknown as State);
      },
    }));
  }

  render() {
    const h = React.createElement;
    const rows = this.filtered();
    const assignees = [...new Set(ISSUES.map((i) => i.assignee))];

    const columns = [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (c: { getValue: () => string }) =>
          h(
            'span',
            { className: 'text-muted-foreground tabular-nums' },
            c.getValue()
          ),
      },
      {
        accessorKey: 'subject',
        header: '題名',
        cell: (c: { getValue: () => string }) =>
          h('span', { className: 'font-emphasis' }, c.getValue()),
      },
      {
        accessorKey: 'status',
        header: 'ステータス',
        cell: (c: { getValue: () => string }) =>
          h(StatusPill, { tone: TONE[c.getValue()] ?? 'neutral' }, c.getValue()),
      },
      {
        accessorKey: 'priority',
        header: '優先度',
        cell: (c: { getValue: () => string }) =>
          h(
            'span',
            {
              className: ['緊急', '高'].includes(c.getValue())
                ? 'font-emphasis'
                : 'text-muted-foreground',
            },
            c.getValue()
          ),
      },
      {
        accessorKey: 'assignee',
        header: '担当者',
        cell: (c: { getValue: () => string }) =>
          h(
            'span',
            {
              className:
                c.getValue() === '未割り当て' ? 'text-muted-foreground' : undefined,
            },
            c.getValue()
          ),
      },
      {
        accessorKey: 'updated',
        header: '更新日',
        cell: (c: { getValue: () => string }) =>
          h(
            'span',
            { className: 'text-muted-foreground tabular-nums' },
            c.getValue()
          ),
      },
    ];

    const emptyState = h(EmptyState, {
      title: '条件に合うチケットがありません',
      description: 'フィルタを解除するか、条件を変えて検索してください。',
      action: h(
        Button,
        {
          variant: 'outline',
          size: 'sm',
          onClick: () => {
            this.setState({ status: 'all', assignee: 'all' });
          },
        },
        'フィルタを解除'
      ),
    });

    const brand = this.props.brand ?? 'Redmine';
    const nav = [
      { key: 'issues', label: 'チケット', active: true },
      { key: 'projects', label: 'プロジェクト' },
      { key: 'settings', label: '設定' },
    ];
    const countLabel = `${String(rows.length)} 件 / 全 ${String(ISSUES.length)} 件`;
    const statusChips = this.chips('status', STATUSES);
    const assigneeChips = this.chips('assignee', assignees);

    return (
      <AppProviders>
        {/* D11: helmet の <style>（逸脱の面 ④） */}
        <style>{`html, body { margin: 0; min-height: 100%; }`}</style>
        <AppShell brand={brand} nav={nav}>
          <Section heading="チケット一覧" gap="md">
            <Inline justify="between" align="center">
              <span className="text-label text-muted-foreground">
                {countLabel}
              </span>
              <Button>新規チケット</Button>
            </Inline>

            <Box inset="md" className="bg-card rounded-md border">
              <Stack gap="sm">
                <Inline gap="sm" align="center" wrap={true}>
                  <span className="text-label text-muted-foreground">
                    ステータス
                  </span>
                  {statusChips.map((chip) => (
                    <Button
                      key={chip.label}
                      variant={chip.variant}
                      size="sm"
                      onClick={chip.onClick}
                    >
                      {chip.label}
                    </Button>
                  ))}
                </Inline>

                <Inline gap="sm" align="center" wrap={true}>
                  <span className="text-label text-muted-foreground">担当者</span>
                  {assigneeChips.map((chip) => (
                    <Button
                      key={chip.label}
                      variant={chip.variant}
                      size="sm"
                      onClick={chip.onClick}
                    >
                      {chip.label}
                    </Button>
                  ))}
                </Inline>
              </Stack>
            </Box>

            <DataGrid data={rows} columns={columns} empty={emptyState} />
          </Section>
        </AppShell>
      </AppProviders>
    );
  }
}
