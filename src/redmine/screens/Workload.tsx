'use client';

// 題材（Redmine）— 稼働表（工程5・段取りの 5 画面のうち 3 枚目）
//
// 🟥 **出荷しない。**`src/index.ts` から export せず、dist にも入れない（K5）。
// 🟥 **閲覧だけ。**編集も予定列（capacity）も作らない——
//    capacity と非稼働日は Redmine の API に無い（[データモデル §欠落 ④]）ので、
//    作れば「モックは実 API が返せるものしか返さない」（DR-0086）を破る。
//
// ★★ **この画面は D1=B の検体**——「まず `DataGrid` で組み、破れた項目を列挙してから決める」。
//    🟥 **書けたかどうかではなく、書けたものが読めるかを見る**（手順書 Q1）。
import { useState } from 'react';

import {
  PivotTable,
  type PivotCell,
  type PivotColumn,
  type PivotRow,
} from '@/components/DataDisplay/PivotTable';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/Navigation/Breadcrumb';
import {
  PeriodSelect,
  type PeriodPreset,
  type PeriodRange,
} from '@/components/Selection/PeriodSelect';
import { EmptyState } from '@/patterns/EmptyState';
import { FilterBar, FilterField } from '@/patterns/FilterBar';
import { PageHeader } from '@/patterns/PageHeader';
import { AppShell, type NavItem } from '@/templates/AppShell';

import { periodToSpentOnParams, resolvePeriod } from '../period';
import { useWorkload } from '../useWorkload';
import { foldWorkload, isNonWorkday, toIntensity } from '../workload';

const NAV: NavItem[] = [
  { key: 'issues', label: 'チケット' },
  { key: 'gantt', label: 'ガント' },
  { key: 'evm', label: 'EVM' },
  { key: 'workload', label: '稼働表', active: true },
];

/** `YYYY-MM-DD` → 列見出し（`8/10`）。桁を詰めるのは列が 90 本まで伸びるから。 */
function toColumnLabel(date: string): string {
  const [, month, day] = date.split('-');
  return `${String(Number(month))}/${String(Number(day))}`;
}

/** 時間の表示。0 は空欄にする（**稼働が無い日と 0 時間を同じに見せない**）。 */
function toHours(hours: number | undefined): string {
  return hours === undefined ? '' : String(hours);
}

export interface WorkloadProps {
  /** 検体（story）が「今日」を固定するための口。実画面では省略して実時刻を使う。 */
  today?: Date;
  /** 検体が初期プリセットを差し替える口（K6 の 90 列は `thisQuarter`）。 */
  initialPreset?: PeriodPreset;
}

export function Workload({ today, initialPreset = 'thisWeek' }: WorkloadProps) {
  const [preset, setPreset] = useState<PeriodPreset>(initialPreset);
  const [range, setRange] = useState<PeriodRange | undefined>(undefined);
  const now = today ?? new Date();

  const spentOn = periodToSpentOnParams(preset, range, now);
  const { entries, totalCount, pageCount, loading, error } = useWorkload({
    ...(spentOn === undefined ? {} : spentOn),
    enabled: spentOn !== undefined,
  });

  // 🟥 **列の軸は範囲から引く**（データからではない・workload.ts のコメント）。
  //    `all` のときは範囲が無く、**ピボットが組めない**（工程5 の実測・下の EmptyState）。
  const resolved: PeriodRange | undefined =
    preset === 'all'
      ? undefined
      : preset === 'custom'
        ? range
        : resolvePeriod(preset, now);

  const matrix =
    resolved === undefined || entries === undefined
      ? undefined
      : foldWorkload(entries, resolved);

  // ── 列（🟨 `PivotTable` は畳まない。列の並びも題材が決める）──────────────
  //    末尾に合計列を足す。**合計「行」は footer で出す**（行の意味を壊さない・D10=B）。
  const columns: PivotColumn[] =
    matrix === undefined
      ? []
      : [
          ...matrix.dates.map((date): PivotColumn => ({
            key: date,
            header: toColumnLabel(date),
            // ★ 列単位の強弱（`DataGrid` では出せなかった 4 点目）
            ...(isNonWorkday(date) ? { muted: true } : {}),
          })),
          { key: 'total', header: '合計' },
        ];

  const rows: PivotRow[] =
    matrix === undefined
      ? []
      : matrix.rows.map((row) => {
          const cells = new Map<string, PivotCell>();
          for (const date of matrix.dates) {
            const hours = row.hoursByDate.get(date);
            if (hours === undefined) continue;
            // ★ どのセルが濃いかは題材が決める。コアが知るのは語だけ（D2=B）
            cells.set(date, {
              value: toHours(hours),
              intensity: toIntensity(hours),
            });
          }
          cells.set('total', { value: String(row.total) });
          return { key: String(row.user.id), header: row.user.name, cells };
        });

  // ★ 合計行（`DataGrid` に footer の概念が無く出せなかった 3 点目）
  const footer: PivotRow | undefined =
    matrix === undefined
      ? undefined
      : {
          key: 'total',
          header: '合計',
          cells: new Map<string, PivotCell>([
            ...matrix.dates.map((date): [string, PivotCell] => [
              date,
              { value: toHours(matrix.totalByDate.get(date)) },
            ]),
            ['total', { value: String(matrix.total) }],
          ]),
        };

  return (
    <AppShell brand="Redmine 検証" nav={NAV}>
      <PageHeader
        title="稼働表"
        breadcrumb={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>基幹システム刷新</BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbPage>稼働表</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
      <FilterBar>
        <FilterField label="期間（作業日）">
          <PeriodSelect
            value={preset}
            onValueChange={setPreset}
            {...(range === undefined ? {} : { range })}
            onRangeChange={setRange}
          />
        </FilterField>
      </FilterBar>
      {error !== undefined && (
        <EmptyState title="読み込みに失敗した" description={error} />
      )}
      {error === undefined && resolved === undefined && (
        // 🟥 **一覧には無かった状態。**一覧は「絞らない」で成立するが、
        //    ピボットは列の軸を範囲から引くので、範囲が無いと表そのものが組めない。
        <EmptyState
          title="期間を選ぶ"
          description="稼働表は日ごとの列を持つので、期間を決めないと表が組めない。"
        />
      )}
      {error === undefined && resolved !== undefined && (
        <PivotTable
          columns={columns}
          rows={rows}
          corner="担当"
          {...(footer === undefined || rows.length === 0 ? {} : { footer })}
          scrollLabel="稼働表（横スクロール）"
          empty={
            <EmptyState
              title={loading ? '読み込み中' : '稼働が無い'}
              description={
                loading
                  ? '取得しています。'
                  : 'この期間に記録された作業時間が無い。'
              }
            />
          }
        />
      )}
      {/* 🟥 K1 の証拠を画面に出す（機械が読む口）。総和が API の申告と合っているか。 */}
      {matrix !== undefined && totalCount !== undefined && (
        <p data-testid="workload-audit">
          {`件数 ${String(entries?.length ?? 0)} / 申告 ${String(totalCount)} ・ ページ ${String(pageCount ?? 0)} ・ 合計 ${String(matrix.total)} h ・ 列 ${String(matrix.dates.length)} ・ 行 ${String(matrix.rows.length)}`}
        </p>
      )}
    </AppShell>
  );
}
