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
import { expectFocusTrapped, expectOpened } from '../opened';

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

/**
 * 開いた状態を既定にした story（手5 では閉じている部品は判定できない）。
 *
 * 🆕 **部品4 C4-02（D4=C）で主張を足した。**この story は 2026-07-27 から開いているが、
 * **「開いている」ことを主張していなかった**ので、`defaultOpen` を外しても
 * バーは通ってしまう（面① は canvas に残るトリガでも通る）。
 *
 * ★★ 🟥 **部品4 D9 の判断は 1 度外した。**当初「`DialogTrigger` を描いていないので
 * `aria-hidden` の中に focusable は無い＝ フォーカスの主張は不要（D9=B）」と決めたが、
 * **D8=B で incomplete を数え始めたら `aria-hidden-focus` が 2 件出た**
 * （Radix 自身の `data-radix-focus-guard` の `<span>`＝ `tabindex=0` を持つ）。
 * → **D9 を A に訂正した**。★ **「対象 0 件」の判定を、violations だけを見て下していた。**
 */
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
  play: async () => {
    const content = await expectOpened('dialog-content');
    await expectFocusTrapped(content);
  },
};
