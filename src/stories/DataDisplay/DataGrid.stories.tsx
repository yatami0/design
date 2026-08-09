// 手4 H4-04 — TanStack Table との組み合わせ部品。
//
// 🟨 **ジェネリック部品は `component:` を meta に置けなかった**（Q8 の続報）。
//    `DataGrid<TData, TValue>` の型引数が `unknown` に潰れて args が合わなくなるため、
//    `component` を省いて `render` で書いている。自作 7 件で取れた雛形の**例外 1 件目**。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

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
 *
 * ★★ 🆕 **面④（語彙の効果）を機械で閉じた**（部品1 B1-06b）。
 * 🟥 **`kind` は「クラス名が境界を越えない」ことが設計の芯**（手8d D10=(b)）——
 * 利用側は `kind: 'numeric'` としか書けず、`font-mono tabular-nums` は部品の内側にある。
 * ★ **だからこそ、効いているかは利用側からは一切見えない。**
 * **`CELL_KIND` の対応表を 1 語書き換えても、型も lint も story も緑のまま通る。**
 */
export const DeclarativeColumns: Story = {
  render: () => (
    <div data-testid="grid-declarative">
      <DataGrid data={issues} columns={declarativeColumns} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cell = (columnIndex: number) => {
      const found =
        canvasElement.querySelectorAll('tbody tr')[0]?.children[columnIndex];
      if (found === undefined) throw new Error('面④: DataGrid の本体行が無い');
      return getComputedStyle(found);
    };
    await waitFor(async () => {
      await expect(
        canvasElement.querySelectorAll('tbody tr').length,
      ).toBeGreaterThan(0);
    });
    // 🟨 **列の並びは宣言から引く**（添字を story に手で書くと、列を足したとき黙ってずれる）
    const indexOf = (key: string) =>
      declarativeColumns.findIndex((column) => column.key === key);
    const numeric = indexOf('updatedAt');
    const text = indexOf('assignee');
    const emphasized = indexOf('subject');
    // 🟥 `numeric` は等幅 ＋ 桁揃え、`text` はどちらも付かない
    await expect(cell(numeric).fontFamily.toLowerCase()).toContain('mono');
    await expect(cell(numeric).fontVariantNumeric).toContain('tabular-nums');
    await expect(cell(text).fontFamily.toLowerCase()).not.toContain('mono');
    await expect(cell(text).fontVariantNumeric).not.toContain('tabular-nums');
    // `emphasis` は weight の語彙（`--font-weight-emphasis`）
    await expect(cell(emphasized).fontWeight).toBe(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--font-weight-emphasis')
        .trim(),
    );
    await expect(cell(text).fontWeight).not.toBe(cell(emphasized).fontWeight);
  },
};
