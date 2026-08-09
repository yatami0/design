import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import { Stack } from '@/components/Layout/Stack';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Selection/Select';
import { boxOf, resolveLength } from '../measure';

const WIDTHS = ['sm', 'md', 'lg'] as const;

// Radix の薄い再輸出で state を持たない（DR-0013）。open は制御 props としてパススルーされる。
//
// 🟥 **手8d H8D-04 で `SelectTrigger` だけがラッパーに昇格した**（設計 §3.1）。
//    10 パーツ中 9 つは素材のままなので、**層タグを 2 つ付けている**（D12=(c)）。
//    片方だけだと棚が嘘をつく——層タグは部品単位でしか付けられないが、
//    昇格は**パーツ単位**で起きた（→ 思想への指摘 13）。
const meta = {
  title: '② 素材層/Selection/Select',
  tags: ['vendor', 'wrapped'],
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Select>
      {/* 🟦 以前はここが `className="w-48"` だった。**我々の story 自身が面①と同じ逸脱を持っていた** */}
      <SelectTrigger width="md" aria-label="ステータス">
        <SelectValue placeholder="ステータス" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="new">新規</SelectItem>
        <SelectItem value="in-progress">進行中</SelectItem>
        <SelectItem value="resolved">解決</SelectItem>
        <SelectItem value="closed">終了</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/**
 * 幅の語彙（手8d H8D-04）。`width` は `sm | md | lg` の 3 語だけで、
 * `className` は**型に無い**。未指定は上流の既定（内容なり）。
 *
 * ★★★ 🆕 **面④（語彙の効果）を機械で閉じた**（部品1 B1-06b）。
 * 🟥 **この story は [DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md) の現場そのもの**——
 * `twMerge('w-fit w-field-md')` が両方を残し、CSS 順で `w-fit` が勝って
 * **3 語とも一度も効いていなかった**（実測 sm 112 / md 114 / lg 105px ＝ **sm > lg の逆転**）。
 * **prop も型も lint も story も緑で、作用だけが無かった。**
 * ★ **塞いだのは 2026-08-08（[PR #11](https://github.com/yatami0/design/pull/11)）だが、
 * 再発を止める検査はここまで無かった**——`tw-merge.ts` から `'field-md'` を 1 語消せば黙って戻る。
 */
export const Widths: Story = {
  render: () => (
    <Stack gap="md" align="start">
      {WIDTHS.map((width) => (
        <Select key={width}>
          <SelectTrigger
            width={width}
            aria-label={`w-field-${width}`}
            data-testid={`trigger-${width}`}
          >
            <SelectValue placeholder={`w-field-${width}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">新規</SelectItem>
            <SelectItem value="resolved">解決</SelectItem>
          </SelectContent>
        </Select>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(boxOf(canvasElement, 'trigger-lg').width).toBeGreaterThan(0);
    });
    for (const width of WIDTHS) {
      await expect(
        `${String(boxOf(canvasElement, `trigger-${width}`).width)}px`,
      ).toBe(resolveLength(canvasElement, `--container-field-${width}`));
    }
    // 🟥 **単調性**——ここが逆転していたのが DR-0090 の症状。
    //    値が入っていることではなく「**語の順序どおりに並んでいる**」を見る。
    await expect(boxOf(canvasElement, 'trigger-sm').width).toBeLessThan(
      boxOf(canvasElement, 'trigger-md').width,
    );
    await expect(boxOf(canvasElement, 'trigger-md').width).toBeLessThan(
      boxOf(canvasElement, 'trigger-lg').width,
    );
  },
};
