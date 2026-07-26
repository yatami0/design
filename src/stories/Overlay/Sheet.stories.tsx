import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';

/**
 * tmp-admin 4.1 は「詳細は右スライドシートで出す」と規定しており、この部品が受け皿になる。
 * 🟥 ただし幅は `sm:max-w-sm` の直書きで、tmp-admin の `--panel-width: 460px` は写す先が無い
 *    （トークンマッピング 2.4）。
 */
const meta = {
  title: 'Overlay/Sheet',
  component: Sheet,
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">詳細を開く</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>チケット #1024</SheetTitle>
          <SheetDescription>ログイン画面の表示崩れ</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
