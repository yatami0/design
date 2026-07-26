import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

/**
 * ★ Q3 の答えが出る部品。**state は持たないが `TooltipProvider` の配線が必須**（部品カタログ 表4）。
 *
 * 配線は story 内の decorator で解決した（部品本体は 1 行も触っていない）。
 * preview.tsx の decorator で全 story に配る手もあるが、**Provider を要求する部品はこれ 1 つ**なので、
 * 全体に配ると「どの部品が配線を要求しているか」が story から読めなくなる。
 * → 部品カタログ 表2 の指摘 1・3（「部品でないもの」の置き場が無い・`provider` フラグが要る）が
 *   実装でも同じ形で顕在化した。
 *
 * ★ 手5 の判定対象: `rounded-[2px]` と `translate-y-[calc(-50% - 2px)]`（純粋な生値。DR-0010 の (C)）。
 */
const meta = {
  title: 'Overlay/Tooltip',
  component: Tooltip,
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">ホバーして表示</Button>
      </TooltipTrigger>
      <TooltipContent>担当者を割り当てる</TooltipContent>
    </Tooltip>
  ),
};

/** 常時表示。手5 で角丸（rounded-[2px]）が変わらないことを目視するための story。 */
export const AlwaysOpen: Story = {
  render: () => (
    <Tooltip open>
      <TooltipTrigger asChild>
        <Button variant="outline">開いた状態</Button>
      </TooltipTrigger>
      <TooltipContent>rounded-[2px] は --radius に追従しない</TooltipContent>
    </Tooltip>
  ),
};
