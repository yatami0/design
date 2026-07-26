// 手3 H3-04 — 製品層の自作部品。明示的な空き。children を取らない。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Spacer } from '@/components/Layout/Spacer';

const meta = {
  title: '② 製品層・自作/Layout/Spacer',
  component: Spacer,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { size: 'lg' },
  render: (args) => (
    <div className="bg-muted/40">
      <div className="bg-muted p-inset-sm text-body">上</div>
      <Spacer {...args} />
      <div className="bg-muted p-inset-sm text-body">下</div>
    </div>
  ),
};
