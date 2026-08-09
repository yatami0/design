// .storybook/main.ts
// 手2b: UI カタログ（= 手5 の判定装置。DR-0017）の配線。
//
// init が既定で入れた addon のうち @chromatic-com/storybook / @storybook/addon-mcp は
// 外したまま（手順書 §2 D10・D11）。残したのは描画に要る docs と、
// touch-min 44px の未決（DR-0023）を機械で測れる a11y の 2 つだけ。
//
// 🆕 **部品1 B1-02（2026-08-09）で @storybook/addon-vitest を入れ直した。**
//    手2b D10 は「描画のみ」に削るために外していたが、外した結果
//    **a11y の目盛りを一度も読まない状態が 1 年分たまった**（初計測で 286 件・
//    出荷物の棚だけで 93 件）。`a11y: { test: 'todo' }` が失敗させない設定なのは、
//    **落とす経路そのものが無かった**から。これがその経路。
//    🟥 未決 #14 の唯一の論点だった「移送コスト」は、手9 廃止（DR-0078）＋
//    工程4 D13（devDependencies は出荷しない）で消えている。
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // story は src/stories/<役割カテゴリ>/ に置く（D5）。
  // src/components/ui/ に置かないのは、.prettierignore がそこを丸ごと除外しており
  // story が整形ゲートの外に出てしまうため。story は自分で書くコードなので検査対象に残す。
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
  ],
  framework: '@storybook/react-vite',
  // 工程2: MSW の worker スクリプト（`msw init public/` の生成物）を配る。
  // 🟥 これが無いと worker の登録に失敗する——**そして story は「0 件」で緑になる**。
  staticDirs: ['../public'],
};

export default config;
