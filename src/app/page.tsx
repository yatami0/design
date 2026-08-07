'use client';

// 手4 H4-06 — チケット一覧。
//
// 🟥 **画面は成果物ではない**（DR-0002）。ここで確かめているのは:
//   Q1 手3 の製品層だけで組み切れるか（素材層への直 import 0 件・Box への逃げ回数）
//   Q3 tmp-admin の一覧仕様が semantic 語彙で書けるか
//   Q4 Pattern / Template が component の足し算では出ないものか
//
// 🟥 **値は流し込まない。**形だけ tmp-admin に合わせ、色も余白も shadcn 既定のまま（手5 で差し替える）。
import { useMemo } from 'react';

import { Button } from '@/components/Action/Button';
import {
  DataGrid,
  type DataGridColumn,
} from '@/components/DataDisplay/DataGrid';
import {
  StatusPill,
  type StatusTone,
} from '@/components/DataDisplay/StatusPill';
import { Inline } from '@/components/Layout/Inline';
import { Section } from '@/components/Layout/Section';
import { Stack } from '@/components/Layout/Stack';
import { EmptyState } from '@/patterns/EmptyState';
import { ListDetail } from '@/patterns/ListDetail';
import { useListDetail } from '@/patterns/useListDetail';
import { AppShell } from '@/templates/AppShell';
import { issues, type Issue, type IssueStatus } from '@/lib/fixtures/issues';

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

/** 表示用の整形だけ。🟦 **書式（等幅）は列の `kind` が持つ**（手8d H8D-05）。 */
function formatUpdatedAt(iso: string): string {
  return iso.slice(0, 16).replace('T', ' ');
}

export default function Home() {
  const detail = useListDetail<Issue>();

  // 🟥 手8d H8D-05 で書き換えた。**書式クラスが 1 つも無い**のがこの手の成果——
  //    以前はここに `font-mono` / `font-mono tabular-nums` を書いていた（面③と同じ形）。
  //    等幅は `kind: 'numeric'`、強調は `emphasis` が部品側で引き取る。
  const columns = useMemo<DataGridColumn<Issue>[]>(
    () => [
      // 機械的識別子は等幅（tmp-admin §4.4「密データは等幅で」）
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
        accessor: (row) => formatUpdatedAt(row.updatedAt),
        kind: 'numeric',
      },
    ],
    [],
  );

  return (
    <AppShell
      brand="Redmine"
      nav={[
        { key: 'issues', label: 'チケット', active: true },
        { key: 'projects', label: 'プロジェクト' },
        { key: 'reports', label: 'レポート' },
      ]}
    >
      <Section heading="チケット一覧" gap="md">
        <Inline justify="between">
          <span className="text-label text-muted-foreground">
            {issues.length} 件
          </span>
          <Button>新規チケット</Button>
        </Inline>

        <ListDetail
          state={detail}
          list={
            <DataGrid
              data={issues}
              columns={columns}
              onRowSelect={detail.select}
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
          detail={(item) => (
            <Stack gap="sm">
              <span className="text-label text-muted-foreground">
                {item.id}
              </span>
              <StatusPill tone={STATUS_TONE[item.status]}>
                {STATUS_LABEL[item.status]}
              </StatusPill>
              <span className="text-body">担当: {item.assignee}</span>
              <span className="text-body font-mono tabular-nums">
                更新: {formatUpdatedAt(item.updatedAt)}
              </span>
            </Stack>
          )}
        />
      </Section>
    </AppShell>
  );
}
