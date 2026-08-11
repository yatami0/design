// 手3 H3-04 — 製品層の自作部品。格子。columns は値ではなく段組みの定義。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Grid } from '@/components/Layout/Grid';
import { resolveLength, styleOf } from '../measure';

/** `COLUMNS` の全 6 語。**値ではなく段組みの定義**なので primitive ではない（tokens.ts）。 */
const COLUMNS = [1, 2, 3, 4, 6, 12] as const;
const GAPS = ['sm', 'md', 'lg'] as const;

const meta = {
  title: '② 製品層・自作/Layout/Grid',
  component: Grid,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Grid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { columns: 3, gap: 'md' },
  render: (args) => (
    <Grid {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
      <div className="bg-muted p-inset-sm text-body">4</div>
      <div className="bg-muted p-inset-sm text-body">5</div>
      <div className="bg-muted p-inset-sm text-body">6</div>
    </Grid>
  ),
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`columns` 6 語・`gap` 4 語。
 *
 * 🟥 **列数は「クラス名が付いたか」では測れない**——`grid-cols-12` が付いていても
 * 親が `display: grid` でなければ 1 列になる。→ **実効の `grid-template-columns` の
 * トラック数**を数える（＝ 使う側から見える結果と同じもの）。
 */
export const Vocabulary: Story = {
  render: () => (
    <div className="flex flex-col">
      {COLUMNS.map((columns) => (
        <Grid
          key={columns}
          columns={columns}
          data-testid={`grid-c${String(columns)}`}
        >
          <div className="bg-muted text-body">{columns}</div>
        </Grid>
      ))}
      {GAPS.map((gap) => (
        <Grid key={gap} gap={gap} data-testid={`grid-gap-${gap}`}>
          <div className="bg-muted text-body">{gap}</div>
          <div className="bg-muted text-body">{gap}</div>
        </Grid>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(styleOf(canvasElement, 'grid-c12').display).toBe('grid');
    });
    for (const columns of COLUMNS) {
      const tracks = styleOf(
        canvasElement,
        `grid-c${String(columns)}`,
      ).gridTemplateColumns.split(' ').length;
      await expect(tracks).toBe(columns);
    }
    for (const gap of GAPS) {
      await expect(styleOf(canvasElement, `grid-gap-${gap}`).rowGap).toBe(
        resolveLength(canvasElement, `--spacing-stack-${gap}`),
      );
    }
  },
};
