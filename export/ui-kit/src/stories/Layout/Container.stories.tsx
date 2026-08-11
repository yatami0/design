// 手3 H3-04 — 製品層の自作部品。最大幅と中央寄せ。H3-03 で語彙を新設した箇所（Q1）。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Container } from '@/components/Layout/Container';
import { resolveLength, styleOf } from '../measure';

/** 🟨 `full` は `max-w-full`＝トークンを指さない語なので別扱い（実効値は `'100%'`）。 */
const WIDTHS = ['content', 'wide'] as const;

const meta = {
  title: '② 製品層・自作/Layout/Container',
  component: Container,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Container>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { width: 'content', gutter: true },
  render: (args) => (
    <Container {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
    </Container>
  ),
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`width` 3 語 ＋ `gutter`（--spacing-gutter）。
 *
 * ★ **ここは H3-03 で語彙そのものを新設した場所**（Q1 の答えが出た箇所）。
 * 🟥 **`--container-*` 名前空間は `w-*` と `max-w-*` の両方を生む**ので、
 * `w-full` と `max-w-content` が同じ要素に載る＝ **[DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md) が起きたのと同じ形。**
 * `SelectTrigger` はこれで 3 語とも死んでいた——**同じ形がここでも死んでいないかを測る。**
 */
export const Vocabulary: Story = {
  render: () => (
    <div className="flex flex-col">
      {WIDTHS.map((width) => (
        <Container key={width} width={width} data-testid={`container-${width}`}>
          <div className="bg-muted text-body">{width}</div>
        </Container>
      ))}
      <Container width="full" data-testid="container-full">
        <div className="bg-muted text-body">full</div>
      </Container>
      <Container gutter={false} data-testid="container-no-gutter">
        <div className="bg-muted text-body">gutter なし</div>
      </Container>
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(
        styleOf(canvasElement, 'container-content').maxWidth,
      ).not.toBe('none');
    });
    for (const width of WIDTHS) {
      await expect(styleOf(canvasElement, `container-${width}`).maxWidth).toBe(
        resolveLength(canvasElement, `--container-${width}`),
      );
    }
    await expect(styleOf(canvasElement, 'container-full').maxWidth).toBe(
      '100%',
    );
    // 🟨 **実寸は比べない**——canvas がトークンの幅より狭いと `content` と `full` は
    //    どちらも canvas 幅になり、**差が出ないのが正常**。`max-width` の実効値で判定する。
    // `gutter`（--spacing-gutter）。既定は true
    await expect(styleOf(canvasElement, 'container-content').paddingLeft).toBe(
      resolveLength(canvasElement, '--spacing-gutter'),
    );
    await expect(
      styleOf(canvasElement, 'container-no-gutter').paddingLeft,
    ).toBe('0px');
  },
};
