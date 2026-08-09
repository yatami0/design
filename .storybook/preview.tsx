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

    // 🆕 部品1 B1-05（2026-08-09）— [完成バー](../docs/部品の完成バー.md) 面② を機械で効かせる。
    //
    // 🟥 **2026-07-26 から 'todo'（＝出すが落とさない）だった。**目盛りを一度も読まないまま
    //    286 件たまった（出荷物の棚で 88 件）。addon-vitest を入れた（B1-02）ので落とす経路ができた。
    a11y: {
      test: 'error',
      options: {
        rules: {
          // 🟨 **serious の color-contrast は落とさない（バー §3）。**
          //    77 件を色の組で畳んだら 7 種類・全部トークンの組で、**① 層の配色の決定**だった
          //    （最多は --muted-foreground が 13 部品に 44 件）。**部品側では直せない。**
          //    落とすと直せない赤が常時点灯し、「新しい赤を見つける」運用が壊れる。
          //    🟦 **消したのではない**——`.context/a11y-detail.mjs` が数え続け、
          //    判断は [OBS-0017](../docs/OBS/OBS-0017_意味色とfillの対比が全滅している.md) が持つ。
          'color-contrast': { enabled: false },
          // storybook の iframe に <main> が無いことによる harness 由来（部品の欠陥ではない）
          region: { enabled: false },
        },
      },
    },
  },
};

export default preview;

// 🆕 部品1 B1-06a（2026-08-09）— [完成バー](../docs/部品の完成バー.md) 面①（描画された）を機械で効かせる。
//
// ★★★ 🟥 **バー文書は面① を「🟥 落とす」と宣言していたのに、実装が 1 行も無かった。**
//    実測: `() => null` を描くだけの空 story を足したら、バーは **96/96 緑**で通った。
//    面② は `a11y.test: 'error'` で効いていたが、**a11y は「中身が無い」を違反として出さない**
//    （空の DOM には違反すべきノードが無いので、**空は 0 件 ＝ 緑**）。
//    ★ **「対象 0 件で緑」ではなく「目盛りを書いて針を付けなかった」形**——
//    [DR-0094](../docs/DR/DR-0094-the-bar-engine-ran-without-any-css.md)（エンジンが CSS 無しで走っていた）と同じ
//    **「バー自身が測れていない」系**の 2 例目。
//
// 🟥 **`#storybook-root` だけを見てはいけない**（バー §0 罠 3）。実測——
//    `Dialog/Open` は **`canvasElement` の子孫が 0** で、中身は `document.body` 直下の
//    `#radix-_r_3_`（`[role=dialog]`）に出ている。root だけ見ると
//    **空 story と `Dialog/Open` が同じ絵になり、正しい部品を落とす。**
// 🟥 **`textContent` でも測らない**——`Spacer` / `Separator` は文字を持たない部品。
// → **判定は「大きさ」**: canvas ＋ portal の中に、**0 でない大きさの要素が 1 つ以上**。

/** storybook の harness が `document.body` 直下に置くもの（部品ではない）。実測で毎回この 5 件。 */
const isHarness = (el: Element) =>
  el.classList.contains('sb-wrapper') ||
  el.id === 'storybook-a11y-vision-filters';

/** canvas の外に出た描画先（Radix の portal 等）。canvas の祖先は除く。 */
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
  // 🟥 **待つ。**同期に測ると CSS が当たる前の大きさ（0）を読み、**正しい部品を落とす**
  //    ——面④ で実際に踏んだ形（[DR-0094]）。500ms を上限に取り直す。
  for (let i = 0; i < 20 && !hasVisibleContent(canvasElement); i++) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  if (hasVisibleContent(canvasElement)) return;
  throw new Error(
    '完成バー 面①: この story は描画されていない（canvas にも portal にも、大きさを持つ要素が 1 つも無い）。' +
      '意図的に何も描かない story なら、まず「なぜ部品として出荷するのか」を書く。',
  );
};
