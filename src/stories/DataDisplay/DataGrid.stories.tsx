// 手4 H4-04 — TanStack Table との組み合わせ部品。
//
// 🟨 **ジェネリック部品は `component:` を meta に置けなかった**（Q8 の続報）。
//    `DataGrid<TData, TValue>` の型引数が `unknown` に潰れて args が合わなくなるため、
//    `component` を省いて `render` で書いている。自作 7 件で取れた雛形の**例外 1 件目**。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ColumnDef } from '@tanstack/react-table';

import { DataGrid } from '@/components/DataDisplay/DataGrid';
import { issues, type Issue } from '@/lib/fixtures/issues';

const columns: ColumnDef<Issue, never>[] = [
  { accessorKey: 'id', header: 'ID' },
  { accessorKey: 'subject', header: '件名' },
  { accessorKey: 'assignee', header: '担当者' },
];

const meta = {
  title: '② 製品層・自作/DataDisplay/DataGrid',
  tags: ['own'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <DataGrid data={issues} columns={columns} />,
};
