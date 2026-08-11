// 手3 H3-04 — 製品層の自作部品。見出し + 本体。typography も semantic な用途名だけを使う。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Section } from '@/components/Layout/Section';
import { resolveLength, styleOf } from '../measure';

const GAPS = ['sm', 'md', 'lg'] as const;

const meta = {
  title: '② 製品層・自作/Layout/Section',
  component: Section,
  // 🟥 Q6: 素材由来（vendor / wrapped）と自作（own）が同じ階層に並ぶので、
  //    tag で層を明示する。手5 の判定でどちらの由来かを切り分けるため。
  tags: ['own'],
} satisfies Meta<typeof Section>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { heading: '区画の見出し', gap: 'md' },
  render: (args) => (
    <Section {...args}>
      <div className="bg-muted p-inset-sm text-body">1</div>
      <div className="bg-muted p-inset-sm text-body">2</div>
      <div className="bg-muted p-inset-sm text-body">3</div>
    </Section>
  ),
};

/**
 * 🆕 **面④（語彙の効果）** — 部品1 B1-06b。`gap` 4 語 ＋ **見出しのタイポ語彙**。
 *
 * ★ **`Section` は唯一「タイポの語彙」を内側で使う Layout 部品**——
 * 見出しに `text-heading font-emphasis` を当てている。**これも語彙**なので、
 * `--text-heading` / `--font-weight-emphasis` を指しているかを**トークンと突き合わせる**。
 */
export const Vocabulary: Story = {
  render: () => (
    <div className="flex flex-col">
      {GAPS.map((gap) => (
        <Section
          key={gap}
          gap={gap}
          heading={gap}
          data-testid={`section-gap-${gap}`}
        >
          <div className="bg-muted text-body">{gap}</div>
        </Section>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(styleOf(canvasElement, 'section-gap-lg').rowGap).not.toBe(
        'normal',
      );
    });
    for (const gap of GAPS) {
      await expect(styleOf(canvasElement, `section-gap-${gap}`).rowGap).toBe(
        resolveLength(canvasElement, `--spacing-stack-${gap}`),
      );
    }
    // 見出しのタイポ語彙。🟥 **ここも生値を書かない**——`--text-heading` は
    //    tokens.css では `--text-lg`（18px）だが、tmp-admin が 17px に向け替えている。
    //    測るのは「**`text-heading` がそのトークンを指しているか**」。
    const heading = canvasElement.querySelector('h2');
    if (heading === null) throw new Error('面④: Section の h2 が無い');
    await expect(getComputedStyle(heading).fontSize).toBe(
      resolveLength(canvasElement, '--text-heading'),
    );
    await expect(getComputedStyle(heading).fontWeight).toBe(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--font-weight-emphasis')
        .trim(),
    );
  },
};
