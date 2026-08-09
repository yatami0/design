import type { Meta, StoryObj } from '@storybook/react-vite';

import { Stack } from '@/components/Layout/Stack';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Selection/Select';

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
 */
export const Widths: Story = {
  render: () => (
    <Stack gap="md" align="start">
      {(['sm', 'md', 'lg'] as const).map((width) => (
        <Select key={width}>
          <SelectTrigger width={width} aria-label={`w-field-${width}`}>
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
};
