// .storybook/main.ts
// 手2b: UI カタログ（= 手5 の判定装置。DR-0017）の配線。
//
// init が既定で入れた addon のうち @storybook/addon-vitest / @chromatic-com/storybook /
// @storybook/addon-mcp は外した（手順書 §2 D10・D11）。残したのは描画に要る docs と、
// touch-min 44px の未決（DR-0023）を機械で測れる a11y の 2 つだけ。
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // story は src/stories/<役割カテゴリ>/ に置く（D5）。
  // src/components/ui/ に置かないのは、.prettierignore がそこを丸ごと除外しており
  // story が整形ゲートの外に出てしまうため。story は自分で書くコードなので検査対象に残す。
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
  // 工程2: MSW の worker スクリプト（`msw init public/` の生成物）を配る。
  // 🟥 これが無いと worker の登録に失敗する——**そして story は「0 件」で緑になる**。
  staticDirs: ['../public'],
};

export default config;
