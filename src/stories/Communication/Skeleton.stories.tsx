import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Skeleton } from '@/components/Communication/Skeleton';

// 思想は Skeleton を Communication に置いている（読み込み中の伝達）。
const meta = {
  title: 'Communication/Skeleton',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Skeleton,
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};

/** 一覧の読み込み中（手4 で使う形） */
export const TableRows: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-sm">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  ),
};
