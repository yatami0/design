// 手4 H4-04 — TanStack Table との組み合わせ部品。
//
// 🟨 **ジェネリック部品は `component:` を meta に置けなかった**（Q8 の続報）。
//    `DataGrid<TData, TValue>` の型引数が `unknown` に潰れて args が合わなくなるため、
//    `component` を省いて `render` で書いている。自作 7 件で取れた雛形の**例外 1 件目**。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  DataGrid,
  type DataGridColumn,
} from '@/components/DataDisplay/DataGrid';
import { issues, type Issue } from '@/lib/fixtures/issues';

const columns: DataGridColumn<Issue>[] = [
  { key: 'id', header: 'ID', accessor: (row) => row.id },
  { key: 'subject', header: '件名', accessor: (row) => row.subject },
  { key: 'assignee', header: '担当者', accessor: (row) => row.assignee },
];

// 手8d H8D-05: 宣言的な列オプション（`kind` / `emphasis`）の実例。
// 🟥 **書式クラスは 1 文字も出てこない**——それがこの API の狙い（設計 §3.2）。
const declarativeColumns: DataGridColumn<Issue>[] = [
  { key: 'id', header: 'ID', accessor: (row) => row.id, kind: 'numeric' },
  {
    key: 'subject',
    header: '件名',
    accessor: (row) => row.subject,
    emphasis: true,
  },
  { key: 'assignee', header: '担当者', accessor: (row) => row.assignee },
  {
    key: 'updatedAt',
    header: '更新',
    accessor: (row) => row.updatedAt.slice(0, 16).replace('T', ' '),
    kind: 'numeric',
  },
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

/**
 * 列の種別と強調を**宣言で**指定する（手8d H8D-05）。
 * `kind: 'numeric'` が等幅を、`emphasis` が強調 weight を部品側で当てる。
 */
export const DeclarativeColumns: Story = {
  render: () => <DataGrid data={issues} columns={declarativeColumns} />,
};
