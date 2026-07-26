// 手5 案2 — 判定軸カタログ（観点 A）。★ 最重点
// 不透明度修飾 17 種 60 箇所。**色は tmp-admin を追ったが、不透明度は shadcn のまま固定。**
// 値の問題ではなく機構の食い違いなので、tmp-admin の狙いと並べて見せる。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { StatusPill } from '@/components/DataDisplay/StatusPill';
import { Viewpoint, Group, Spec } from './_spec';

const meta = {
  title: '★ Review/A 状態面',
  tags: ['review'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * shadcn は状態面を「**意味色 + 不透明度**」で作る（`destructive/10` `/20` `/30`）。
 * tmp-admin V4 は「**専用の tint 色**」で作る（`--fill-danger` 等）。
 * **`bg-destructive/10` を `--fill-danger` へ向ける経路が無い。**
 */
export const Default: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Viewpoint obs="A" />
      <Group
        title="1. tmp-admin の狙い（自作 StatusPill）"
        note="製品層で自作した StatusPill は --color-fill-* を直接参照している。これが tmp-admin V4「状態は tint pill + ドット」の意図した見た目。"
      >
        <div className="flex flex-wrap gap-3 py-4">
          <StatusPill tone="success">解決</StatusPill>
          <StatusPill tone="warning">進行中</StatusPill>
          <StatusPill tone="danger">緊急</StatusPill>
          <StatusPill tone="neutral">新規</StatusPill>
        </div>
      </Group>

      <Group
        title="2. 🟨 shadcn 側の状態面（不透明度修飾）— destructive 系 9 箇所"
        note="色は #ff3b30 を追った。不透明度 10 / 20 / 30% はクラス名に焼き込まれているので動かない。上の StatusPill（danger）と濃さを見比べてほしい。"
      >
        <Spec
          flag="🟨"
          label="bg-destructive/10 — 3 箇所"
          expect="tmp-admin の --fill-danger は rgba(255,59,48,0.16)。16% に対して 10%"
        >
          <div className="bg-destructive/10 border-border size-16 rounded-md border" />
        </Spec>
        <Spec
          flag="🟨"
          label="bg-destructive/20 — 5 箇所（destructive 系の最多）"
          expect="20%。tmp-admin の 16% より濃い"
        >
          <div className="bg-destructive/20 border-border size-16 rounded-md border" />
        </Spec>
        <Spec flag="🟨" label="bg-destructive/30 — 1 箇所" expect="30%">
          <div className="bg-destructive/30 border-border size-16 rounded-md border" />
        </Spec>
        <Spec
          flag="🟨"
          label="ring-destructive/20 と /40 — 各 7 箇所"
          expect="エラー時のフォーカスリング。2 段の濃さを使い分けている"
        >
          <div className="bg-card ring-destructive/40 size-16 rounded-md ring-3" />
        </Spec>
      </Group>

      <Group
        title="3. 🟨 面と境界（muted / input / foreground 系）"
        note="ここが箇所数では最多。bg-muted/50 が 7・ring-foreground/10 が 6・ring-ring/50 が 5。"
      >
        <Spec
          flag="🟨"
          label="bg-muted/50 — 7 箇所（全体の最多）"
          expect="テーブルの縞・カードの弱い面。50% 固定"
        >
          <div className="bg-muted/50 border-border size-16 rounded-md border" />
        </Spec>
        <Spec
          flag="🟨"
          label="ring-foreground/10 — 6 箇所"
          expect="nova は境界線の代わりに ring を使う。tmp-admin の --color-separator とは機構が違う"
        >
          <div className="bg-card ring-foreground/10 size-16 rounded-md ring-1" />
        </Spec>
        <Spec
          flag="🟨"
          label="ring-ring/50 — 5 箇所"
          expect="フォーカスリング。--ring は #005fa2（tmp のブランド青）を追ったはず"
        >
          <div className="bg-card ring-ring/50 size-16 rounded-md ring-3" />
        </Spec>
        <Spec
          flag="🟨"
          label="bg-input/30 · /50 · /80 — 8 箇所"
          expect="入力欄の面を 3 段の濃さで使い分けている"
        >
          <div className="flex gap-1">
            <div className="bg-input/30 border-border size-8 rounded-md border" />
            <div className="bg-input/50 border-border size-8 rounded-md border" />
            <div className="bg-input/80 border-border size-8 rounded-md border" />
          </div>
        </Spec>
        <Spec
          flag="🟨"
          label="bg-primary/80 · bg-secondary/80 — 3 箇所"
          expect="hover の沈み。--primary は黒のままなので黒 80%"
        >
          <div className="flex gap-1">
            <div className="bg-primary/80 size-8 rounded-md" />
            <div className="bg-secondary/80 border-border size-8 rounded-md border" />
          </div>
        </Spec>
      </Group>
    </div>
  ),
};
