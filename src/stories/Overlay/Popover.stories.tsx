import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/Overlay/Popover';
import { Button } from '@/components/Action/Button';

const meta = {
  title: 'Overlay/Popover',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Popover,
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">絞り込み</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>絞り込み条件</PopoverTitle>
          <PopoverDescription>
            担当者・期限・優先度で絞り込みます。
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};
