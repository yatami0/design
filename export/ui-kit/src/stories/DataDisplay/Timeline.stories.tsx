// 工程4 D6/D7=A — ② 製品層・自作。出来事の縦の連なり（**器**）。
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Timeline } from '@/components/DataDisplay/Timeline';

const meta = {
  title: '② 製品層・自作/DataDisplay/Timeline',
  component: Timeline,
  tags: ['own'],
} satisfies Meta<typeof Timeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 変更履歴の形。
 * 🟥 **明細（`details`）の書式は部品が持つ**——呼び出し側は文字列だけを渡す。
 *    最初は呼び出し側が `className="text-label"` を書いていて、
 *    合成方針 §8-4（className はこの口を通さない）を自分で破っていた（工程4 Q4）。
 */
export const Default: Story = {
  args: {
    events: [
      {
        key: '1',
        title: '山田 太郎',
        meta: '2026-08-01 12:00',
        details: ['状態: 新規 → 進行中', '進捗: 0 → 30'],
      },
      {
        key: '2',
        title: '佐藤 花子',
        meta: '2026-08-05 09:30',
        details: ['担当: — → 山田 太郎'],
        children: '一次調査の結果を共有した。',
      },
    ],
  },
};

/** 明細を持たない出来事（見出しと時刻だけ）。 */
export const TitleOnly: Story = {
  args: {
    events: [
      { key: '1', title: '起票', meta: '2026-07-20 10:00' },
      { key: '2', title: '一次対応', meta: '2026-07-21 14:12' },
    ],
  },
};
