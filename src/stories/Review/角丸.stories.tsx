// 手5 案2 — 判定軸カタログ（観点 B）。
// 部品ごとに並べると、角丸の取り残し 7 箇所が 29 画面に散って比較にならない。
// **1 画面に「届いた段」「取り残された variant」「そもそも動かない生値」を並べる。**
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Viewpoint, Group, Ruler, Spec } from './_spec';

const meta = {
  title: '★ Review/B 角丸',
  tags: ['review'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 2 周目で `.rounded-*` をレイヤ外から上書きし、apple の非線形 5 段（8/12/18/28/pill）に合わせた。
 * **届いたのは素の 27 箇所だけ。variant 付き 7 箇所は比率派生のまま取り残されている。**
 */
export const Default: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Viewpoint obs="B" />
      <Group
        title="1. 狙い — apple の非線形 5 段"
        note="これが物差し。以下の検体がこの値に一致していれば追従、していなければ取り残し。"
      >
        <div className="flex flex-wrap gap-6 py-4">
          <Ruler px={8} label="s 8px" />
          <Ruler px={12} label="m 12px" />
          <Ruler px={18} label="l 18px" />
          <Ruler px={28} label="xl 28px" />
        </div>
      </Group>

      <Group
        title="2. 届いた段（27 箇所）"
        note="レイヤ外の .rounded-* が @layer utilities の中の宣言に勝っている。素の shadcn では 7.2 / 9.6 / 12 / 16.8 / 21.6 / 26.4 / 31.2px の比率派生だった。"
      >
        <Spec
          flag="🟦"
          label=".rounded-sm"
          expect="8px（apple s）に一致するはず"
        >
          <div className="bg-muted border-border size-16 rounded-sm border" />
        </Spec>
        <Spec
          flag="🟦"
          label=".rounded-md — 素材層 15 箇所（最多）"
          expect="8px（apple s）。小コントロール"
        >
          <div className="bg-muted border-border size-16 rounded-md border" />
        </Spec>
        <Spec
          flag="🟦"
          label=".rounded-lg — 素材層 8 箇所"
          expect="12px（apple m）。ボタン・入力・カード"
        >
          <div className="bg-muted border-border size-16 rounded-lg border" />
        </Spec>
        <Spec
          flag="🟦"
          label=".rounded-xl — 素材層 3 箇所"
          expect="18px（apple l）。dialog・sheet"
        >
          <div className="bg-muted border-border size-16 rounded-xl border" />
        </Spec>
        <Spec flag="🟦" label=".rounded-2xl" expect="18px（apple l）">
          <div className="bg-muted border-border size-16 rounded-2xl border" />
        </Spec>
        <Spec
          flag="🟦"
          label=".rounded-4xl — badge の pill"
          expect="980px（apple pill）。完全な楕円になるはず"
        >
          <div className="bg-muted border-border h-8 w-24 rounded-4xl border" />
        </Spec>
      </Group>

      <Group
        title="3. 🟥 取り残された variant（7 箇所・うちずれたのは 2）"
        note="レイヤ外の .rounded-lg は in-data-[slot=button-group]:rounded-lg とは別のクラスなので当たらない。variant 側は比率派生のまま残る。上の物差しと見比べてほしい。"
      >
        <Spec
          flag="🟥"
          label="**:data-[slot=kbd]:rounded-sm → 実効 7.2px"
          expect="狙いは 8px。0.8px 小さい。この差が目で分かるか？"
        >
          <div
            className="bg-muted border-border size-16 border"
            style={{ borderRadius: '7.2px' }}
          />
        </Spec>
        <Spec
          flag="🟥"
          label="md:peer-data-[variant=inset]:rounded-xl → 実効 16.8px"
          expect="狙いは 18px。1.2px 小さい"
        >
          <div
            className="bg-muted border-border size-16 border"
            style={{ borderRadius: '16.8px' }}
          />
        </Spec>
        <Spec
          flag="🟨"
          label="group-data-[variant=floating]:rounded-lg → 実効 12px"
          expect="狙いと一致するが偶然。--radius の基数を apple m(12px) に合わせたので * 1.0 の段だけが合っている。基数を変えればずれる"
        >
          <div
            className="bg-muted border-border size-16 border"
            style={{ borderRadius: '12px' }}
          />
        </Spec>
        <Spec
          flag="🟨"
          label="in-data-[slot=button-group]:rounded-lg → 実効 12px"
          expect="同上。偶然の一致"
        >
          <div
            className="bg-muted border-border size-16 border"
            style={{ borderRadius: '12px' }}
          />
        </Spec>
      </Group>

      <Group
        title="4. 🟥 そもそも動かない生値"
        note="shadcn 自身が発明した任意値（DR-0010 の (C) 8 件）。トークンを経由していないので、どんな差し替えでも動かない。"
      >
        <Spec
          flag="🟥"
          label="checkbox.tsx rounded-[4px]"
          expect="4px のまま。周りが 8px になった中でこれだけ角が立って見えるか？"
        >
          <div
            className="bg-muted border-border size-16 border"
            style={{ borderRadius: '4px' }}
          />
        </Spec>
        <Spec
          flag="🟥"
          label="tooltip.tsx の矢印 rounded-[2px]"
          expect="2px のまま。ただし tmp-admin に対応する値が無いので「変える対象ですらない」"
        >
          <div
            className="bg-muted border-border size-16 border"
            style={{ borderRadius: '2px' }}
          />
        </Spec>
      </Group>
    </div>
  ),
};
