import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/Communication/Empty';
import { Button } from '@/components/Action/Button';

/**
 * 思想③ Patterns 層の「空状態」を、shadcn は部品として供給している（部品カタログ 表1）。
 * PoC の architecture.md §3.6 が「loading / error / empty を 1 回書いて使い回す」としている対象。
 */
const meta = {
  title: 'Communication/Empty',
  component: Empty,
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>チケットがありません</EmptyTitle>
        <EmptyDescription>
          条件を変えて検索するか、新しく作成してください。
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline">チケットを作成</Button>
      </EmptyContent>
    </Empty>
  ),
};
