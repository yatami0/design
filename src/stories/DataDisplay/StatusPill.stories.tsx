// 手4 H4-06 — 自作。shadcn の Badge に success / warning と色ドットが無いため。
import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusPill } from '@/components/DataDisplay/StatusPill';
import { Inline } from '@/components/Layout/Inline';

const meta = {
  title: '② 製品層・自作/DataDisplay/StatusPill',
  component: StatusPill,
  tags: ['own'],
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTones: Story = {
  args: { tone: 'neutral', children: '新規' },
  render: () => (
    <Inline gap="md">
      <StatusPill tone="neutral">新規</StatusPill>
      <StatusPill tone="warning">進行中</StatusPill>
      <StatusPill tone="success">解決</StatusPill>
      <StatusPill tone="danger">失敗</StatusPill>
    </Inline>
  ),
};
