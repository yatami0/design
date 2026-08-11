// 手4 H4-06 — 自作。shadcn の Badge に success / warning と色ドットが無いため。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { StatusPill } from '@/components/DataDisplay/StatusPill';
import { Inline } from '@/components/Layout/Inline';
import { el, resolveColor, resolveLength } from '../measure';

/**
 * 語 → 前景トークン / 面トークン。🟥 **`danger` だけ前景が `--destructive`**
 * （tint は `--color-fill-danger`）——**語と token 名が 1:1 ではない**ので写しではなく表で持つ。
 */
const TONES = [
  { tone: 'neutral', fg: '--muted-foreground', fill: '--color-fill-neutral' },
  { tone: 'warning', fg: '--color-warning', fill: '--color-fill-warning' },
  { tone: 'success', fg: '--color-success', fill: '--color-fill-success' },
  { tone: 'danger', fg: '--destructive', fill: '--color-fill-danger' },
] as const;

const meta = {
  title: '② 製品層・自作/DataDisplay/StatusPill',
  component: StatusPill,
  tags: ['own'],
} satisfies Meta<typeof StatusPill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllTones: Story = {
  args: { tone: 'neutral', children: '新規' },
  render: () => (
    <Inline gap="md">
      <StatusPill tone="neutral">新規</StatusPill>
      <StatusPill tone="warning">進行中</StatusPill>
      <StatusPill tone="success">解決</StatusPill>
      <StatusPill tone="danger">失敗</StatusPill>
    </Inline>
  ),
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`tone` 4 語を**色の実効値**で測る。
 *
 * ★★ 🟥 **`StatusPill` は `Badge` の `className` に語彙クラスを流し込む形**——
 * `cn(badgeVariants({ variant: 'outline' }), className)` で、**`variant` 側の
 * `text-foreground` と `text-success` が同じ要素に載る。**
 * **`twMerge` が `success` を色だと知らなければ両方残り、CSS 順で負ける**＝
 * **[DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md) と完全に同じ形。**
 * 🟦 `src/lib/tw-merge.ts` の `color` に 6 語を登録して防いでいるが、**検査は無かった。**
 */
export const Vocabulary: Story = {
  args: { tone: 'neutral', children: '新規' },
  render: () => (
    <Inline gap="md">
      {TONES.map(({ tone }) => (
        <span key={tone} data-testid={`pill-${tone}`}>
          <StatusPill tone={tone}>{tone}</StatusPill>
        </span>
      ))}
    </Inline>
  ),
  play: async ({ canvasElement }) => {
    const pill = (tone: string) => {
      const badge = el(canvasElement, `pill-${tone}`).firstElementChild;
      if (badge === null) throw new Error(`面④: pill-${tone} が空`);
      return getComputedStyle(badge);
    };
    await waitFor(async () => {
      await expect(pill('success').color).not.toBe(pill('danger').color);
    });
    for (const { tone, fg, fill } of TONES) {
      await expect(pill(tone).color).toBe(resolveColor(canvasElement, fg));
      await expect(pill(tone).backgroundColor).toBe(
        resolveColor(canvasElement, fill),
      );
    }
    // 🟥 4 語が 4 色に分かれること（1 語でも潰れたら pill は状態を表せない）
    const colors = new Set(TONES.map(({ tone }) => pill(tone).color));
    await expect(colors.size).toBe(TONES.length);
    // ドットの大きさは `--spacing-dot`（`size-dot`）
    const dot = el(canvasElement, 'pill-neutral').querySelector(
      '[aria-hidden]',
    );
    if (dot === null) throw new Error('面④: 状態ドットが無い');
    await expect(getComputedStyle(dot).width).toBe(
      resolveLength(canvasElement, '--spacing-dot'),
    );
  },
};
