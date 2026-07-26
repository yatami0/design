import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Separator } from '@/components/Display/Separator';

// 思想の Divider に対応（部品カタログ 表1）。色は --border ← tmp-admin の --color-separator。
const meta = {
  title: 'Display/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="text-body">上</p>
      <Separator className="my-2" />
      <p className="text-body">下</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-inline-md">
      <span className="text-body">左</span>
      <Separator orientation="vertical" />
      <span className="text-body">右</span>
    </div>
  ),
};
