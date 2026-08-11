'use client';

// 製品層（自作）— ピボット表（工程5 D1=B → 新設 ／ D5=A ／ Q1 の答え）
//
// ★★★ **新設の理由は「書けなかったから」ではない。**`DataGrid` でも組める（実際に組んだ）。
//    🟥 **書けたものが読めなかった**——`DataGrid` で 92 列を組んだときに破れたのは 4 点:
//      ① **セル単位の符号化ができない**。`kind` / `emphasis` は**列単位**で、
//         `accessor` が返せるのは**セルの中身**だけ。`<td>` の面には手が届かない。
//      ② **行ヘッダ（人名）が固定できない**。🟥 実測: 右端までスクロールすると 1 列目は画面外
//         （`tools/pivot-probe.mjs` K6-f）。素材層 `table` は `overflow-x-auto` しか持たない。
//      ③ **合計行が出せない**。`DataGrid` に footer の概念が無く、
//         `data` に混ぜると「行 = 人」という行の意味が壊れる（D10=B）。
//      ④ 🆕 **列ヘッダの強弱が出せない**（土日を落とす等）。`<th>` の書式は部品が固定していて、
//         `DataGridColumn` には列見出しの語彙が 1 つも無い（**予測に無かった 4 点目**）。
//
// 🟥 **[DR-0092](../../../docs/DR/DR-0092-the-core-holds-the-vessel-not-the-state.md) の 2 度目の適用: この部品は畳まない。**
//    受け取るのは**畳んだ結果**だけで、`TimeEntry` も「稼働」も知らない
//    （何を畳むかは有限の語で言えない＝ [DR-0088](../../../docs/DR/DR-0088-core-subject-boundary-is-decided-by-two-questions.md) の 2 問目で落ちる）。
//
// 🟥 **役割 9 カテゴリに席が無い**（DataDisplay = Table, DataGrid, List, Tree, Tag, Statistic, Chart）。
//    工程4 の 3 件（Field / DescriptionList / Timeline）に続く 4 件目 → **指摘 15**。
//    思想は書き換えない（ユーザーの持ち物）。
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/DataDisplay/Table';
import { cn } from '@/lib/utils';

/**
 * ★ **濃淡の語彙（工程5 D2=B）。**利用側が書けるのはこの 5 語だけで、クラス名は境界を越えない
 * （先例: `DataGrid` の `CELL_KIND`・手8d D10=(b)）。
 *
 * 🟥 **段階の刻み方（何段か・線形か対数か）は使う側の都合であって ① 層の語彙ではない**
 *    （[指摘 8](../../../docs/共通コンポーネント思想への指摘.md) が名指ししている当の問題）。
 */
export const PIVOT_INTENSITIES = [
  'none',
  'low',
  'mid',
  'high',
  'peak',
] as const;
export type PivotIntensity = (typeof PIVOT_INTENSITIES)[number];

/**
 * 段階 → 面。🟥 **語彙ではなく部品の内部実装。**
 *
 * ★★ **① 層の色語彙は 1 語も増やしていない。**増やせなかった、が正しい——
 *    `tokens.css` の色は semantic 2 系統（線 2・面 4）で、**段階を持つ色が 1 つも無い**。
 *    しかも面色（`--color-fill-*`）は **tint 1 段として設計されている**（tmp-admin §4.5
 *    「状態 = tint pill + 色ドット」）ので、**段階の素材にならない**
 *    （amber-50 を 30% / 60% にしても白と見分けが付かない）。
 * 🟦 → **段階は「色」ではなく「不透明度」で作り、色は ① 層の `--color-warning` 1 つだけを使う。**
 *    刻み（15 / 30 / 50 / 70 / 100）はこの部品の内部実装。
 */
const CELL_INTENSITY: Record<PivotIntensity, string> = {
  none: '',
  low: 'bg-warning/15',
  mid: 'bg-warning/30',
  high: 'bg-warning/50',
  peak: 'bg-warning/70',
};

export interface PivotColumn {
  key: string;
  header: React.ReactNode;
  /** 列そのものを控えめに描く（土日・期間外など）。 */
  muted?: boolean;
}

export interface PivotCell {
  /** セルの中身。数値の書式は使う側が決める（部品は等幅を当てるだけ）。 */
  value: React.ReactNode;
  /** 濃淡。省略は `none`。 */
  intensity?: PivotIntensity;
}

