// 工程5 — ★ 題材の画面（稼働表）。**出荷しない**（`src/index.ts` に載せない・K5）。
//
// 🟥 **D1=B の検体。**`PivotTable` を新設せず、まず `DataGrid` の既存 API だけで組んだもの。
//    **書けたかどうかではなく、書けたものが読めるか**を人と機械の両方で見る（Q1）。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';

import { AppProviders } from '@/components/providers';
import { BASE_DATE } from '@/mocks/data';
import { resetDb } from '@/mocks/db';
import { Workload } from '@/redmine/screens/Workload';

const meta = {
  title: '⑤ 題材（Redmine）/稼働表',
  component: Workload,
  // 🟦 own: 画面（題材）。コアの部品カタログではない
  tags: ['own'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <AppProviders>
        <Story />
      </AppProviders>
    ),
  ],
} satisfies Meta<typeof Workload>;

export default meta;
type Story = StoryObj<typeof meta>;

const today = new Date(`${BASE_DATE}T12:00:00`);

const reset = [
  () => {
    resetDb();
    return {};
  },
];

/**
 * 既定形（今週 = 7 列）。
 *
 * ★ **K1 の主張**——画面が出す監査行（`workload-audit`）で
 * **取得件数と API の申告件数が一致していること**を機械に読ませる。
 * 🟥 **「表に数字が出ている」では足りない**（1 セル合っていれば全部合って見える）。
 */
export const ThisWeek: Story = {
  loaders: reset,
  args: { today, initialPreset: 'thisWeek' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const audit = await waitFor(() => canvas.getByTestId('workload-audit'));
    // 取得件数 = API の申告件数（後方参照で「同じ数」を主張する）
    await waitFor(async () => {
      await expect(audit.textContent).toMatch(/件数 (\d+) \/ 申告 \1 /);
    });
    // 列は範囲から引く＝今週は必ず 7 日ぶん（データの有無に依らない）
    await expect(audit.textContent).toMatch(/列 7 /);
  },
};

/**
 * ★ **K6 — 四半期（92 列）。**
 * 🟥 **横スクロールで最後の列まで到達でき、行ヘッダ（人名）を見失わないはず**が期待。
 * 見失うなら Q1 の答えが「別部品」に倒れる証拠になる（実測は `tools/pivot-probe.mjs`）。
 */
export const QuarterNinetyColumns: Story = {
  loaders: reset,
  args: { today, initialPreset: 'thisQuarter' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const audit = await waitFor(() => canvas.getByTestId('workload-audit'));
    await waitFor(async () => {
      await expect(audit.textContent).toMatch(/件数 (\d+) \/ 申告 \1 /);
    });
    // 7-9 月 = 92 日。🟥 データに現れた日ではなく**範囲**から引いていることの主張
    await expect(audit.textContent).toMatch(/列 92 /);
  },
};

/**
 * 🟥 **一覧には無かった状態**——`all`（全期間）ではピボットが組めない。
 * 列の軸を範囲から引く以上、範囲が無いと表そのものが無い。
 * ★ 語彙 `all` は「EVM / 稼働表では全期間として意味を持つ」という理由で足された語だが
 * （`PeriodSelect` のコメント）、**日ごとの列を持つ表では意味を持たなかった。**
 */
export const AllPeriodCannotPivot: Story = {
  loaders: reset,
  args: { today, initialPreset: 'all' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('期間を選ぶ')).toBeInTheDocument();
    await expect(canvas.queryByTestId('workload-audit')).toBeNull();
  },
};
