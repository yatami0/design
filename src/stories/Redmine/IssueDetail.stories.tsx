// 工程4 D11=B — ★ 題材の画面（詳細＋編集）。**出荷しない**（`src/index.ts` に載せない・K5）。
//
// 🟥 **編集は db を書き換える**ので、story 間の干渉を `resetDb()` で断つ（工程2 が用意した口）。
// 🟥 **`storybook build` の緑は描画も保存も保証しない**（DR-0048 を工程2・工程3 で 2 度踏んだ）。
//    K1〜K3（PUT が飛んだか・不正値で飛ばないか・取り直して変わるか）は **Playwright で打つ**。
import type { Meta, StoryObj } from '@storybook/react-vite';

import { AppProviders } from '@/components/providers';
import { Container } from '@/components/Layout/Container';
import { resetDb } from '@/mocks/db';
import { IssueDetail } from '@/redmine/screens/IssueDetail';

const meta = {
  title: '⑤ 題材（Redmine）/チケット詳細',
  component: IssueDetail,
  // 🟦 own: 画面（題材）。コアの部品カタログではない
  tags: ['own'],
  decorators: [
    (Story) => (
      <AppProviders>
        <Container>
          <Story />
        </Container>
      </AppProviders>
    ),
  ],
} satisfies Meta<typeof IssueDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 単票の閲覧と編集。`include=journals,relations` で取るので**変更履歴が出る**
 * （一覧では取れない・データモデル §4 ②）。
 *
 * 保存すると `[msw] PUT /issues/1.json {...}` が console に出る（K1 の証拠）。
 * 🟥 **body に載るのは変えた項目だけ**——全項目が載っていたら他人の編集を踏み潰す形。
 */
export const Default: Story = {
  loaders: [
    () => {
      resetDb();
      return {};
    },
  ],
  args: { id: 1001 },
};
