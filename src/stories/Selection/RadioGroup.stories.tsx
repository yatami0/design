import type { Meta, StoryObj } from '@storybook/react-vite';

import { Label } from '@/components/Display/Label';
import { RadioGroup, RadioGroupItem } from '@/components/Selection/RadioGroup';
import { Stack } from '@/components/Layout/Stack';

/**
 * 部品2 C2-04 — [完成バー](../../../docs/部品の完成バー.md) 面③ を**最初から**置く。
 *
 * | 面 | 扱い |
 * | --- | --- |
 * | `default` / `focus-visible` / `disabled` / `invalid` / `overflow` | ★ story で持つ |
 * | `hover` | 🟨 **対象外**——`radio-group.tsx` は hover の視覚変化を 1 つも持たない（`focus-visible` と `data-checked` だけ） |
 * | `loading` | 🟨 **対象外**——非同期を持たない（選択肢は props で同期的に渡る） |
 * | `empty` | 🟨 **対象外**——データを受けない（項目は children） |
 */
const meta = {
  title: '② 素材層/Selection/RadioGroup',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: RadioGroup,
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 🟥 素の `RadioGroupItem` は `role="radio"` の `button` で、**中身を持たない**。
 * `Checkbox` と同じで、**名前は使う側が与える**（部品1 B1-05 の実測）。
 */
export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="all">
      <div className="flex items-center gap-inline-sm">
        <RadioGroupItem value="all" id="rg-all" />
        <Label htmlFor="rg-all">すべて</Label>
      </div>
      <div className="flex items-center gap-inline-sm">
        <RadioGroupItem value="open" id="rg-open" />
        <Label htmlFor="rg-open">未完了のみ</Label>
      </div>
      <div className="flex items-center gap-inline-sm">
        <RadioGroupItem value="closed" id="rg-closed" />
        <Label htmlFor="rg-closed">完了のみ</Label>
      </div>
    </RadioGroup>
  ),
};

/** 面③ — `focus-visible` は実操作で撮る（絵で偽装しない・[DR-0054](../../../docs/DR/DR-0054-mock-specimens-cannot-reproduce-stacked-states.md)） */
export const States: Story = {
  render: () => (
    <Stack gap="md">
      <RadioGroup defaultValue="b">
        <div className="flex items-center gap-inline-sm">
          <RadioGroupItem value="a" id="rg-s-a" />
          <Label htmlFor="rg-s-a">未選択</Label>
        </div>
        <div className="flex items-center gap-inline-sm">
          <RadioGroupItem value="b" id="rg-s-b" />
          <Label htmlFor="rg-s-b">選択済み</Label>
        </div>
        <div className="flex items-center gap-inline-sm">
          <RadioGroupItem value="c" id="rg-s-c" disabled />
          <Label htmlFor="rg-s-c">無効</Label>
        </div>
        <div className="flex items-center gap-inline-sm">
          <RadioGroupItem value="d" id="rg-s-d" aria-invalid />
          <Label htmlFor="rg-s-d">不正（aria-invalid）</Label>
        </div>
      </RadioGroup>
    </Stack>
  ),
};

/** 面③ `overflow` — 長いラベルで折り返しが崩れないか */
export const Overflow: Story = {
  render: () => (
    <RadioGroup defaultValue="long" className="max-w-64">
      <div className="flex items-start gap-inline-sm">
        <RadioGroupItem value="long" id="rg-of" />
        <Label htmlFor="rg-of">
          担当者が未設定で、かつ期日が今日より前のチケットだけを対象にする
        </Label>
      </div>
    </RadioGroup>
  ),
};
