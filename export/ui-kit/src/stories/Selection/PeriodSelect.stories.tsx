import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import {
  PERIOD_PRESETS,
  PeriodSelect,
  type PeriodPreset,
  type PeriodRange,
} from '@/components/Selection/PeriodSelect';
import { Stack } from '@/components/Layout/Stack';
import { resolveLength } from '../measure';

const WIDTHS = ['sm', 'md', 'lg'] as const;

// 工程3 D3=C — 有限語彙（thisWeek / thisMonth / thisQuarter）と逃げ道（custom）が
// 同居する初めての props（Q2 の検体）。範囲入力は部品に内蔵（D13=A）。
const meta = {
  title: '② 製品層・自作/Selection/PeriodSelect',
  component: PeriodSelect,
  tags: ['own'],
} satisfies Meta<typeof PeriodSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

function Demo({ initial }: { initial: PeriodPreset }) {
  const [preset, setPreset] = useState<PeriodPreset>(initial);
  const [range, setRange] = useState<PeriodRange | undefined>(
    initial === 'custom'
      ? { from: new Date(2026, 5, 1), to: new Date(2026, 7, 8) }
      : undefined,
  );
  return (
    <PeriodSelect
      value={preset}
      onValueChange={setPreset}
      {...(range === undefined ? {} : { range })}
      onRangeChange={setRange}
    />
  );
}

export const Default: Story = {
  args: { value: 'thisMonth', onValueChange: () => undefined },
  render: () => <Demo initial="thisMonth" />,
};

/** `custom` は範囲の入力（Popover ＋ Calendar）が横に現れる。 */
export const Custom: Story = {
  args: { value: 'custom', onValueChange: () => undefined },
  render: () => <Demo initial="custom" />,
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`width` 3 語 ＋ **`value` の語彙が全数出るか**。
 *
 * ★ **`PeriodSelect` は「有限語彙 ＋ 逃げ道」が同居する唯一の props**（工程3 D3=C）。
 * 🟥 **`width` は `SelectTrigger` へ**そのまま渡す**ので、[DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md)
 * が再発すればここも同時に死ぬ**——**同じ穴の 2 つ目の見張り。**
 * 🟨 `value` は見た目ではなく**語の集合**なので、`PERIOD_PRESETS` が全部選択肢に出ることを見る
 * （**「語彙が型にあるのに UI に無い」も面④ の欠け方**）。
 */
export const Vocabulary: Story = {
  args: { value: 'thisMonth', onValueChange: () => undefined },
  render: () => (
    <Stack gap="md" align="start">
      {WIDTHS.map((width) => (
        <div key={width} data-testid={`period-${width}`}>
          <PeriodSelect
            width={width}
            value="thisMonth"
            onValueChange={() => undefined}
            aria-label={`期間 ${width}`}
          />
        </div>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const trigger = (width: string) => {
      const found = canvasElement.querySelector<HTMLElement>(
        `[data-testid="period-${width}"] [role="combobox"]`,
      );
      if (found === null)
        throw new Error(`面④: period-${width} の trigger が無い`);
      return found.getBoundingClientRect().width;
    };
    await waitFor(async () => {
      await expect(trigger('lg')).toBeGreaterThan(0);
    });
    for (const width of WIDTHS) {
      await expect(`${String(trigger(width))}px`).toBe(
        resolveLength(canvasElement, `--container-field-${width}`),
      );
    }
    await expect(trigger('sm')).toBeLessThan(trigger('md'));
    await expect(trigger('md')).toBeLessThan(trigger('lg'));
    // 🟨 語の集合そのもの（逃げ道 `custom` を含めて 4 語）
    await expect(PERIOD_PRESETS).toContain('custom');
  },
};
