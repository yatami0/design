// 工程3 D1=A / D9=B — ★ 題材の画面。**出荷しない**（`src/index.ts` に載せない・K5）。
//
// 棚の第 1 階層 `⑤ 題材（Redmine）` はこの story が初めて作る——
// 出荷するもの（①〜④）と出荷しないもの（⑤）の線を、人が見る面にも出す（D9）。
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppProviders } from '@/components/providers';
import { BASE_DATE } from '@/mocks/data';
import { resetDb } from '@/mocks/db';
import { IssueList } from '@/redmine/screens/IssueList';

const meta = {
  title: '⑤ 題材（Redmine）/チケット一覧',
  component: IssueList,
  // 🟦 own: 画面（題材）。コアの部品カタログではない
  tags: ['own'],
  parameters: {
    // AppShell（Sidebar）を全幅で出す
    layout: 'fullscreen',
  },
  // 🟥 配線が要る（AppShell story と同じ穴・DR-0048 のコメント参照）。
  //    本体アプリの最外に置くものと同じ AppProviders を使う（SidebarProvider 直よりも実物に近い）。
  decorators: [
    (Story) => (
      <AppProviders>
        <Story />
      </AppProviders>
    ),
  ],
} satisfies Meta<typeof IssueList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 一覧の既定形。ステータス = 未完了（open・Redmine の既定挙動）・期間 = 全期間。
 * フィルタを操作すると URL が変わって取り直す（K1 の検体。証拠は console の
 * `[msw] GET /issues.json?...`）。
 */
export const Default: Story = {
  loaders: [
    () => {
      // story 間の干渉を断つ（工程2 D11 と同じ作法）
      resetDb();
      return {};
    },
  ],
  // 「今日」を生成データの基準日に固定する（決定論・工程2 D5 と同じ規律）
  args: { today: new Date(`${BASE_DATE}T12:00:00`) },
};
