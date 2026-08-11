import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Link } from '@/components/Navigation/Link';
import { Stack } from '@/components/Layout/Stack';
import { resolveColor, styleOf } from '../measure';

const TONES = [
  { tone: 'primary', token: '--primary' },
  { tone: 'muted', token: '--muted-foreground' },
] as const;

// 手8d H8D-06 — 面④b（`a { color: var(--primary) }` が 4/6 周）を引き取る部品。
//
// 🟥 **story が無いとカードが出ない**（手6 の実測: カードの数を決めるのは export ではなく story）。
//    部品を足しても棚に並べなければ、7 周目の design agent からは**存在しないのと同じ**。
const meta = {
  title: '② 製品層・自作/Navigation/Link',
  // 🟦 own: 素材層に対応物が無い（shadcn は Button の link variant しか持たない）
  tags: ['own'],
  component: Link,
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { href: '#', children: 'チケット #1024 を開く' },
};

/** 色調は semantic 色 1 語だけ。`className` は型に無い。 */
export const Tones: Story = {
  args: { href: '#', children: 'primary（既定）' },
  render: (args) => (
    <Stack gap="sm" align="start">
      <Link {...args} />
      <Link href="#" tone="muted">
        muted（補助的なリンク）
      </Link>
    </Stack>
  ),
};

/** 外部リンク。`target` と `rel` は部品側が付ける（呼び出し側は書かない）。 */
export const External: Story = {
  args: { href: 'https://example.com', external: true, children: '外部の資料' },
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`tone` 2 語。
 *
 * ★★ 🟥 **`Link` は「効いていないこと」が症状だった部品**——Tailwind Preflight が
 * `a { color: inherit }` でリンクの色を**意図的に剥がす**ので、
 * **`tone` が死ぬと「色が付いていない」＝ 元の壊れた状態にそのまま戻る。**
 * ★ **戻ったことに誰も気づけない形**（生成物の `<style>` に `a { color: var(--primary) }` が
 * 湧いていた 4/6 周が、まさに気づかれていなかった期間）。→ **色を実効値で測る。**
 */
export const Vocabulary: Story = {
  args: { href: '#', children: 'primary' },
  render: () => (
    <Stack gap="sm" align="start">
      {TONES.map(({ tone }) => (
        <Link key={tone} href="#" tone={tone} data-testid={`link-${tone}`}>
          {tone}
        </Link>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(styleOf(canvasElement, 'link-primary').color).not.toBe(
        styleOf(canvasElement, 'link-muted').color,
      );
    });
    for (const { tone, token } of TONES) {
      await expect(styleOf(canvasElement, `link-${tone}`).color).toBe(
        resolveColor(canvasElement, token),
      );
    }
    // ★★★ 🟥 **ここに「親の色と違うこと」は書けない**（B1-06b で書いて落ちた）——
    //    **`--primary` は本文色と同じ黒**（tmp-admin V2「accent は塗りに使わない」・
    //    `--primary: rgba(0,0,0,1)` / `--foreground: rgba(0,0,0,1)`）。**仕様どおり。**
    //    🟥 **その結果 `tone="primary"` のリンクは本文と見分けが付かない**
    //    （下線は `hover` / `focus-visible` のときだけ）→ [OBS-0018] に積んだ。
    //    **面④ は「語が効いているか」しか裁けない**——「効いた結果が使えるか」は面⑦（人）。
  },
};
