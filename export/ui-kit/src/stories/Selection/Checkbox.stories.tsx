import type { Meta, StoryObj } from '@storybook/react-vite';

import { Checkbox } from '@/components/Selection/Checkbox';
import { Label } from '@/components/Display/Label';

const meta = {
  title: '② 素材層/Selection/Checkbox',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// 🟥 部品1 B1-05: 素で置くと `role="checkbox"` に名前が無い（axe critical）。
//    States は Label + htmlFor で正しく組んでいたのに、Default だけ裸だった。
export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-inline-sm">
      <Checkbox id="cb-default" />
      <Label htmlFor="cb-default">未対応のみ</Label>
    </div>
  ),
};

/**
 * ★ 手5 の判定対象。checkbox.tsx は `rounded-[4px]`（純粋な生値。DR-0010 の (C)）を持つので、
 * --radius を差し替えても**角丸が変わらない**はず。H2B-07 の予行演習で必ず確認する。
 */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-sm">
      <div className="flex items-center gap-inline-sm">
        <Checkbox id="cb-1" />
        <Label htmlFor="cb-1">未選択</Label>
      </div>
      <div className="flex items-center gap-inline-sm">
        <Checkbox id="cb-2" defaultChecked />
        <Label htmlFor="cb-2">選択済み</Label>
      </div>
      <div className="flex items-center gap-inline-sm">
        <Checkbox id="cb-3" disabled />
        <Label htmlFor="cb-3">無効</Label>
      </div>
    </div>
  ),
};
