import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent } from 'storybook/test';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/Overlay/DropdownMenu';
import { Button } from '@/components/Action/Button';
import {
  FOCUS_TRAPPED_A11Y,
  expectFocusTrapped,
  expectOpened,
  triggerOf,
} from '../opened';

/**
 * 🟥 この部品は typecheck ベースラインの赤 1 件の出どころ
 * （`dropdown-menu.tsx:94` / `exactOptionalPropertyTypes`。DR-0014）。
 * 未決 #1 が決まるまで build は赤のまま。**story では CheckboxItem を使わない**ことで回避している。
 */
const meta = {
  title: '② 素材層/Overlay/DropdownMenu',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

const menu = (
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
);

export const Default: Story = {
  render: () => menu,
};

/**
 * 🆕 **開いた状態**（部品4 C4-02・D2=B）。
 *
 * ★★★ 🟥 **この story を書くまで、`DropdownMenuContent` の中身は 1 度も検査されていなかった**
 * （[DR-0096](../../../docs/DR/DR-0096-overlays-that-no-story-opens-are-invisible-to-every-check.md)）。
 * `Default` はトリガを描くだけで、**閉じた menu は DOM を持たない**＝ axe の対象が 0 件。
 *
 * ★ **開き方は `play` でトリガを操作する**（`open` prop で静的に描かない）——
 * **「開いた絵」ではなく「トリガが実際に開くこと」まで測る**（D2=B）。
 * 🟥 この repo は「型は通るが作用しない」を 3 回踏んでいる（DR-0090 / DR-0089 / 部品2 の `Slider`）。
 *
 * ★★★ 🟥 **開いた初回に `aria-hidden-focus`（serious）で落ちた**（K2・実測）。
 * Radix は modal な menu を開くと `hideOthers()` で **document の残り全部を `aria-hidden` にする**が、
 * **`role="menu"` は axe の `isModalOpen()`（`[role=dialog]` しか見ない）に引っかからない**ので、
 * **隠された側に残るトリガが「到達できる focusable」として違反になる。**
 * 🟦 **実際には閉じ込められている**（`tab` ×3 で 1 度も外へ出ない）——
 * **rule を外す代わりに、それを `expectFocusTrapped` で直接測る**（D7=C）。
 */
export const Open: Story = {
  parameters: FOCUS_TRAPPED_A11Y,
  render: () => menu,
  play: async ({ canvasElement }) => {
    await userEvent.click(triggerOf(canvasElement, 'dropdown-menu-trigger'));
    const content = await expectOpened('dropdown-menu-content');
    await expectFocusTrapped(content);
  },
};

/**
 * 🆕 ★★★ **入れ子メニューを開いた状態**（部品4 C4-04）。
 *
 * 🟥 **この story は「人が名指ししたリスト」からは出てこなかった。**
 * [DR-0096](../../../docs/DR/DR-0096-overlays-that-no-story-opens-are-invisible-to-every-check.md) が挙げた 4 件にも、
 * 部品4 の着手前実測（§1.1）が挙げた 3 件にも `dropdown-menu-sub-content` は無い——
 * **`tools/opened-overlay-check.mjs` を書いて初めて 7 件目として出た。**
 * ★★ **「射程の外」を目で数えると、目に入る粒度でしか数えられない**（部品4 Q3）。
 *
 * 🟨 `DropdownMenuSubContent` は**別の portal**なので、親の menu を開いただけでは DOM に出ない。
 */
export const SubMenuOpen: Story = {
  parameters: FOCUS_TRAPPED_A11Y,
  render: () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">操作</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>編集</DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>担当者を変更</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>山田</DropdownMenuItem>
            <DropdownMenuItem>佐藤</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(triggerOf(canvasElement, 'dropdown-menu-trigger'));
    const content = await expectOpened('dropdown-menu-content');
    await userEvent.click(triggerOf(content, 'dropdown-menu-sub-trigger'));
    await expectOpened('dropdown-menu-sub-content');
  },
};
