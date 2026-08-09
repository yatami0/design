import type { Meta, StoryObj } from '@storybook/react-vite';

import { Progress } from '@/components/Communication/Progress';
import { Stack } from '@/components/Layout/Stack';

/**
 * 部品2 C2-04 — [完成バー](../../../docs/部品の完成バー.md) 面③ を**最初から**置く。
 *
 * 思想は Progress を Communication に置いている（進み具合の伝達）。
 *
 * | 面 | 扱い |
 * | --- | --- |
 * | `default` / `loading` / `empty` | ★ story で持つ（`loading` = 不定（`value` 無し）、`empty` = 0%） |
 * | `hover` | 🟨 **対象外**——ポインタに反応しない |
 * | `focus-visible` | 🟨 **対象外**——フォーカスを受けない（対話部品ではない） |
 * | `disabled` | 🟨 **対象外**——無効状態を持たない |
 * | `invalid` | 🟨 **対象外**——入力を受けない |
 * | `overflow` | 🟨 **対象外**——文字を持たない（数値の表示は使う側） |
 */
const meta = {
  title: '② 素材層/Communication/Progress',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Progress,
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 🟥 `role="progressbar"` にも名前が要る（`aria-label`）——見えている数字は名前にならない */
export const Default: Story = {
  render: () => (
    <div className="w-64">
      <Progress value={62} aria-label="チケットの進捗率" />
    </div>
  ),
};

/** 面③ */
export const States: Story = {
  render: () => (
    <div className="w-64">
      <Stack gap="md">
        {/* empty = 0% */}
        <Progress value={0} aria-label="0%" />
        <Progress value={50} aria-label="50%" />
        <Progress value={100} aria-label="100%" />
        {/* loading = 不定（value を渡さない）。Radix は aria-valuenow を出さない */}
        <Progress aria-label="読み込み中（不定）" />
      </Stack>
    </div>
  ),
};
