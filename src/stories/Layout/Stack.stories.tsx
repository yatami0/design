// 手3 H3-04 — 製品層の自作部品。縦積み。gap は --spacing-stack-* だけを取る。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Stack } from '@/components/Layout/Stack';

const meta = {
  title: 'Layout/Stack',
  component: Stack,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { gap: 'md', inset: 'none' },
  render: (args) => (
    <Stack {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
    </Stack>
  ),
};
