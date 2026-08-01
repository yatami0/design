import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/Overlay/Sheet';
import { Button } from '@/components/Action/Button';

/**
 * tmp-admin 4.1 は「詳細は右スライドシートで出す」と規定しており、この部品が受け皿になる。
 * 🟥 ただし幅は `sm:max-w-sm` の直書きで、tmp-admin の `--panel-width: 460px` は写す先が無い
 *    （トークンマッピング 2.4）。
 */
const meta = {
  title: '② 素材層/Overlay/Sheet',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
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
