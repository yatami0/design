'use client';

// 製品層（組み合わせ部品）— 手4 D2（手3 D9=A の繰り越し）
//
// shadcn の `Table` は素のマークアップだけで、並べ替えも行選択も持たない
// （[部品カタログ 表3]）。TanStack Table と組み合わせて DataGrid にするのが
// 公式の「Data Table」の作り方で、**単一部品ではなく組み立てガイド**として提供されている。
//
// tmp-admin §4.4 の一覧仕様を形として写す（🟥 値は流し込まない。手5 まで既定のまま）:
//   - 行高は `--spacing-row`（60px 相当）／罫線は控えめ／行 hover あり
//   - **行アクション列を持たない**。行そのものを押して詳細シートを開く
//   - 密データ（ID・日時）は呼び出し側が等幅・tabular-nums で描く
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
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

export interface DataGridProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  /** 行を押したときの動作。渡すと行が `role="button"` になる。 */
  onRowSelect?: (row: TData) => void;
  /** 行が無いときに出すもの（空状態は Pattern 側が持つ）。 */
  empty?: React.ReactNode;
}

export function DataGrid<TData, TValue>({
  data,
  columns,
  onRowSelect,
  empty,
}: DataGridProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
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
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id} className="text-table">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
