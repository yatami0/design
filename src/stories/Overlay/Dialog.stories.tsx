import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/Overlay/Dialog';
import { Button } from '@/components/Action/Button';

/**
 * Radix Root の薄い再輸出で **自身は state を持たない**（DR-0013）。
 * 思想の「開閉は useXxxModal() へ」はラッパー無しで成立する——
 * `useXxxModal()` が {open, onOpenChange} を返して <Dialog {...modal}> に渡せばよい。
 *
 * ★ 手5 の判定対象: overlay に `bg-black/10` と `backdrop-blur-xs` を直書きしている。
 *   tmp-admin V1「blur を使わない」「スクリムは --scrim」と衝突し、**トークンでは解けない**（DR-0023 表3 #3）。
 */
const meta = {
  title: '② 素材層/Overlay/Dialog',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Dialog,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">一括更新</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>選択したチケットを更新</DialogTitle>
          <DialogDescription>
            3 件のステータスをまとめて変更します。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost">キャンセル</Button>
          <Button>更新</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

/** 開いた状態を既定にした story（手5 では閉じている部品は判定できない） */
export const Open: Story = {
  render: () => (
    <Dialog defaultOpen>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>開いた状態</DialogTitle>
          <DialogDescription>
            手5 で overlay とスクリムを目視するための story。
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  ),
};
