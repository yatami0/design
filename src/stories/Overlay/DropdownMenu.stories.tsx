import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

/**
 * 🟥 この部品は typecheck ベースラインの赤 1 件の出どころ
 * （`dropdown-menu.tsx:94` / `exactOptionalPropertyTypes`。DR-0014）。
 * 未決 #1 が決まるまで build は赤のまま。**story では CheckboxItem を使わない**ことで回避している。
 */
const meta = {
  title: 'Overlay/DropdownMenu',
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">操作</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>チケット操作</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>編集</DropdownMenuItem>
        <DropdownMenuItem>担当者を変更</DropdownMenuItem>
        <DropdownMenuItem variant="destructive">削除</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
