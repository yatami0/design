// 手3 H3-04 — 製品層の自作部品。見出し + 本体。typography も semantic な用途名だけを使う。
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Section } from '@/components/Layout/Section';

const meta = {
  title: '② 製品層・自作/Layout/Section',
  component: Section,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { heading: '区画の見出し', gap: 'md' },
  render: (args) => (
    <Section {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
    </Section>
  ),
};
