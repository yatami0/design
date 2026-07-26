import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Radix の薄い再輸出で state を持たない（DR-0013）。open は制御 props としてパススルーされる。
const meta = {
  title: 'Selection/Select',
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="ステータス" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="new">新規</SelectItem>
        <SelectItem value="in-progress">進行中</SelectItem>
        <SelectItem value="resolved">解決</SelectItem>
        <SelectItem value="closed">終了</SelectItem>
      </SelectContent>
    </Select>
  ),
};
