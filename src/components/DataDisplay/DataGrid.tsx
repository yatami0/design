'use client';

// 製品層（組み合わせ部品）— 手4 D2（手3 D9=A の繰り越し）／ 手8d H8D-05 で API を作り直した
//
// shadcn の `Table` は素のマークアップだけで、並べ替えも行選択も持たない
// （[部品カタログ 表3]）。TanStack Table と組み合わせて DataGrid にするのが
// 公式の「Data Table」の作り方で、**単一部品ではなく組み立てガイド**として提供されている。
//
// tmp-admin §4.4 の一覧仕様を形として写す（🟥 値は流し込まない。手5 まで既定のまま）:
//   - 行高は `--spacing-row`（60px 相当）／罫線は控えめ／行 hover あり
//   - **行アクション列を持たない**。行そのものを押して詳細シートを開く
//   - 密データ（ID・日時）は等幅で描く
//
// 🟥 **手4 の「密データは呼び出し側が等幅・tabular-nums で描く」は撤回した**（設計 §3.2）。
//    書式の管轄を部品側へ移す。6 周ぶんの語彙外逸脱（`tabular-nums` / `font-emphasis`）は
//    全部この押し出しの帰結だった（面③・DR-0060）。
// 🟥 **TanStack の `ColumnDef` は公開 API から消えた**（DR-0072）。
//    依存パッケージの型を素通しすると、`cell` の任意 JSX の口まで一緒に公開される。
//    → 自層の名前 `DataGridColumn` で出し直し、TanStack は実装詳細へ戻す。
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/DataDisplay/Table';
import { cn } from '@/lib/utils';

/** 列の種別。`numeric` は部品側が等幅を当てる（呼び出し側は書式クラスを書かない）。 */
export type DataGridColumnKind = 'text' | 'numeric';

export interface DataGridColumn<TData> {
  key: string;
  header: React.ReactNode;
  /** セルの中身。部品（StatusPill 等）の合成はここで行う。 */
  accessor: (row: TData) => React.ReactNode;
  /**
   * 列の種別。'numeric'（ID・件数・日時などの密データ）は部品側が等幅を当てる。
   * @default 'text'
   */
  kind?: DataGridColumnKind;
  /** 強調（題名・氏名など、行の主役の列）。部品側が強調書式を当てる。 */
  emphasis?: boolean;
}

export interface DataGridProps<TData> {
  data: TData[];
  columns: DataGridColumn<TData>[];
  /** 行を押したときの動作。渡すと行が `role="button"` になる。 */
  onRowSelect?: (row: TData) => void;
  /** 行が無いときに出すもの（空状態は Pattern 側が持つ）。 */
  empty?: React.ReactNode;
}

// 書式フラグの置き場は TanStack の `meta`——**利用者定義の列情報の公式の口**。
// 型は module augmentation で足す（`as` で読むと契約がコードに残らない）。
declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- 上流の型引数に合わせる必要がある
  interface ColumnMeta<TData extends RowData, TValue> {
    kind?: DataGridColumnKind;
    emphasis?: boolean;
  }
}

/**
 * 種別ごとのセル書式。🟥 **語彙ではなく部品の内部実装**——
 * 利用側が書けるのは `kind: 'numeric'` だけで、クラス名は境界を越えない（手8d D10=(b)）。
 */
const CELL_KIND: Record<DataGridColumnKind, string> = {
  text: '',
  numeric: 'font-mono tabular-nums',
};

export function DataGrid<TData>({
  data,
  columns,
  onRowSelect,
  empty,
}: DataGridProps<TData>) {
  const table = useReactTable({
    data,
    columns: columns.map((column): ColumnDef<TData> => ({
      id: column.key,
      header: () => column.header,
      cell: (ctx) => column.accessor(ctx.row.original),
      meta: {
        ...(column.kind === undefined ? {} : { kind: column.kind }),
        ...(column.emphasis === undefined ? {} : { emphasis: column.emphasis }),
      },
    })),
    getCoreRowModel: getCoreRowModel(),
  });

  const rows = table.getRowModel().rows;
  if (rows.length === 0 && empty !== undefined) return <>{empty}</>;

  const interactive = onRowSelect !== undefined;

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((group) => (
          <TableRow key={group.id}>
            {group.headers.map((header) => (
              // th は weight 400 で控えめ（tmp-admin §4.3）
              <TableHead key={header.id} className="text-label font-normal">
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={row.id}
            // 行アクション列を持たず、行そのものを押す（tmp-admin §4.4）
            {...(interactive
              ? {
                  role: 'button',
                  tabIndex: 0,
                  onClick: () => {
                    onRowSelect(row.original);
                  },
                  onKeyDown: (event: React.KeyboardEvent) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onRowSelect(row.original);
                    }
                  },
                }
              : {})}
            className={cn('h-row', interactive && 'cursor-pointer')}
          >
            {row.getVisibleCells().map((cell) => {
              // セル・ヘッダの基本 typography は**部品の既定**（設計 §3.2）。
              // 呼び出し側が `text-table` を書き足す動機をここで消す。
              const meta = cell.column.columnDef.meta;
              return (
                <TableCell
                  key={cell.id}
                  className={cn(
                    'text-table',
                    CELL_KIND[meta?.kind ?? 'text'],
                    meta?.emphasis === true && 'font-emphasis',
                  )}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
