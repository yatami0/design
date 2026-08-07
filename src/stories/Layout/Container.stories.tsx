// 手3 H3-04 — 製品層の自作部品。最大幅と中央寄せ。H3-03 で語彙を新設した箇所（Q1）。
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Container } from '@/components/Layout/Container';

const meta = {
  title: '② 製品層・自作/Layout/Container',
  component: Container,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { width: 'content', gutter: true },
  render: (args) => (
    <Container {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
    </Container>
  ),
};
