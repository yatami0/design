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

// ── 🆕 工程5 D4=A: 2 本目の対応表（`spent_on`）─────────────────────────
//
// ★★ **同じ「今週」が、端点ごとに違うクエリ形に化ける。**
//    一覧（`/issues.json`）は `updated_on=><a|b` の**演算子記法 1 パラメータ**、
//    稼働（`/time_entries.json`）は **`from` / `to` の 2 パラメータ**（実 Redmine もこの形）。
// 🟥 **汎用化しない**（D4 の B を却下した理由）——パラメータの個数も記法も違うので、
//    1 本にまとめると「どちらでもない形」になる。工程3 が `STATUS_OPTIONS` で踏んだ
//    「同じ名前の別物」と同型。
// 🟦 **共通で残るのは `resolvePeriod`（語 → 範囲）まで。**割れるのは「範囲 → クエリ」の 1 段だけ。

/** `time_entries` の絞り込み（両端含む）。`client.ts` の `TimeEntryQuery` の一部。 */
export interface SpentOnParams {
  from: string;
  to: string;
}

/** 範囲 → `spent_on` の `from` / `to`。 */
export function toSpentOnParams(range: PeriodRange): SpentOnParams {
  return {
    from: format(range.from, 'yyyy-MM-dd'),
    to: format(range.to, 'yyyy-MM-dd'),
  };
}

/**
 * 画面の状態から `spent_on` の範囲を組む。
 *
 * 🟥 **`all` は undefined を返す**——一覧では「絞らない」で成立するが、
 *    **ピボットは列の軸を範囲から引くので、範囲が無いと表が組めない**（工程5 の実測）。
 *    どう扱うかは**画面の責務**で、対応表はここでは判断しない。
 */
export function periodToSpentOnParams(
  preset: PeriodPreset,
  customRange: PeriodRange | undefined,
  today: Date,
): SpentOnParams | undefined {
  if (preset === 'all') return undefined;
  if (preset === 'custom') {
    return customRange === undefined ? undefined : toSpentOnParams(customRange);
  }
  return toSpentOnParams(resolvePeriod(preset, today));
}
