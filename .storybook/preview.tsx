// .storybook/preview.tsx
// Tailwind は globals.css を読むだけで通る（公式 recipe）。
// この 1 行が「Storybook と本体が同じトークンを見ているか」（手2b Q1）の配線点。
import '../src/app/globals.css';

import type { Preview } from '@storybook/nextjs-vite';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' — 違反はパネルに出すが失敗させない。
      // 手2b では addon-vitest を入れていない（D10）ので CI で落ちる経路は無い。
      // DR-0023（touch-min 44px）の測定手段として残している。
      test: 'todo',
    },
  },
};

export default preview;
