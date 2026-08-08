// 工程4 D6/D7=A — ② 製品層・自作。項目名と値の対。
//
// 🟨 story を置くのは見せるためだけではない——**`/design-sync` はカードを story から作る**。
//    工程3 は `FilterField` に story が無く、**そのぶんだけカードが落ちた**（実測）。
import type { Meta, StoryObj } from '@storybook/react-vite';

import { DescriptionList } from '@/components/DataDisplay/DescriptionList';
import { StatusPill } from '@/components/DataDisplay/StatusPill';

const meta = {
  title: '② 製品層・自作/DataDisplay/DescriptionList',
  component: DescriptionList,
  tags: ['own'],
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  {
    key: 'status',
    term: '状態',
    // 値は「部品合成の口」——`StatusPill` を差せる（合成方針 §8-4）
    description: <StatusPill tone="warning">進行中</StatusPill>,
  },
  { key: 'assignee', term: '担当', description: '山田 太郎' },
  { key: 'due', term: '期限', description: '2026-09-30' },
  { key: 'done', term: '進捗', description: '55%' },
];

/** 既定。1 列・項目名は値の上。 */
export const Default: Story = { args: { items } };

/** 2 段組み。段組みの語彙は 1 / 2 / 3 の 3 語だけ。 */
export const TwoColumns: Story = { args: { items, columns: 2 } };

/** 項目名を左に置く。幅は `--container-field-sm` の語彙で固定する。 */
export const Horizontal: Story = {
  args: { items, orientation: 'horizontal' },
};
