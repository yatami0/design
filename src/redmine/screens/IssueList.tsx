'use client';

// 題材（Redmine）— チケット一覧（工程3 D1=A・段取りの「最短で画面が見える点」）
//
// 🟥 **出荷しない。**`src/index.ts` から export せず、dist にも入れない（K5）。
// 🟥 コアは製品層の窓口からだけ import する（素材層の直 import は D11 の lint が止める）。
// 🟨 この画面が持つのは**題材の知識だけ**——何で絞るか（ステータスの選択肢）、
//    どの列を出すか、既定の並び順。見た目の指定（幅・間隔・折返し）は 1 つも
//    書かないのが Q1 の合格条件。
import { useState } from 'react';

import {
  DataGrid,
  type DataGridColumn,
} from '@/components/DataDisplay/DataGrid';
import { StatusPill } from '@/components/DataDisplay/StatusPill';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/Navigation/Breadcrumb';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/Navigation/Pagination';
import {
  PeriodSelect,
  type PeriodPreset,
  type PeriodRange,
} from '@/components/Selection/PeriodSelect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Selection/Select';
import { EmptyState } from '@/patterns/EmptyState';
import { FilterBar, FilterField } from '@/patterns/FilterBar';
import { PageHeader } from '@/patterns/PageHeader';
import { AppShell, type NavItem } from '@/templates/AppShell';

import type { Issue } from '../model';
import { periodToQuery } from '../period';
import { useIssues } from '../useIssues';

/**
 * ステータス絞り込みの選択肢（★ 対応表）。「未完了 = open」という翻訳は
 * Redmine の知識なので画面が持つ。コアの Select は語を知らない。
 */
const STATUS_OPTIONS = [
  { value: 'open', label: '未完了' },
  { value: 'closed', label: '完了' },
  { value: '*', label: 'すべて' },
] as const;

const NAV: NavItem[] = [
  { key: 'issues', label: 'チケット', active: true },
  { key: 'gantt', label: 'ガント' },
  { key: 'evm', label: 'EVM' },
  { key: 'workload', label: '稼働表' },
];

const PAGE_SIZE = 10;

/** 一覧の列定義（題材の知識）。書式（等幅・強調）はコアの語彙で宣言する。 */
const COLUMNS: DataGridColumn<Issue>[] = [
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

export interface IssueListProps {
  /** 検体（story）が「今日」を固定するための口。実画面では省略して実時刻を使う。 */
  today?: Date;
}

export function IssueList({ today }: IssueListProps) {
  const [statusId, setStatusId] = useState<string>('open');
  const [preset, setPreset] = useState<PeriodPreset>('all');
  const [range, setRange] = useState<PeriodRange | undefined>(undefined);
  const [offset, setOffset] = useState(0);

  const updatedOn = periodToQuery(preset, range, today ?? new Date());
  const { page, loading, error } = useIssues({
    statusId,
    ...(updatedOn === undefined ? {} : { updatedOn }),
    sort: 'updated_on:desc',
    offset,
    limit: PAGE_SIZE,
  });

  const total = page?.totalCount ?? 0;
  const hasPrev = offset > 0;
  const hasNext = offset + PAGE_SIZE < total;

  return (
    <AppShell brand="Redmine 検証" nav={NAV}>
      <PageHeader
        title="チケット一覧"
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>基幹システム刷新</BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>チケット</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <FilterBar>
        <FilterField label="ステータス">
          <Select
            value={statusId}
            onValueChange={(next) => {
              setStatusId(next);
              setOffset(0);
            }}
          >
            <SelectTrigger width="md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="期間（更新日）">
          <PeriodSelect
            value={preset}
            onValueChange={(next) => {
              setPreset(next);
              setOffset(0);
            }}
            {...(range === undefined ? {} : { range })}
            onRangeChange={(next) => {
              setRange(next);
              setOffset(0);
            }}
          />
        </FilterField>
      </FilterBar>
      {error !== undefined && (
        <EmptyState title="読み込みに失敗した" description={error} />
      )}
      {error === undefined && (
        <DataGrid
          data={page?.items ?? []}
          columns={COLUMNS}
          empty={
            <EmptyState
              title={loading ? '読み込み中' : 'チケットが無い'}
              description={
                loading ? '取得しています。' : '絞り込みに合うチケットが無い。'
              }
            />
          }
        />
      )}
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              aria-disabled={!hasPrev}
              onClick={(event) => {
                event.preventDefault();
                if (hasPrev) setOffset(Math.max(0, offset - PAGE_SIZE));
              }}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              href="#"
              aria-disabled={!hasNext}
              onClick={(event) => {
                event.preventDefault();
                if (hasNext) setOffset(offset + PAGE_SIZE);
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </AppShell>
  );
}
