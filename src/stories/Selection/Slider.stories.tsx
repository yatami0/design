import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Label } from '@/components/Display/Label';
import { Slider } from '@/components/Selection/Slider';
import { Stack } from '@/components/Layout/Stack';

/**
 * 部品2 C2-04 — [完成バー](../../../docs/部品の完成バー.md) 面③ を**最初から**置く。
 *
 * | 面 | 扱い |
 * | --- | --- |
 * | `default` / `hover` / `focus-visible` / `disabled` | ★ story で持つ（thumb は `hover:ring-3` を持つ） |
 * | `invalid` | 🟨 **対象外**——`slider.tsx` は `aria-invalid` のスタイルを 1 つも持たない |
 * | `loading` | 🟨 **対象外**——非同期を持たない |
 * | `empty` | 🟨 **対象外**——データを受けない（`value` は数の配列） |
 * | `overflow` | 🟨 **対象外**——文字を持たない |
 */
const meta = {
  title: '② 素材層/Selection/Slider',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor', 'wrapped'],
  component: Slider,
  // 🟥 `label` は必須（部品2 D8=A）。各 story は render で上書きするが、
  //    **必須 prop があると meta 側に args が要る**——型が「名前を省けない」ことを機械で言っている。
  args: { label: '値' },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 🟥 thumb は `span[role="slider"]` で、**`<label>` で包んでも名前が付かない**
 * （`<label>` の暗黙の関連付けは labelable な要素にしか届かない＝ `button` は届くが `span` は届かない）。
 * ★ **`aria-label` を Root に渡しても届かなかった**——これがバーで落ちた 2 件の正体（部品2 D8）。
 * → 製品層の `Slider` は **`label` を必須**にして、素材側で thumb まで運ぶ。
 */
export const Default: Story = {
  render: () => (
    <div className="w-64">
      <Slider defaultValue={[40]} max={100} step={1} label="進捗率" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const thumb = canvasElement.querySelector('[role="slider"]');
    // 面④: `label` が **thumb まで届いた**こと（Root に載っただけでは 0 点）
    await expect(thumb?.getAttribute('aria-label')).toBe('進捗率');

    // 🟥 **CSS が当たるまで待つ。**同期に読むと `rgba(0, 0, 0, 0)`（未適用）で、
    //    明暗の比較が「どちらも透明」になり**成立しないのに成立して見える**（部品2 C2-05 の実測）。
    await waitFor(async () => {
      await expect(getComputedStyle(thumb as Element).backgroundColor).not.toBe(
        'rgba(0, 0, 0, 0)',
      );
    });

    // 🟥 素材の thumb は `bg-white`（テーマを持たない不透明色）だった。
    //    `bg-background` に直したので、**`.dark` の下では白でなくなる**はず。
    //    明順では両者が同じ白なので、**暗い側で測らないと差が出ない**——
    //    「効果まで測れる claim は測る」（/design-sync 2026-08-09 の作法）。
    const light = getComputedStyle(thumb as Element).backgroundColor;
    canvasElement.classList.add('dark');
    const dark = getComputedStyle(thumb as Element).backgroundColor;
    canvasElement.classList.remove('dark');
    await expect(dark).not.toBe(light);
  },
};

/**
 * 2 つ摘み（範囲）— thumb が 2 つになるので名前も 2 つ要る。
 * 🟨 **Radix の自動命名は英語**（`Minimum` / `Maximum`）で、**摘み 1 つだと付かない。**
 * ここは素材側で `label` から機械的な添字を作っている。
 */
export const Range: Story = {
  render: () => (
    <div className="w-64">
      <Slider defaultValue={[20, 80]} max={100} step={1} label="工数の幅" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const names = [...canvasElement.querySelectorAll('[role="slider"]')].map(
      (thumb) => thumb.getAttribute('aria-label'),
    );
    await expect(names).toEqual(['工数の幅 (1/2)', '工数の幅 (2/2)']);
  },
};

/** 面③ */
export const States: Story = {
  render: () => (
    <div className="w-64">
      <Stack gap="md">
        <Stack gap="sm">
          <Label htmlFor="sl-default">既定</Label>
          <Slider id="sl-default" defaultValue={[40]} max={100} label="既定" />
        </Stack>
        <Stack gap="sm">
          <Label htmlFor="sl-disabled">無効</Label>
          <Slider
            id="sl-disabled"
            defaultValue={[40]}
            max={100}
            disabled
            label="無効"
          />
        </Stack>
      </Stack>
    </div>
  ),
};
