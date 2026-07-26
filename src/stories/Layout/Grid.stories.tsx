// 手3 H3-04 — 製品層の自作部品。格子。columns は値ではなく段組みの定義。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Grid } from '@/components/Layout/Grid';

const meta = {
  title: 'Layout/Grid',
  component: Grid,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { columns: 3, gap: 'md' },
  render: (args) => (
    <Grid {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
      <div className="bg-muted p-inset-sm text-body">4</div>
      <div className="bg-muted p-inset-sm text-body">5</div>
      <div className="bg-muted p-inset-sm text-body">6</div>
    </Grid>
  ),
};
