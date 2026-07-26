// 手3 H3-04 — 製品層の自作部品。🟨 唯一 className を受ける逃げ道。使用箇所数が枠の健全性の指標になる。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Box } from '@/components/Layout/Box';

const meta = {
  title: 'Layout/Box',
  component: Box,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { inset: 'md' },
  render: (args) => (
    <Box {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
    </Box>
  ),
};
