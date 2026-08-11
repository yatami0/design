import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/Overlay/Sheet';
import { Button } from '@/components/Action/Button';
import { expectFocusTrapped, expectOpened, triggerOf } from '../opened';

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

const sheet = (
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
);

export const Default: Story = {
  render: () => sheet,
};

/**
 * 🆕 **開いた状態**（部品4 C4-02・D2=B）。
 *
 * ★★ 🟥 **[DR-0096](../../../docs/DR/DR-0096-overlays-that-no-story-opens-are-invisible-to-every-check.md) の「🟥 推論（未検証）」の検体。**
 * 同 DR は「`Sheet` は Radix の `Dialog` 系なので `SheetTitle` が紐づく見込みだが、**確かめていない**」と書いた。
 * 🟦 **`aria-dialog-name` は実際に出なかった**（`SheetTitle` が `aria-labelledby` に紐づく）。
 *
 * ★★★ 🟥 **ただし「バーが緑」の中身は、通ったのではなかった。**
 * axe を直接走らせると **`violations: 0` ／ `incomplete: aria-hidden-focus/serious/3`**——
 * **`role="dialog"` を見つけた axe が `focusable-modal-open` の判定を放棄している**（実測・C4-03）。
 * 🟥 **`incomplete` は落とす側も数える側も見ていなかった**ので、**「分からない」が緑になっていた。**
 * → **フォーカスが閉じ込められているかは、こちらで測る**（D7=C・`expectFocusTrapped`）。
 * 🟨 **rule 自体は外していない**（`Sheet` は violation を出さないので外す必要が無い）。
 */
export const Open: Story = {
  render: () => sheet,
  play: async ({ canvasElement }) => {
    await userEvent.click(triggerOf(canvasElement, 'sheet-trigger'));
    const content = await expectOpened('sheet-content');
    await expectFocusTrapped(content);
  },
};
