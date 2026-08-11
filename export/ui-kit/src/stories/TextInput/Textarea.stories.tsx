import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stack } from '@/components/Layout/Stack';
import { Textarea } from '@/components/TextInput/Textarea';

/**
 * 部品3 C3-05 — 🟥 **工程4 から出荷していたのに story が 1 本も無かった 3 件の 2 つ目。**
 *
 * ★ **`Input` は同じ棚に story を持っていた**（`States` で 4 面）——
 * **同じ工程で足した `Textarea` だけが落ちた**のは、**チケット詳細の画面が使っていて
 * 「動いているから」で済んだから**（[台帳 §4](../../../docs/部品の完成バー_台帳.md)）。
 *
 * | 面 | 扱い |
 * | --- | --- |
 * | `default` / `focus-visible` / `disabled` / `invalid` | ★ story で持つ（`Input/States` と同じ 4 面） |
 * | `empty` | ★ **持つ**——`placeholder` だけの状態 |
 * | `overflow` | ★ **持つ**——🟥 **`field-sizing-content` で高さが内容に追従する**ので、長文で伸び方が変わる |
 * | `hover` | 🟨 **対象外**——`textarea.tsx` は hover の視覚変化を持たない（`focus-visible:` / `disabled:` / `aria-invalid:` だけ） |
 * | `loading` | 🟨 **対象外**——非同期を持たない |
 */
const meta = {
  title: '② 素材層/TextInput/Textarea',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Textarea,
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { placeholder: '説明を書く', 'aria-label': '説明' },
};

export const States: Story = {
  render: () => (
    <Stack gap="sm">
      <Textarea placeholder="通常" aria-label="通常" />
      <Textarea placeholder="無効" aria-label="無効" disabled />
      <Textarea placeholder="不正" aria-label="不正" aria-invalid />
      <Textarea
        value="読み取り専用"
        aria-label="読み取り専用"
        readOnly
        onChange={() => undefined}
      />
    </Stack>
  ),
};

/**
 * 面③ `overflow` — 🟥 **`field-sizing-content` は高さを内容に追従させる。**
 * `min-h-16` が下限で、上限は無い（＝**長文だと画面外まで伸びる**）。
 */
export const Overflow: Story = {
  render: () => (
    <Textarea
      aria-label="長い説明"
      readOnly
      onChange={() => undefined}
      value={[
        '再現手順:',
        '1. チケット一覧を開き、状態を「進行中」で絞る',
        '2. 期間を「今四半期」にする',
        '3. 1 件目のチケットを開き、進捗を 30% に変更して保存する',
        '',
        '期待: 一覧に戻ると進捗が 30% で表示される',
        '実際: 一覧の進捗が 0% のまま。再読込すると 30% になる。',
      ].join('\n')}
    />
  ),
};
