import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge } from '@/components/Communication/Badge';

/**
 * tmp-admin V4 は「ステータスは tint pill + 色ドット」と規定するが、
 * shadcn の意味色は `destructive` しか無い（トークンマッピング 2.4）。
 * success / warning と状態 tint 4 種の語彙をいつ足すかは未決 #13。
 *
 * ★ 手5 の判定対象: `focus-visible:ring-[3px]`（純粋な生値。DR-0010 の (C)）。
 */
const meta = {
  title: '② 素材層/Communication/Badge',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Badge,
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: '新規' } };

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-inline-md">
      <Badge variant="default">default</Badge>
      <Badge variant="secondary">secondary</Badge>
      <Badge variant="outline">outline</Badge>
      <Badge variant="destructive">destructive</Badge>
    </div>
  ),
};
