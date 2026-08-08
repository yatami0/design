import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  PeriodSelect,
  type PeriodPreset,
  type PeriodRange,
} from '@/components/Selection/PeriodSelect';

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
