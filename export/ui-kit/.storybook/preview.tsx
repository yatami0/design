// 持ち出し版 preview。元 repo との差分: msw（Redmine モック）の loader を外した。
// globals.css の 1 行が「Storybook と本体が同じトークンを見ているか」の配線点。
import '../src/styles/globals.css';

import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // a11y: serious の color-contrast はトークン（配色）側の問題で部品側では直せないため外す。
    // region は Storybook の iframe に <main> が無いことによる harness 由来。
    a11y: {
      options: {
        rules: {
          'color-contrast': { enabled: false },
          region: { enabled: false },
        },
      },
    },
  },
};

export default preview;

// 面①（描画された）チェック: canvas と portal（Radix の Dialog 等は body 直下に出る）の
// どちらにも「大きさを持つ要素」が 1 つも無い story を落とす。
// 空 story が a11y 0 件で緑になる穴を塞ぐ。不要なら丸ごと消してよい。
const isHarness = (el: Element) =>
  el.classList.contains('sb-wrapper') ||
  el.id === 'storybook-a11y-vision-filters';

const portalRoots = (canvasElement: HTMLElement) =>
  [...document.body.children].filter(
    (el) => !isHarness(el) && !el.contains(canvasElement),
  );

const hasVisibleContent = (canvasElement: HTMLElement) =>
  [canvasElement, ...portalRoots(canvasElement)]
    .flatMap((root) => [...root.querySelectorAll('*')])
    .some((el) => {
      const box = el.getBoundingClientRect();
      return box.width > 0 && box.height > 0;
    });

export const afterEach = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  for (let i = 0; i < 20 && !hasVisibleContent(canvasElement); i++) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  if (hasVisibleContent(canvasElement)) return;
  throw new Error(
    'この story は描画されていない（canvas にも portal にも、大きさを持つ要素が 1 つも無い）。',
  );
};
