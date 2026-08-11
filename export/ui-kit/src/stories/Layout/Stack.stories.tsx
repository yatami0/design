// 手3 H3-04 — 製品層の自作部品。縦積み。gap は --spacing-stack-* だけを取る。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Stack } from '@/components/Layout/Stack';
import { resolveLength, styleOf } from '../measure';

/**
 * 🟨 **`none` は語彙ではない**（`STACK_GAP.none` は空文字＝クラスを当てない）ので別扱い。
 * **実効値は `'0px'` ではなく `'normal'`**——`row-gap` の初期値。**flex では 0 と同じ**だが**別の語**。
 */
const GAPS = ['sm', 'md', 'lg'] as const;
const INSETS = ['xs', 'sm', 'md', 'lg'] as const;

const ALIGNS = ['start', 'center', 'end', 'stretch'] as const;
/** 🟨 CSS の `align-items` は `start` を `flex-start` に正規化する。 */
const ALIGN_CSS = ['flex-start', 'center', 'flex-end', 'stretch'];

const meta = {
  title: '② 製品層・自作/Layout/Stack',
  component: Stack,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { gap: 'md', inset: 'none' },
  render: (args) => (
    <Stack {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
    </Stack>
  ),
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`gap` 4 語・`inset` 5 語・`align` 4 語を**全数**。
 *
 * 🟥 **`Stack` は 3 つの語彙を 1 つの `cn()` で重ねる**——
 * `cn('flex flex-col', STACK_GAP[gap], INSET[inset], ALIGN[align])`。
 * **どれか 1 つが `twMerge` に落とされても、他が効いていれば絵は成立して見える。**
 * → **語ごとに実効値を読む。**
 */
export const Vocabulary: Story = {
  render: () => (
    <div className="flex flex-col">
      <Stack gap="none" data-testid="stack-gap-none">
        <div className="bg-muted text-body">none</div>
        <div className="bg-muted text-body">none</div>
      </Stack>
      {GAPS.map((gap) => (
        <Stack key={gap} gap={gap} data-testid={`stack-gap-${gap}`}>
          <div className="bg-muted text-body">{gap}</div>
          <div className="bg-muted text-body">{gap}</div>
        </Stack>
      ))}
      {INSETS.map((inset) => (
        <Stack key={inset} inset={inset} data-testid={`stack-inset-${inset}`}>
          <div className="bg-muted text-body">{inset}</div>
        </Stack>
      ))}
      {ALIGNS.map((align) => (
        <Stack key={align} align={align} data-testid={`stack-align-${align}`}>
          <div className="bg-muted text-body">{align}</div>
        </Stack>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(styleOf(canvasElement, 'stack-gap-lg').rowGap).not.toBe(
        'normal',
      );
    });
    for (const gap of GAPS) {
      await expect(styleOf(canvasElement, `stack-gap-${gap}`).rowGap).toBe(
        resolveLength(canvasElement, `--spacing-stack-${gap}`),
      );
    }
    await expect(styleOf(canvasElement, 'stack-gap-none').rowGap).toBe(
      'normal',
    );
    for (const inset of INSETS) {
      await expect(
        styleOf(canvasElement, `stack-inset-${inset}`).paddingTop,
      ).toBe(resolveLength(canvasElement, `--spacing-inset-${inset}`));
    }
    for (const [i, align] of ALIGNS.entries()) {
      await expect(
        styleOf(canvasElement, `stack-align-${align}`).alignItems,
      ).toBe(ALIGN_CSS[i]);
    }
    // 🟥 単調性（`none` は 'normal' なので数の比較からは外す）
    const px = (gap: (typeof GAPS)[number]) =>
      Number.parseFloat(styleOf(canvasElement, `stack-gap-${gap}`).rowGap);
    await expect(px('sm')).toBeLessThan(px('md'));
    await expect(px('md')).toBeLessThan(px('lg'));
  },
};
