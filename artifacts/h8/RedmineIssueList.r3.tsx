// 手8 H8-05 — `artifacts/h7/RedmineIssueList-r3.dc.html`（手7 の 3 周目）を TSX へ機械翻訳したもの。
//
// 🟥 これは検体であって製品ではない。手8 の Q3・Q5 を測るためだけに存在する。
// 🟥 翻訳で赤を消していない。元の `.dc.html` にあった禁止語彙は同じ数だけ残してある。
//
// 適用した変換規則は r1 と同一（手順書 §2.2 の 5 本）。
// 判断を挟んだ点（手順書 §2.10）:
//   D10 hint-size は落とした（元の出現数 27）／ D11 <style> は残した／ D12 import は @/index
//
// 1 周目との差（手7 の 2・3 周目で動いた変数）:
//   - Box + `bg-card rounded-md border` の手組み → Card / CardContent
//   - Button の variant 切り替えチップ → Select / SelectTrigger / SelectItem
//   - `w-48` → `w-field-md`（DR-0061 で足した語彙）
//   - `<style>` に `a { color: var(--primary) }` が増えた（面 ④・DR-0060）

import * as React from 'react';

import {
  AppProviders,
  AppShell,
  Button,
  Card,
  CardContent,
  Container,
  DataGrid,
  EmptyState,
  Inline,
  Label,
  Section,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Stack,
  StatusPill,
} from '@/index';

const ISSUES = [
  {
    id: 1042,
    subject: 'ログイン後にダッシュボードが空になる',
    status: '進行中',
    priority: '高',
    assignee: '佐藤 健',
    updated: '2026/07/31',
  },
  {
    id: 1041,
    subject: 'チケット検索のページャが 2 ページ目で崩れる',
    status: '新規',
    priority: '通常',
    assignee: '田中 美咲',
    updated: '2026/07/31',
  },
  {
    id: 1038,
    subject: 'CSV エクスポートの文字化け（Shift_JIS）',
    status: '解決',
    priority: '通常',
    assignee: '鈴木 亮',
    updated: '2026/07/30',
  },
  {
    id: 1035,
    subject: 'メール通知が二重に送信される',
    status: '進行中',
    priority: '緊急',
    assignee: '佐藤 健',
    updated: '2026/07/30',
  },
  {
    id: 1031,
    subject: 'ガントチャートの祝日表示を追加したい',
    status: '新規',
    priority: '低',
    assignee: '山本 涼子',
    updated: '2026/07/29',
  },
  {
    id: 1029,
    subject: 'ファイル添付の上限を 50MB に引き上げ',
    status: '却下',
    priority: '低',
    assignee: '鈴木 亮',
    updated: '2026/07/28',
  },
  {
    id: 1024,
    subject: 'ワークフロー設定画面の保存が遅い',
    status: '進行中',
    priority: '高',
    assignee: '田中 美咲',
    updated: '2026/07/28',
  },
  {
    id: 1019,
    subject: 'サブプロジェクトのチケットが親に集計されない',
    status: '新規',
    priority: '通常',
    assignee: '山本 涼子',
    updated: '2026/07/27',
  },
  {
    id: 1013,
    subject: 'REST API のトークン再発行手順をドキュメント化',
    status: '解決',
    priority: '低',
    assignee: '佐藤 健',
    updated: '2026/07/25',
  },
  {
    id: 1008,
    subject: 'カスタムフィールドの並び替えができない',
    status: '却下',
    priority: '通常',
    assignee: '鈴木 亮',
    updated: '2026/07/24',
  },
  {
    id: 1002,
    subject: 'リポジトリ連携でコミットが取り込まれない',
    status: '進行中',
    priority: '高',
    assignee: '山本 涼子',
    updated: '2026/07/23',
  },
  {
    id: 996,
    subject: 'ロール権限のコピー機能',
    status: '新規',
    priority: '通常',
    assignee: '田中 美咲',
    updated: '2026/07/22',
  },
];

const TONE: Record<string, 'neutral' | 'warning' | 'success' | 'danger'> = {
  新規: 'neutral',
  進行中: 'warning',
  解決: 'success',
  却下: 'danger',
};

interface Props {
  showFilters?: boolean;
  defaultStatus?: string;
}

interface State {
  status: string;
  assignee: string;
}

export class RedmineIssueListR3 extends React.Component<Props, State> {
  state: State = { status: 'all', assignee: 'all' };
  private touched = false;

  clear() {
    this.touched = true;
    this.setState({ status: 'all', assignee: 'all' });
  }

