// 手5 案2 — 判定軸カタログ（観点 D）。
// font-medium が 500 → 600 に動いた。素材層 15 箇所が一斉に太くなっている。
// **V3「強調は weight 600 ⇔ 400 のコントラスト」が出ているか／太すぎないか**を見る。
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Viewpoint, Group, Spec } from './_spec';

const meta = {
  title: '★ Review/D タイポ',
  tags: ['review'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `font-medium` は `font-weight: var(--font-weight-medium)` を出す（**実行時参照**）。
 * `@theme` で 600 にすると **15 箇所すべてが動く**——1 行で最も広く効いた差し替え。
 */
export const Default: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Viewpoint obs="D" />
      <Group
        title="1. V3 のコントラスト（600 ⇔ 400）"
        note="tmp-admin V3 は「強調は色ではなく weight のコントラストで作る」。600 と 400 が並んだとき、差がはっきり読めるか。"
      >
        <div className="flex flex-col gap-2 py-4">
          <p className="text-body font-medium">
            weight 600 — チケットの件名（強調したい行）
          </p>
          <p className="text-body font-normal">
            weight 400 — 本文。補足説明や詳細はこちら側に置く
          </p>
        </div>
      </Group>

      <Group
        title="2. 🟥 差し替え前後の比較"
        note="素の shadcn は 500 だった。500 → 600 で「うるさくなっていないか」がここの観点。15 箇所が同時に太くなる。"
      >
        <Spec
          flag="🟥"
          label="差し替え前 — font-weight: 500"
          expect="参照用（inline style で 500 を固定してある）"
        >
          <span className="text-body" style={{ fontWeight: 500 }}>
            見出しサンプル
          </span>
        </Spec>
        <Spec
          flag="🟦"
          label="差し替え後 — font-medium（= var(--font-weight-medium) → 600）"
          expect="上と見比べて、太くなりすぎていないか"
        >
          <span className="text-body font-medium">見出しサンプル</span>
        </Spec>
      </Group>

      <Group
        title="3. 用途名タイポ（自前 semantic 語彙）"
        note="4 者のうち apple だけが用途名のタイポ階調を持つ。--text-* を用途名で自前定義し、値を apple から流し込んだ。"
      >
        <Spec
          flag="🟦"
          label="--text-heading → 17px"
          expect="apple --text-headline。V3 により title 群は使わない"
        >
          <span className="text-heading font-emphasis">見出し</span>
        </Spec>
        <Spec
          flag="🟦"
          label="--text-emphasis → 17px"
          expect="apple --text-body。氏名・検索など目を引かせる本文"
        >
          <span className="text-emphasis">氏名・検索</span>
        </Spec>
        <Spec
          flag="🟦"
          label="--text-body → 17px"
          expect="apple --text-body。本文"
        >
          <span className="text-body">本文</span>
        </Spec>
        <Spec
          flag="🟦"
          label="--text-table → 15px"
          expect="apple --text-subhead。テーブル本文（密データ）"
        >
          <span className="text-table">テーブル本文</span>
        </Spec>
        <Spec
          flag="🟦"
          label="--text-label → 13px"
          expect="apple --text-footnote。th・補助・キャプション"
        >
          <span className="text-label">補助ラベル</span>
        </Spec>
      </Group>

      <Group
        title="4. 等幅（tmp-admin §4.4「密データは等幅で」）"
        note="--font-mono を apple の stack に差し替えた。桁が揃うかを見る。"
      >
        <div className="flex flex-col gap-1 py-4">
          <span className="font-mono tabular-nums text-table">
            #1042 2026-07-26 09:14
          </span>
          <span className="font-mono tabular-nums text-table">
            #998 2026-07-25 18:03
          </span>
          <span className="font-mono tabular-nums text-table">
            #10001 2026-07-24 11:47
          </span>
        </div>
      </Group>
    </div>
  ),
};
