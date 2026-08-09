import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/Display/Avatar';
import { Stack } from '@/components/Layout/Stack';

/**
 * 部品2 C2-04 — [完成バー](../../../docs/部品の完成バー.md) 面③ を**最初から**置く。
 *
 * 🟨 **`avatar` は 1 部品ではなく 6 パーツで降ってきた**
 * （`Avatar` / `AvatarImage` / `AvatarFallback` / `AvatarBadge` / `AvatarGroup` / `AvatarGroupCount`）。
 * 思想が挙げているのは `Avatar` 1 語だけ——**shadcn のほうが細かい。**
 *
 * | 面 | 扱い |
 * | --- | --- |
 * | `default` / `loading` / `empty` / `overflow` | ★ story で持つ（`loading`・`empty` はどちらも fallback に落ちる） |
 * | `hover` | 🟨 **対象外**——ポインタに反応しない |
 * | `focus-visible` | 🟨 **対象外**——フォーカスを受けない |
 * | `disabled` | 🟨 **対象外**——無効状態を持たない |
 * | `invalid` | 🟨 **対象外**——入力を受けない |
 */
const meta = {
  title: '② 素材層/Display/Avatar',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Avatar,
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 🟥 画像が読めるまでは `AvatarFallback` が出る。**story では画像を読ませない**——
 * 外部 URL を踏むと「絵が出るかどうかがネットワーク次第」になり、story が判定装置でなくなる。
 */
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>山田</AvatarFallback>
    </Avatar>
  ),
};

/**
 * 語彙 prop `size`（**面④**）— `sm` / `default` / `lg` の 3 語。
 *
 * ★ **`play` で実効値を読む**（[DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md)）。
 * 🟥 **`SelectTrigger` の 3 語は sm > lg の逆転を起こしていた**——**単調性まで測る。**
 */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-inline-md">
      <Avatar size="sm" data-testid="av-sm">
        <AvatarFallback>小</AvatarFallback>
      </Avatar>
      <Avatar data-testid="av-md">
        <AvatarFallback>中</AvatarFallback>
      </Avatar>
      <Avatar size="lg" data-testid="av-lg">
        <AvatarFallback>大</AvatarFallback>
      </Avatar>
    </div>
  ),
  // 🟥 **`waitFor` が要る**（部品2 C2-05 の実測）——同期に測ると CSS が当たる前の
  //    **16px（文字幅）**を読み、**正しい部品を落とす。**
  play: async ({ canvasElement }) => {
    const width = (id: string) =>
      canvasElement
        .querySelector(`[data-testid="${id}"]`)
        ?.getBoundingClientRect().width;
    // size-6 / size-8 / data-[size=lg]:size-10
    await waitFor(async () => {
      await expect(width('av-sm')).toBe(24);
    });
    await expect(width('av-md')).toBe(32);
    await expect(width('av-lg')).toBe(40);
    // 🟥 単調性（sm < default < lg）。`SelectTrigger` はここで逆転していた
    await expect(width('av-sm')).toBeLessThan(width('av-md') ?? 0);
    await expect(width('av-md')).toBeLessThan(width('av-lg') ?? 0);
  },
};

/**
 * 面③ — `loading` と `empty` の両方が **fallback に落ちる**。
 * 🟥 **絵が同じなので、この 2 つは story では区別できない**（面③ が機械で持てない例）。
 */
export const States: Story = {
  render: () => (
    <Stack gap="sm">
      <div className="flex items-center gap-inline-md">
        {/* 読めない src = loading の失敗後（fallback） */}
        <Avatar>
          <AvatarImage src="/does-not-exist.png" alt="読み込めない画像" />
          <AvatarFallback>失敗</AvatarFallback>
        </Avatar>
        {/* src を渡さない = empty */}
        <Avatar>
          <AvatarFallback>空</AvatarFallback>
        </Avatar>
      </div>
    </Stack>
  ),
};

/** 面③ `overflow` — 束ねたときに件数へ畳む（`AvatarGroup` / `AvatarGroupCount`） */
export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarFallback>佐藤</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>鈴木</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>高橋</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+7</AvatarGroupCount>
    </AvatarGroup>
  ),
};