  render() {
    const h = React.createElement;

    const status =
      this.props.defaultStatus && this.state.status === 'all' && !this.touched
        ? this.props.defaultStatus
        : this.state.status;
    const assignee = this.state.assignee;

    const rows = ISSUES.filter(
      (r) =>
        (status === 'all' || r.status === status) &&
        (assignee === 'all' || r.assignee === assignee)
    );

    const cell = (v: React.ReactNode, cls?: string) =>
      h('span', { className: cls ?? 'text-table' }, v);

    const columns = [
      {
        accessorKey: 'id',
        header: 'ID',
        cell: (c: { row: { original: (typeof ISSUES)[number] } }) =>
          cell(
            '#' + String(c.row.original.id),
            'text-table tabular-nums text-muted-foreground'
          ),
      },
      {
        accessorKey: 'subject',
        header: '題名',
        cell: (c: { row: { original: (typeof ISSUES)[number] } }) =>
          cell(c.row.original.subject, 'text-table'),
      },
      {
        accessorKey: 'status',
        header: 'ステータス',
        cell: (c: { row: { original: (typeof ISSUES)[number] } }) =>
          h(
            StatusPill,
            { tone: TONE[c.row.original.status] ?? 'neutral' },
            c.row.original.status
          ),
      },
      {
        accessorKey: 'priority',
        header: '優先度',
        cell: (c: { row: { original: (typeof ISSUES)[number] } }) => {
          const p = c.row.original.priority;
          return cell(
            p,
            p === '緊急' || p === '高'
              ? 'text-table text-emphasis'
              : 'text-table text-muted-foreground'
          );
        },
      },
      {
        accessorKey: 'assignee',
        header: '担当者',
        cell: (c: { row: { original: (typeof ISSUES)[number] } }) =>
          cell(c.row.original.assignee),
      },
      {
        accessorKey: 'updated',
        header: '更新日',
        cell: (c: { row: { original: (typeof ISSUES)[number] } }) =>
          cell(
            c.row.original.updated,
            'text-table tabular-nums text-muted-foreground'
          ),
      },
    ];

    const emptyNode = h(EmptyState, {
      title: '条件に合うチケットがありません',
      description: '絞り込み条件を変更するか、新しいチケットを作成してください。',
      action: h(
        Button,
        {
          size: 'sm',
          variant: 'outline',
          onClick: () => {
            this.clear();
          },
        },
        '条件をクリア'
      ),
    });

    const nav = [
      { key: 'issues', label: 'チケット', active: true },
      { key: 'projects', label: 'プロジェクト' },
      { key: 'settings', label: '設定' },
    ];
    const assignees = Array.from(new Set(ISSUES.map((r) => r.assignee)));
    const countLabel =
      String(rows.length) +
      ' 件' +
      (rows.length !== ISSUES.length
        ? '（全 ' + String(ISSUES.length) + ' 件中）'
        : '');
    const showFilters = this.props.showFilters ?? true;
    const setStatus = (v: string) => {
      this.touched = true;
      this.setState({ status: v });
    };
    const setAssignee = (v: string) => {
      this.setState({ assignee: v });
    };

    return (
      <AppProviders>
        {/* D11: helmet の <style>（逸脱の面 ④）。3 周目で a{} が増えた */}
        <style>{`html,body{margin:0;padding:0;height:100%}a{color:var(--primary)}a:hover{opacity:.8}`}</style>
        <AppShell brand="Redmine" nav={nav}>
          <Container width="wide" gutter={true}>
            <Section heading="チケット一覧" gap="md">
              <Inline justify="between" align="center">
                <span className="text-label text-muted-foreground">
                  {countLabel}
                </span>
                <Button>新規チケット</Button>
              </Inline>

              {showFilters && (
                <Card>
                  <CardContent>
                    <Inline gap="md" align="end" wrap={true}>
                      <Stack gap="sm">
                        <Label>ステータス</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger className="w-field-md">
                            <SelectValue placeholder="ステータス" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">すべて</SelectItem>
                            <SelectItem value="新規">新規</SelectItem>
                            <SelectItem value="進行中">進行中</SelectItem>
                            <SelectItem value="解決">解決</SelectItem>
                            <SelectItem value="却下">却下</SelectItem>
                          </SelectContent>
                        </Select>
                      </Stack>

                      <Stack gap="sm">
                        <Label>担当者</Label>
                        <Select value={assignee} onValueChange={setAssignee}>
                          <SelectTrigger className="w-field-md">
                            <SelectValue placeholder="担当者" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">すべて</SelectItem>
                            {assignees.map((person) => (
                              <SelectItem key={person} value={person}>
                                {person}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </Stack>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          this.clear();
                        }}
                      >
                        条件をクリア
                      </Button>
                    </Inline>
                  </CardContent>
                </Card>
              )}

              <DataGrid data={rows} columns={columns} empty={emptyNode} />
            </Section>
          </Container>
        </AppShell>
      </AppProviders>
    );
  }
}
