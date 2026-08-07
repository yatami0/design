// .storybook/preview.tsx
// Tailwind は globals.css を読むだけで通る（公式 recipe）。
// この 1 行が「Storybook と本体が同じトークンを見ているか」（手2b Q1）の配線点。
import '../src/styles/globals.css';

import type { Preview } from '@storybook/react-vite';
import { setupWorker } from 'msw/browser';
import { mswLoader } from 'msw-storybook-addon/csf3';

import { handlers } from '../src/mocks/handlers';
import { REDMINE_BASE_URL } from '../src/redmine/client';

// 工程2 — MSW の起動（手順書 D6=A）。
//
// 🟨 **addon 3.0.0 で API が変わっていた**（2.x の `initialize` / `mswLoader` は無い）。
//    CSF 3.0 の口は `mswLoader(setup?)`——公式ドキュメント（README）に従った実測。
//
// 🟥 **`onUnhandledRequest` の既定は素通し。**素通しは「対象 0 件で緑」そのもの——
//    ハンドラが当たらなくても画面は静かに 0 件を描いて緑になる。だから error にする。
// 🟨 ただし **error を全リクエストに掛けると Storybook 自身の資材まで落ちる**
//    （service worker は全部を通すため）。→ **Redmine のパスだけ**を対象にする。
const startWorker = async () => {
  const worker = setupWorker();
  await worker.start({
    quiet: false,
    onUnhandledRequest(request, print) {
      if (!new URL(request.url).pathname.startsWith(REDMINE_BASE_URL)) return;
      print.error();
    },
  });
  return worker;
};

const preview: Preview = {
  // preview の loader は story の loader より先に走る（＝ worker の起動を待てる）
  loaders: [mswLoader(startWorker)],
  parameters: {
    msw: { handlers },

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
