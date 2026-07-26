// 手3 H3-04 — 製品層の自作部品。横並び。gap は --spacing-inline-* だけを取る。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Inline } from '@/components/Layout/Inline';

const meta = {
  title: 'Layout/Inline',
  component: Inline,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { gap: 'md', align: 'center' },
  render: (args) => (
    <Inline {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
    </Inline>
  ),
};
