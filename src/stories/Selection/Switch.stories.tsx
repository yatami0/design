import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Label } from '@/components/Display/Label';
import { Stack } from '@/components/Layout/Stack';
import { Switch } from '@/components/Selection/Switch';

/**
 * 部品2 C2-04 — [完成バー](../../../docs/部品の完成バー.md) 面③ を**最初から**置く。
 *
 * | 面 | 扱い |
 * | --- | --- |
 * | `default` / `focus-visible` / `disabled` / `invalid` | ★ story で持つ |
 * | `hover` | 🟨 **対象外**——`switch.tsx` は hover の視覚変化を持たない（`focus-visible` / `data-checked` / `data-disabled` だけ） |
 * | `loading` | 🟨 **対象外**——非同期を持たない |
 * | `empty` | 🟨 **対象外**——データを受けない |
 * | `overflow` | 🟨 **対象外**——文字を持たない（ラベルは外側の `Label` が持つ） |
 */
const meta = {
  title: '② 素材層/Selection/Switch',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Switch,
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 🟥 素の `Switch` は `role="switch"` の `button` で**中身が無い**（`Checkbox` と同型）。
 * 名前は使う側が与える——**バーの面② はここを落とす**（部品1 B1-05 で 6 件が story 側の欠陥だった）。
 */
export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-inline-sm">
      <Switch id="sw-default" />
      <Label htmlFor="sw-default">サブプロジェクトを含める</Label>
    </div>
  ),
};

/**
 * 語彙 prop `size`（**面④**）— `sm` / `default` の 2 語しかない。
 *
 * ★★ 🟥 **`play` で実効値を読む。**[DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md) の教訓——
 * `SelectTrigger` の `width` は **prop も型も lint も story も緑で、作用だけが無かった。**
 * 「指定した」ではなく「**効いた**」を測るのがバー面④で、`play` はそれを**バーの実行エンジンの中**で測る。
 */
export const Sizes: Story = {
  render: () => (
    <Stack gap="sm">
      <div className="flex items-center gap-inline-sm">
        <Switch id="sw-sm" size="sm" defaultChecked />
        <Label htmlFor="sw-sm">sm</Label>
      </div>
      <div className="flex items-center gap-inline-sm">
        <Switch id="sw-md" defaultChecked />
        <Label htmlFor="sw-md">default</Label>
      </div>
    </Stack>
  ),
  // 🟥 **`waitFor` が要る。**同期に測ると **CSS が当たる前の値**を読む——
  //    実測: 素の `<button>` は幅 0、素の `<span>小</span>` は 16px（文字幅）で、
  //    **正しい部品を落とす**（「対象 0 件で緑」の裏返し＝ 偽の赤）。部品2 C2-05 の実測。
  play: async ({ canvasElement }) => {
    const width = (id: string) =>
      canvasElement.querySelector(id)?.getBoundingClientRect().width;
    // data-[size=sm]:w-[24px] / data-[size=default]:w-[32px]（素材の生値）
    await waitFor(async () => {
      await expect(width('#sw-sm')).toBe(24);
    });
    await expect(width('#sw-md')).toBe(32);
    // 🟥 2 語が**別々の値**になっていること（同値なら語彙が死んでいる＝ DR-0090 の形）
    await expect(width('#sw-sm')).not.toBe(width('#sw-md'));
  },
};

/** 面③ */
export const States: Story = {
  render: () => (
    <Stack gap="sm">
      <div className="flex items-center gap-inline-sm">
        <Switch id="sw-off" />
        <Label htmlFor="sw-off">オフ</Label>
      </div>
      <div className="flex items-center gap-inline-sm">
        <Switch id="sw-on" defaultChecked />
        <Label htmlFor="sw-on">オン</Label>
      </div>
      <div className="flex items-center gap-inline-sm">
        <Switch id="sw-disabled" disabled />
        <Label htmlFor="sw-disabled">無効</Label>
      </div>
      <div className="flex items-center gap-inline-sm">
        <Switch id="sw-invalid" aria-invalid />
        <Label htmlFor="sw-invalid">不正（aria-invalid）</Label>
      </div>
    </Stack>
  ),
};
