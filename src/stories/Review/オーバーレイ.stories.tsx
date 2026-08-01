// 手5 案2 — 判定軸カタログ（観点 E・F）。
// blur を消し（V1）、スクリムを 10% → 40% にした。この 2 つはセットで見る必要がある——
// **blur を消した以上、奥行きはスクリムの濃さだけで作ることになる。**
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Viewpoint } from './_spec';

import { Button } from '@/components/Action/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/Overlay/Dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/Overlay/Sheet';
import { Stack } from '@/components/Layout/Stack';

const meta = {
  title: '★ Review/E·F オーバーレイ',
  tags: ['review'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 🟥 **開いてから見る観点が 4 つある。**
 *
 * 1. **blur が消えているか**（観点 E・V1「blur を使わない。奥行きは 3 層の面で作る」）
 *    — 背後のテキストがぼけずに読めれば成功。`--blur-xs: 0px` が効いている。
 * 2. **スクリムの濃さ**（観点 F）— 10% → **40%**。4 倍暗い。管理画面としてくどくないか。
 * 3. **奥行きが読めるか** — 1 と 2 はトレードオフ。blur を捨てた分をスクリムが背負えているか。
 * 4. **開閉アニメーションが生きているか** — スクリムをレイヤ外から上書きしたが、
 *    潰したのは `background-color` だけなのでフェードは無傷のはず（代償①＝0 の確認）。
 */
export const Default: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Viewpoint obs="EF" />
      <Stack gap="md">
        <p className="text-body">
          背後のテキスト。オーバーレイを開いたときに
          <b className="font-emphasis">これがぼけずに読めれば</b>
          V1「blur を使わない」が成立している。素の shadcn では
          <code className="font-mono text-label">backdrop-blur-xs</code>{' '}
          が効いて 4px ぼけていた。
        </p>
        <p className="text-body text-muted-foreground">
          あわせてスクリムの濃さを見る。10% から 40% へ上げたので、この段落が
          どれくらい沈むかが観点 F の答えになる。
        </p>

        <div className="flex flex-wrap gap-inline-md">
          <Dialog>
            <DialogTrigger asChild>
              <Button>Dialog を開く</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>スクリムと blur の確認</DialogTitle>
                <DialogDescription>
                  背後がぼけていなければ V1
                  は成立。スクリムが濃すぎないかを見る。 角丸は rounded-xl →
                  18px（apple l）になっているはず。
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Sheet を開く</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>右スライドの詳細</SheetTitle>
                <SheetDescription>
                  影は shadow-lg → apple --shadow-2（0 8px 30px）。 一覧 +
                  詳細（③ 層 ListDetail）で実際に使う形。
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </div>
      </Stack>
    </div>
  ),
};
