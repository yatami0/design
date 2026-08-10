// 題材（Redmine）— 稼働の畳み込み（工程5 D3=B・Q4）
//
// ★★ **[DR-0092](../../docs/DR/DR-0092-the-core-holds-the-vessel-not-the-state.md)
//    「コアは器を持ち、状態は持たない」の 2 度目の適用。**
//    工程4 は「編集の状態」で答えたが、集計は状態ではない。
//    [DR-0088](../../docs/DR/DR-0088-core-subject-boundary-is-decided-by-two-questions.md) の 2 問を当てた:
//      ① 「行 × 列に畳む」は Redmine を知らない repo でも意味が通る（**コア候補**）
//      ② 🟥 **何を畳むかは有限の語で言えない**（稼働・工数・件数・金額…無限）
//    → **コアは畳まない。**畳むのはここ（題材）で、コアが受け取るのは畳んだ結果だけ。
//
// 🟥 **列の軸はデータからではなく「範囲」から引く。**
//    データに現れた日だけを列にすると、**稼働 0 の日が表から消える**——
//    「空の表」と「絞り込み結果 0 件の表」が見た目で区別できなくなる（手順書 §0.1 の警戒）。
import { eachDayOfInterval, format, isWeekend, parseISO } from 'date-fns';

import type { PivotIntensity } from '@/components/DataDisplay/PivotTable';
import type { PeriodRange } from '@/components/Selection/PeriodSelect';

import type { Person, TimeEntry } from './model';

/** 1 人ぶんの行。`hoursByDate` の key は `YYYY-MM-DD`。 */
export interface WorkloadRow {
  user: Person;
  /** 🟥 稼働のあった日だけが入る。無い日は `undefined`（0 とは区別する）。 */
  hoursByDate: ReadonlyMap<string, number>;
  /** 行の合計。 */
  total: number;
}

export interface WorkloadMatrix {
  /** 列の軸。🟥 **範囲から引く**（データからではない）。`YYYY-MM-DD` の昇順。 */
  dates: string[];
  rows: WorkloadRow[];
  /** 列の合計。key は `dates` の要素。 */
  totalByDate: ReadonlyMap<string, number>;
  /** 総合計。🟥 **K1 はこれと API の `hours` の総和を突き合わせる。** */
  total: number;
  /** 単一セルの最大値。濃淡の正規化に使う（D2）。稼働が 1 件も無ければ 0。 */
  max: number;
}

/**
 * ★ **どのセルが「濃い」かを決めるのは題材。**コアの `PivotTable` は
 * `low` / `mid` / `high` / `peak` という**語**しか知らない（工程3 D3=C と同じ形の 3 例目）。
 *
 * 🟨 **閾値は稼働表の都合**——1 日 8 時間を満稼働と見て 4 等分した。
 *    「線形か対数か」「何段か」はここで決まり、コアには漏れない。
 */
export function toIntensity(hours: number): PivotIntensity {
  if (hours <= 0) return 'none';
  if (hours < 2) return 'low';
  if (hours < 4) return 'mid';
  if (hours < 6) return 'high';
  return 'peak';
}

/** 土日か。🟨 非稼働日は Redmine の API に無い（データモデル §欠落 ④）ので曜日で代用する。 */
export function isNonWorkday(date: string): boolean {
  return isWeekend(parseISO(date));
}

/** `YYYY-MM-DD` の一覧を範囲から作る（両端含む）。 */
export function eachDate(range: PeriodRange): string[] {
  return eachDayOfInterval({ start: range.from, end: range.to }).map((day) =>
    format(day, 'yyyy-MM-dd'),
  );
}

/**
 * `TimeEntry[]` → 人 × 日。
 *
 * 🟨 **行に出るのは「範囲内に稼働のある人」だけ**——`/users.json` は引かない。
 *    全ユーザーを並べると「その期間に 1 時間も付けていない人」の空行が出るが、
 *    それは**稼働可能時間（capacity）を持てて初めて意味を持つ行**で、
 *    [データモデル §欠落 ④](../../docs/データモデル.md) のとおり Redmine の API に capacity は無い。
 * 🟨 行の並びはユーザー id 昇順（表示名の照合順は環境依存で、決定論を壊す）。
 */
export function foldWorkload(
  entries: TimeEntry[],
  range: PeriodRange,
): WorkloadMatrix {
  const dates = eachDate(range);
  const inRange = new Set(dates);

  const users = new Map<number, Person>();
  const cells = new Map<number, Map<string, number>>();
  const totalByDate = new Map<string, number>();
  let total = 0;
  let max = 0;

  for (const entry of entries) {
    // 🟥 範囲の外は捨てる。API 側で絞っていても、**畳み込みが列の軸と合っているか**は
    //    ここでしか担保できない（列に無い日の時間を総和に入れると K1 がずれる）。
    if (!inRange.has(entry.spentOn)) continue;

    users.set(entry.user.id, entry.user);
    let row = cells.get(entry.user.id);
    if (row === undefined) {
      row = new Map<string, number>();
      cells.set(entry.user.id, row);
    }
    const next = (row.get(entry.spentOn) ?? 0) + entry.hours;
    row.set(entry.spentOn, next);
    totalByDate.set(
      entry.spentOn,
      (totalByDate.get(entry.spentOn) ?? 0) + entry.hours,
    );
    total += entry.hours;
    if (next > max) max = next;
  }

  const rows: WorkloadRow[] = [...users.entries()]
    .sort(([a], [b]) => a - b)
    .map(([id, user]) => {
      const hoursByDate = cells.get(id) ?? new Map<string, number>();
      let rowTotal = 0;
      for (const hours of hoursByDate.values()) rowTotal += hours;
      return { user, hoursByDate, total: rowTotal };
    });

  return { dates, rows, totalByDate, total, max };
}