export interface PivotRow {
  key: string;
  /** 行ヘッダ（人名・分類名など）。🟦 **横スクロールしても固定される。** */
  header: React.ReactNode;
  /**
   * 列 key → セル。無い列は空欄になる。
   * 🟨 **配列ではなく Map** ——92 列の配列は**ずれても目で気づけない**（列の取り違えが無音になる）。
   */
  cells: ReadonlyMap<string, PivotCell>;
}

export interface PivotTableProps {
  columns: PivotColumn[];
  rows: PivotRow[];
  /** 左上の角（行ヘッダ列の見出し）。 */
  corner?: React.ReactNode;
  /** 合計行。🟥 **`rows` に混ぜない**——行の意味（1 行 = 1 対象）を壊さないため。 */
  footer?: PivotRow;
  /** 行が無いときに出すもの（空状態は Pattern 側が持つ）。 */
  empty?: React.ReactNode;
  /** 横スクロールする器の名前（工程5 D9=B）。 */
  scrollLabel?: string;
}

/** 行ヘッダ列の固定。🟥 面が無いと本体が下を通り抜けて読めなくなる。 */
const STICKY_HEADER = 'sticky left-0 z-10 bg-background';

/**
 * ★ 🟥 **`muted` の文字落としは「面が無いとき」だけ**（工程5 D14=A）。
 *
 * `muted`（この列は重要でない）と面（`intensity` のセル ／ 合計行の地）は**独立な軸**で、
 * 重ねると **最も読みにくいのが「重要でない列の、値が大きいセル」**になる——
 * **意味と読みやすさが逆向き。**
 * 🟦 実測でも重ねた組だけが AA 未達で出た
 * （`#8a7d70` on `#ffdfb3` 約 3.2 ／ `#88888d` on `#f9f9fb` 約 3.4・`tools/a11y-scan.mjs`）。
 *
 * @param onSurface 行そのものが地色を持つか（合計行は `tfoot` の地の上にある）
 */
function renderCells(row: PivotRow, columns: PivotColumn[], onSurface = false) {
  return columns.map((column) => {
    const cell = row.cells.get(column.key);
    const intensity = cell?.intensity ?? 'none';
    const painted = onSurface || intensity !== 'none';
    return (
      <TableCell
        key={column.key}
        className={cn(
          'text-table font-mono tabular-nums',
          // ★ セル単位の符号化（`DataGrid` で破れた ①）
          CELL_INTENSITY[intensity],
          column.muted === true && !painted && 'text-muted-foreground',
        )}
      >
        {cell?.value}
      </TableCell>
    );
  });
}

/**
 * 行 × 列の交点を見せる表。**畳み込みは持たない**（畳んだ結果を受け取る）。
 */
export function PivotTable({
  columns,
  rows,
  corner,
  footer,
  empty,
  scrollLabel,
}: PivotTableProps) {
  if (rows.length === 0 && empty !== undefined) return <>{empty}</>;

  return (
    <Table {...(scrollLabel === undefined ? {} : { scrollLabel })}>
      <TableHeader>
        <TableRow>
          <TableHead className={cn('text-label font-normal', STICKY_HEADER)}>
            {corner}
          </TableHead>
          {columns.map((column) => (
            <TableHead
              key={column.key}
              // ★ 列見出しの強弱（`DataGrid` で破れた ④）
              className={cn(
                'text-label font-normal',
                column.muted === true && 'text-muted-foreground',
              )}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.key}>
            <TableHead
              scope="row"
              // ★ 行ヘッダの固定（`DataGrid` で破れた ②）
              className={cn(
                'text-table font-emphasis',
                STICKY_HEADER,
                'whitespace-nowrap',
              )}
            >
              {row.header}
            </TableHead>
            {renderCells(row, columns)}
          </TableRow>
        ))}
      </TableBody>
      {footer !== undefined && (
        // ★ 合計行（`DataGrid` で破れた ③）
        <TableFooter>
          <TableRow>
            <TableHead
              scope="row"
              className={cn(
                'text-table font-emphasis',
                STICKY_HEADER,
                'whitespace-nowrap',
              )}
            >
              {footer.header}
            </TableHead>
            {renderCells(footer, columns, true)}
          </TableRow>
        </TableFooter>
      )}
    </Table>
  );
}
