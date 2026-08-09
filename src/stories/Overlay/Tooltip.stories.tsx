import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/Overlay/Tooltip';
import { Button } from '@/components/Action/Button';
import { expectOpened } from '../opened';

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
  title: '② 素材層/Overlay/Tooltip',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
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

/**
 * 常時表示。手5 で角丸（rounded-[2px]）が変わらないことを目視するための story。
 *
 * 🆕 ★★★ **部品4 C4-02（D6=B）で「開いていることの主張」を足した。**
 * 🟥 **[DR-0096](../../../docs/DR/DR-0096-overlays-that-no-story-opens-are-invisible-to-every-check.md) は
 * この story を数え落として「`Tooltip` の中身はいまも開かれていない」と書いた**——
 * **数え方が「story 名に `Open` が付くか」だったので `AlwaysOpen` が漏れた**（部品4 Q3）。
 * ★ **主張が無ければ、`open` prop を外しても誰も気づかない**——
 * **たまたま開いていた状態を、機械が要求する状態に変える。**
 */
export const AlwaysOpen: Story = {
  render: () => (
    <Tooltip open>
      <TooltipTrigger asChild>
        <Button variant="outline">開いた状態</Button>
      </TooltipTrigger>
      <TooltipContent>rounded-[2px] は --radius に追従しない</TooltipContent>
    </Tooltip>
  ),
  play: async () => {
    await expectOpened('tooltip-content');
  },
};
