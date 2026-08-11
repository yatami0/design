// 手3 H3-04 — 製品層の自作部品。🟨 唯一 className を受ける逃げ道。使用箇所数が枠の健全性の指標になる。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Box } from '@/components/Layout/Box';
import { resolveLength, styleOf } from '../measure';

/** 🟥 `none` は語彙ではなく「当てない」（`INSET.none` は空文字）ので別扱い。 */
const INSETS = ['xs', 'sm', 'md', 'lg'] as const;

const meta = {
  title: '② 製品層・自作/Layout/Box',
  component: Box,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { inset: 'md' },
  render: (args) => (
    <Box {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
    </Box>
  ),
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`inset` の **5 語を全数**、実効値で測る。
 *
 * 🟥 **「prop がある」と「効いている」は別**（[DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md)）。
 * ★ **`Box` は className を受ける唯一の逃げ道**なので、`cn(INSET[inset], className)` の
 * **併合順が語彙を落とさないか**がここで初めて機械で確かめられる。
 */
export const Vocabulary: Story = {
  render: () => (
    <div className="flex flex-col">
      <Box inset="none" data-testid="box-none">
        <div className="bg-muted text-body">none</div>
      </Box>
      {INSETS.map((inset) => (
        <Box key={inset} inset={inset} data-testid={`box-${inset}`}>
          <div className="bg-muted text-body">{inset}</div>
        </Box>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    // 🟥 CSS が当たるまで待つ（バー §5 の落とし穴 1）
    await waitFor(async () => {
      await expect(styleOf(canvasElement, 'box-lg').paddingTop).not.toBe('0px');
    });
    // 🟥 生値ではなく**トークンの実効値**と突き合わせる（measure.ts の理由）
    for (const inset of INSETS) {
      await expect(styleOf(canvasElement, `box-${inset}`).paddingTop).toBe(
        resolveLength(canvasElement, `--spacing-inset-${inset}`),
      );
    }
    await expect(styleOf(canvasElement, 'box-none').paddingTop).toBe('0px');
    // 🟥 単調性（`SelectTrigger` は sm > lg の逆転を起こしていた）
    const px = (inset: string) =>
      Number.parseFloat(styleOf(canvasElement, `box-${inset}`).paddingTop);
    await expect(px('none')).toBeLessThan(px('xs'));
    await expect(px('xs')).toBeLessThan(px('sm'));
    await expect(px('sm')).toBeLessThan(px('md'));
    await expect(px('md')).toBeLessThan(px('lg'));
  },
};
