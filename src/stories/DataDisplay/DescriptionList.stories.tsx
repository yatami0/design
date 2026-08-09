// 工程4 D6/D7=A — ② 製品層・自作。項目名と値の対。
//
// 🟨 story を置くのは見せるためだけではない——**`/design-sync` はカードを story から作る**。
//    工程3 は `FilterField` に story が無く、**そのぶんだけカードが落ちた**（実測）。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { DescriptionList } from '@/components/DataDisplay/DescriptionList';
import { StatusPill } from '@/components/DataDisplay/StatusPill';
import { resolveLength } from '../measure';

const COLUMNS = [1, 2, 3] as const;

const meta = {
  title: '② 製品層・自作/DataDisplay/DescriptionList',
  component: DescriptionList,
  tags: ['own'],
} satisfies Meta<typeof DescriptionList>;

export default meta;
type Story = StoryObj<typeof meta>;

const items = [
  {
    key: 'status',
    term: '状態',
    // 値は「部品合成の口」——`StatusPill` を差せる（合成方針 §8-4）
    description: <StatusPill tone="warning">進行中</StatusPill>,
  },
  { key: 'assignee', term: '担当', description: '山田 太郎' },
  { key: 'due', term: '期限', description: '2026-09-30' },
  { key: 'done', term: '進捗', description: '55%' },
];

/** 既定。1 列・項目名は値の上。 */
export const Default: Story = { args: { items } };

/** 2 段組み。段組みの語彙は 1 / 2 / 3 の 3 語だけ。 */
export const TwoColumns: Story = { args: { items, columns: 2 } };

/** 項目名を左に置く。幅は `--container-field-sm` の語彙で固定する。 */
export const Horizontal: Story = {
  args: { items, orientation: 'horizontal' },
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`columns` 3 語 ・ `orientation` 2 語。
 *
 * 🟥 **`horizontal` は `dt` に `w-field-sm` を当てる**＝ **[DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md) と同じ語彙・同じ経路。**
 * `SelectTrigger` と合わせて **`--container-field-*` を使う 3 箇所目の見張り**。
 */
export const Vocabulary: Story = {
  args: { items },
  render: () => (
    <div className="flex flex-col">
      {COLUMNS.map((columns) => (
        <div key={columns} data-testid={`dl-c${String(columns)}`}>
          <DescriptionList items={items} columns={columns} />
        </div>
      ))}
      <div data-testid="dl-vertical">
        <DescriptionList items={items} orientation="vertical" />
      </div>
      <div data-testid="dl-horizontal">
        <DescriptionList items={items} orientation="horizontal" />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const dl = (testId: string) => {
      const found = canvasElement.querySelector<HTMLElement>(
        `[data-testid="${testId}"] dl`,
      );
      if (found === null) throw new Error(`面④: ${testId} の dl が無い`);
      return found;
    };
    await waitFor(async () => {
      await expect(getComputedStyle(dl('dl-c3')).display).toBe('grid');
    });
    for (const columns of COLUMNS) {
      const tracks = getComputedStyle(
        dl(`dl-c${String(columns)}`),
      ).gridTemplateColumns.split(' ').length;
      await expect(tracks).toBe(columns);
    }
    // `horizontal` は dt が `--container-field-sm` の幅で固定される
    const dt = (testId: string) => {
      const found = dl(testId).querySelector('dt');
      if (found === null) throw new Error(`面④: ${testId} の dt が無い`);
      return getComputedStyle(found);
    };
    await expect(dt('dl-horizontal').width).toBe(
      resolveLength(canvasElement, '--container-field-sm'),
    );
    // 🟥 `vertical` では固定しない（**両方が同じなら語が効いていない**）
    await expect(dt('dl-vertical').width).not.toBe(dt('dl-horizontal').width);
  },
};
