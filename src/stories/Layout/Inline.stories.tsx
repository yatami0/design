// 手3 H3-04 — 製品層の自作部品。横並び。gap は --spacing-inline-* だけを取る。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Inline } from '@/components/Layout/Inline';
import { resolveLength, styleOf } from '../measure';

/** 🟥 `INLINE_GAP` は `none` を除くと 2 語しかない（`STACK_GAP` の 3 語とは別の集合）。 */
const GAPS = ['sm', 'md'] as const;

const ALIGNS = ['start', 'center', 'end', 'stretch'] as const;
const ALIGN_CSS = ['flex-start', 'center', 'flex-end', 'stretch'];

const JUSTIFIES = ['start', 'center', 'end', 'between'] as const;
const JUSTIFY_CSS = ['flex-start', 'center', 'flex-end', 'space-between'];

const meta = {
  title: '② 製品層・自作/Layout/Inline',
  component: Inline,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Inline>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { gap: 'md', align: 'center' },
  render: (args) => (
    <Inline {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
    </Inline>
  ),
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`gap` 3 語・`align` 4 語・`justify` 4 語。
 *
 * ★ **`Inline` の `gap` は `Stack` と別の集合**（`--spacing-inline-*` は sm/md の 2 語だけ）。
 * 🟥 **語彙が部品ごとに違うことは型でしか言われていない**——実効値でも別物であることを測る。
 */
export const Vocabulary: Story = {
  render: () => (
    <div className="flex flex-col">
      <Inline gap="none" data-testid="inline-gap-none">
        <div className="bg-muted text-body">none</div>
        <div className="bg-muted text-body">none</div>
      </Inline>
      {GAPS.map((gap) => (
        <Inline key={gap} gap={gap} data-testid={`inline-gap-${gap}`}>
          <div className="bg-muted text-body">{gap}</div>
          <div className="bg-muted text-body">{gap}</div>
        </Inline>
      ))}
      {ALIGNS.map((align) => (
        <Inline key={align} align={align} data-testid={`inline-align-${align}`}>
          <div className="bg-muted text-body">{align}</div>
        </Inline>
      ))}
      {JUSTIFIES.map((justify) => (
        <Inline
          key={justify}
          justify={justify}
          data-testid={`inline-justify-${justify}`}
        >
          <div className="bg-muted text-body">{justify}</div>
        </Inline>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(styleOf(canvasElement, 'inline-gap-md').columnGap).not.toBe(
        'normal',
      );
    });
    for (const gap of GAPS) {
      await expect(styleOf(canvasElement, `inline-gap-${gap}`).columnGap).toBe(
        resolveLength(canvasElement, `--spacing-inline-${gap}`),
      );
    }
    await expect(styleOf(canvasElement, 'inline-gap-none').columnGap).toBe(
      'normal',
    );
    for (const [i, align] of ALIGNS.entries()) {
      await expect(
        styleOf(canvasElement, `inline-align-${align}`).alignItems,
      ).toBe(ALIGN_CSS[i]);
    }
    for (const [i, justify] of JUSTIFIES.entries()) {
      await expect(
        styleOf(canvasElement, `inline-justify-${justify}`).justifyContent,
      ).toBe(JUSTIFY_CSS[i]);
    }
    // 🟥 `Stack` の `gap="sm"` と `Inline` の `gap="sm"` は**別のトークンを指す別の語**
    //    （`--spacing-stack-sm` ≠ `--spacing-inline-sm`）
    await expect(resolveLength(canvasElement, '--spacing-inline-sm')).not.toBe(
      resolveLength(canvasElement, '--spacing-stack-sm'),
    );
    await expect(
      Number.parseFloat(styleOf(canvasElement, 'inline-gap-sm').columnGap),
    ).toBeLessThan(
      Number.parseFloat(styleOf(canvasElement, 'inline-gap-md').columnGap),
    );
  },
};
