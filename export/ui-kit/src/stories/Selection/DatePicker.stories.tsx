import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

import {
  DATE_PICKER_MODES,
  DatePicker,
  type DateRange,
} from '@/components/Selection/DatePicker';
import { Stack } from '@/components/Layout/Stack';
import { resolveLength } from '../measure';
import { expectOpened, triggerOf } from '../opened';

const WIDTHS = ['sm', 'md', 'lg'] as const;

// 🟨 story は決定的にする（`new Date()` を使わない）。
const DAY = new Date(2026, 7, 9);
const RANGE: DateRange = {
  from: new Date(2026, 5, 1),
  to: new Date(2026, 7, 8),
};

/**
 * 部品3 C3-03 — [完成バー](../../../docs/部品の完成バー.md) の面を**最初から**置く（D5=B）。
 *
 * ★★ 🟥 **上流に実装が無い初めての部品**（`date-picker` はレジストリ **404**）。
 * shadcn が配るのは docs のレシピだけで、**語彙を決めたのはこの repo**（D2=B）。
 *
 * | 面 | 扱い |
 * | --- | --- |
 * | `default` / `focus-visible` / `disabled` | ★ story で持つ |
 * | `empty` | ★ **持つ**——未選択のときに `placeholder` が出る（**値が無い状態が既定**） |
 * | `hover` | 🟨 **対象外**——トリガは `Button variant="outline"` そのままで、hover の視覚は `Button` の面 |
 * | `invalid` | 🟨 **対象外**——**検証はコアが持たない**（[DR-0092](../../../docs/DR/DR-0092-the-core-holds-the-vessel-not-the-state.md)：コアは器を持ち、状態は持たない） |
 * | `loading` | 🟨 **対象外**——非同期を持たない |
 * | `overflow` | 🟨 **対象外**——文言は `yyyy-MM-dd`（＋ 範囲で 23 文字）で長さが有界 |
 */
const meta = {
  title: '② 製品層・自作/Selection/DatePicker',
  component: DatePicker,
  tags: ['own'],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { mode: 'single', value: DAY },
};

/** 面③ `empty` — **未選択が既定の状態**。`placeholder` が名前も兼ねる。 */
export const Empty: Story = {
  args: { mode: 'single' },
};

/** 面③ `disabled`。 */
export const Disabled: Story = {
  args: { mode: 'single', value: DAY, disabled: true },
};

/** `mode="range"` は両端が揃ったときだけ値を出す（片端は「まだ選んでいない」）。 */
export const Range: Story = {
  args: { mode: 'range', value: RANGE },
};

/**
 * 開いた状態。🟥 **中身は portal に出る**ので、`#storybook-root` だけ見る検証では
 * 「描画されていない」と誤判定される（[完成バー §0 罠 3](../../../docs/部品の完成バー.md)）。
 * バーの面① は `document.body` を見るので通る。
 */
export const Open: Story = {
  args: { mode: 'single', value: DAY },
  play: async ({ canvasElement }) => {
    // 🆕 部品4 C4-02: 手書きの主張を `expectOpened` に寄せた（D4=C の静的側の検体になる）。
    await userEvent.click(triggerOf(canvasElement, 'date-picker-trigger'));
    await expectOpened('popover-content');
  },
};

/**
 * 🆕 **面④（語彙の効果）** — 部品3 C3-03。
 *
 * ★★★ 🟥 **この部品で面④ の限界が出る。**バーの面④ は
 * 「語彙 prop が**実効値**（`getComputedStyle` / `getBoundingClientRect`）で効いている」と定義されており、
 * **トークンに裏打ちされた語彙しか測れない。**
 *
 * - `width`（`sm` / `md` / `lg`）… 🟦 **面④ そのもの**。`--container-field-*` を指しているかを測る
 * - `mode`（`single` / `range`）… 🟥 **面④ では測れない**——**実効値を持たない語彙**（振る舞いの分岐）。
 *   → **DOM の差**（トリガの文言が 1 日付か範囲か）でしか主張できない。
 *   ★ **これは「バーが上流の部品向けに作られていた」ことの表れ**（実行記録 §部品3 Q1）
 */
export const Vocabulary: Story = {
  args: { mode: 'single', value: DAY },
  render: () => (
    <Stack gap="md" align="start">
      {WIDTHS.map((width) => (
        <div key={width} data-testid={`dp-${width}`}>
          <DatePicker mode="single" width={width} value={DAY} />
        </div>
      ))}
      <div data-testid="dp-mode-single">
        <DatePicker mode="single" value={DAY} />
      </div>
      <div data-testid="dp-mode-range">
        <DatePicker mode="range" value={RANGE} />
      </div>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const trigger = (testId: string): HTMLElement => {
      const found = canvasElement.querySelector<HTMLElement>(
        `[data-testid="${testId}"] [data-slot="date-picker-trigger"]`,
      );
      if (found === null) throw new Error(`面④: ${testId} の trigger が無い`);
      return found;
    };
    const widthOf = (testId: string): number =>
      trigger(testId).getBoundingClientRect().width;

    await waitFor(async () => {
      await expect(widthOf('dp-lg')).toBeGreaterThan(0);
    });

    // 🟥 生値（`'128px'`）は書かない——トークンの実効値と突き合わせる（B1-06b）
    for (const width of WIDTHS) {
      await expect(`${String(widthOf(`dp-${width}`))}px`).toBe(
        resolveLength(canvasElement, `--container-field-${width}`),
      );
    }
    // 語の順序どおりに並んでいること（DR-0090 は sm > lg の逆転だった）
    await expect(widthOf('dp-sm')).toBeLessThan(widthOf('dp-md'));
    await expect(widthOf('dp-md')).toBeLessThan(widthOf('dp-lg'));

    // 🟥 `mode` は実効値を持たない語彙——DOM の差でしか主張できない
    await expect(DATE_PICKER_MODES.length).toBe(2);
    const single = trigger('dp-mode-single').textContent;
    const range = trigger('dp-mode-range').textContent;
    await expect(single).not.toBe(range);
    await expect(range).toContain('〜');
    await expect(single).not.toContain('〜');
  },
};

/** 選んだ値が呼び出し側へ返るところまで（`PeriodSelect` が使う経路）。 */
export const Controlled: Story = {
  args: { mode: 'range' },
  render: function Controlled() {
    const [range, setRange] = useState<DateRange | undefined>(undefined);
    return (
      <DatePicker
        mode="range"
        {...(range === undefined ? {} : { value: range })}
        onValueChange={setRange}
      />
    );
  },
};
