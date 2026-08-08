// 題材（Redmine）— 期間プリセットの対応表（工程3 D3=C / D14=B）
//
// 🟥 **コアは語彙、題材は対応表**（Q4 の候補規則の 2 例目）。
//    `PeriodSelect` は「今週」という語しか知らない。**いつからいつまでが「今週」か**
//    （週の起点・四半期の定義）と、**Redmine がそれをどう受け取るか**（`><` 演算子記法）は
//    ここが持つ。実 API に繋ぐ日もこのファイルの外は書き換わらない（工程2 Q3 と同じ設計）。
//
// 🟨 週の起点は月曜、四半期は 1-3 / 4-6 / 7-9 / 10-12 に決めた（**この題材の決め**。
//    Redmine の設定 `start_of_week` はユーザー言語依存なので、実 API に繋ぐ日に
//    ここ 1 箇所を合わせる）。
import {
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  format,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
} from 'date-fns';

import type {
  PeriodPreset,
  PeriodRange,
} from '@/components/Selection/PeriodSelect';

/** プリセット → 実際の日付範囲。`all`（絞らない）と `custom`（範囲は外から来る）は対象外。 */
export function resolvePeriod(
  preset: Exclude<PeriodPreset, 'all' | 'custom'>,
  today: Date,
): PeriodRange {
  switch (preset) {
    case 'thisWeek':
      return {
        from: startOfWeek(today, { weekStartsOn: 1 }),
        to: endOfWeek(today, { weekStartsOn: 1 }),
      };
    case 'thisMonth':
      return { from: startOfMonth(today), to: endOfMonth(today) };
    case 'thisQuarter':
      return { from: startOfQuarter(today), to: endOfQuarter(today) };
  }
}

/**
 * 範囲 → Redmine の `updated_on` クエリ値。
 * `><YYYY-MM-DD|YYYY-MM-DD`（両端含む）は Redmine 固有の演算子記法（Rest_Issues wiki）。
 */
export function toUpdatedOnParam(range: PeriodRange): string {
  return `><${format(range.from, 'yyyy-MM-dd')}|${format(range.to, 'yyyy-MM-dd')}`;
}

/** 画面の状態（プリセット ＋ custom の範囲）から `updated_on` を組む。絞らないときは undefined。 */
export function periodToQuery(
  preset: PeriodPreset,
  customRange: PeriodRange | undefined,
  today: Date,
): string | undefined {
  if (preset === 'all') return undefined;
  if (preset === 'custom') {
    return customRange === undefined
      ? undefined
      : toUpdatedOnParam(customRange);
  }
  return toUpdatedOnParam(resolvePeriod(preset, today));
}
