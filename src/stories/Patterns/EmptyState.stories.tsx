// 手4 H4-05 — ③ Patterns 層。🟨 Q4 の反例候補（足し算で書ける）。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/Action/Button';
import { EmptyState } from '@/patterns/EmptyState';

const meta = {
  title: 'Patterns/EmptyState',
  component: EmptyState,
  tags: ['own'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'チケットがありません',
    description: '条件を変えて検索するか、新しいチケットを作成してください。',
    action: <Button>新規チケット</Button>,
  },
};
