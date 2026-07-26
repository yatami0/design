import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

/**
 * 🟨 素のマークアップのみ。並べ替え・行選択・列定義は無い（部品カタログ 表1）。
 * DataGrid 相当は TanStack Table との組み合わせで、新規依存の追加可否は未決 #3（手3）。
 *
 * tmp-admin 4.4 は「密データは等幅で（--font-mono）」「桁を比べる数値は tabular-nums」と規定するが、
 * shadcn 側に `--font-mono` の語彙が無い（トークンマッピング 2.3）。手3〜手4 で足す。
 */
const meta = {
  title: 'DataDisplay/Table',
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const rows = [
  {
    id: '#1024',
    subject: 'ログイン画面の表示崩れ',
    status: '進行中',
    assignee: '未割当',
  },
  {
    id: '#1025',
    subject: '検索結果が 0 件になる',
    status: '新規',
    assignee: '田中',
  },
  {
    id: '#1026',
    subject: 'CSV 出力の文字化け',
    status: '解決',
    assignee: '佐藤',
  },
];

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>件名</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>担当</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.id}</TableCell>
            <TableCell>{row.subject}</TableCell>
            <TableCell>
              <Badge variant="secondary">{row.status}</Badge>
            </TableCell>
            <TableCell>{row.assignee}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
