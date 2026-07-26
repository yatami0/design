import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/Action/Button';

// 役割カテゴリ = Action（部品カタログ 表1）
const meta = {
  title: 'Action/Button',
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { children: 'ボタン' } };

/** 手5 の観測対象: default は bg-primary の塗り CTA。tmp-admin V2 と衝突する「形」（DR-0023 表3 #1）。 */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-inline-md">
      <Button variant="default">default</Button>
      <Button variant="outline">outline</Button>
      <Button variant="secondary">secondary</Button>
      <Button variant="ghost">ghost</Button>
      <Button variant="destructive">destructive</Button>
      <Button variant="link">link</Button>
    </div>
  ),
};

/**
 * 🟥 高さは h-6(24px) / h-7(28px) / h-8(32px)。
 * tmp-admin / apple が「不可侵の下限」とした touch-min 44px を全段で割っている（DR-0023）。
 * a11y パネルで確かめられるよう、サイズを並べた story を残す。
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-inline-md">
      <Button size="xs">xs (h-6)</Button>
      <Button size="sm">sm (h-7)</Button>
      <Button size="default">default (h-8)</Button>
      <Button size="lg">lg (h-9)</Button>
    </div>
  ),
};
