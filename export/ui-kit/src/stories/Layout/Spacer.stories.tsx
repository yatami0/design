// 手3 H3-04 — 製品層の自作部品。明示的な空き。children を取らない。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Spacer } from '@/components/Layout/Spacer';
import { boxOf, resolveLength } from '../measure';

/** 🟥 `STACK_SIZE` に `none` は無い（3 語）——「空きを 0 にする Spacer」は書けない。 */
const SIZES = ['sm', 'md', 'lg'] as const;

const meta = {
  title: '② 製品層・自作/Layout/Spacer',
  component: Spacer,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Spacer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { size: 'lg' },
  render: (args) => (
    <div className="bg-muted/40">
      <div className="bg-muted p-inset-sm text-body">上</div>
      <Spacer {...args} />
      <div className="bg-muted p-inset-sm text-body">下</div>
    </div>
  ),
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`size` 3 語。
 *
 * ★★ 🟥 **`Spacer` は面① の検体でもある**——**文字を 1 つも持たない部品**なので、
 * 面① を `textContent` で判定していたら**この部品が落ちていた**（バー §2・D11=B の根拠）。
 * ここで実寸が 0 でないことを測るのは、**面① の判定式が正しいことの裏取りにもなる。**
 */
export const Vocabulary: Story = {
  render: () => (
    <div className="flex flex-col">
      {SIZES.map((size) => (
        <Spacer key={size} size={size} data-testid={`spacer-${size}`} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(boxOf(canvasElement, 'spacer-lg').height).toBeGreaterThan(0);
    });
    for (const size of SIZES) {
      await expect(
        `${String(boxOf(canvasElement, `spacer-${size}`).height)}px`,
      ).toBe(resolveLength(canvasElement, `--spacing-stack-${size}`));
    }
    await expect(boxOf(canvasElement, 'spacer-sm').height).toBeLessThan(
      boxOf(canvasElement, 'spacer-md').height,
    );
    await expect(boxOf(canvasElement, 'spacer-md').height).toBeLessThan(
      boxOf(canvasElement, 'spacer-lg').height,
    );
  },
};
