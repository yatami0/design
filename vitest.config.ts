// vitest.config.ts
// 部品1 B1-02（2026-08-09）— story を実ブラウザで走らせる経路。
//
// 🟥 **なぜ要るか**: `storybook build` は story が実行時に落ちても exit 0
//    （[DR-0048]。工程2・3・4 で 3 回踏んだ）。**描画の成否を見る網が 1 枚も無かった。**
//    さらに `addon-a11y` は 2026-07-26 から入っていたが `test: 'todo'` で、
//    **落とす経路そのものが無かった**——初計測で 286 件（出荷物の棚だけで 93 件）。
//
// 🟨 **jsdom ではなく実ブラウザ**にするのは、この repo が測りたいものが
//    **実効スタイル**（[DR-0090] 語彙クラスが tailwind-merge に落とされる／
//    `getComputedStyle` で初めて分かる）と **a11y のコントラスト**だから。
//    jsdom は CSS を計算しないので、どちらも測れない＝「対象 0 件で緑」になる。
//
// 🟥 **ゲート 6 本には入れていない**（部品1 D7）。critical を 0 にしてから足す——
//    赤いまま足すと「新しい赤」が見えなくなり、ベースライン運用が壊れる。
import storybookTest from '@storybook/addon-vitest/vitest-plugin';
import tailwindcss from '@tailwindcss/vite';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

import viteConfig from './vite.config';

export default defineConfig({
  // 🟥 **vitest は vite.config.ts を継承しない。**初回実行で 49 中 46 ファイルが
  //    `@/components/...` の解決に失敗して落ちた（実測。原因は 1 つだけだった）。
  // 🟦 **写しを作らず本体から引く。**`'@': …` を 2 箇所に書くと、
  //    DR-0090 の宿題 ①（語彙の写しが tokens.css と tw-merge.ts の 2 箇所にあり
  //    機械で守られていない）と同じ形をもう 1 つ増やすことになる。
  resolve: { alias: viteConfig.resolve?.alias },
  plugins: [
    // 🆕 部品2 D10（2026-08-09）— ★★★ 🟥 **これが無いと CSS が 1 行も当たらない。**
    //    `preview.tsx` は `globals.css` を import しているが、その中身は
    //    `@import 'tailwindcss'` で、**展開するのは `@tailwindcss/vite` プラグイン。**
    //    プラグインは `vite.config.ts` にしかなく、上の `resolve.alias` だけを
    //    引いていたので、**この runner は素の CSS しか見ていなかった。**
    //
    //    🟥 **本ファイル冒頭が「jsdom は CSS を計算しないので実ブラウザにする」と
    //    書いているのに、実ブラウザで CSS が空だった**——**理由に挙げた当のものが
    //    動いていなかった。**実測（部品2 C2-05）: 素の `<button>` は幅 0、
    //    素の `<span>小</span>` は 16px（文字幅）、thumb の背景は `rgba(0, 0, 0, 0)`。
    //    🟦 **部品1 の「critical 0」は無効にならない**——`button-name` 等は
    //    名前の有無だけを見るので CSS に依存しない。**依存するのは
    //    `color-contrast`（rule 単位で無効化済み）と面④ の実効値。**
    tailwindcss(),
    // configDir は本ファイルからの相対。main.ts の stories glob をそのまま使う。
    storybookTest({ configDir: '.storybook' }),
  ],
  test: {
    name: 'storybook',
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
    // 🟦 setupFiles は置かない。addon-vitest 10.3+ は .storybook/preview の注釈を
    //    自動適用し、setProjectAnnotations を自前で置くと「競合を避けるため自動適用を
    //    スキップした」と警告して**逆に効かなくなる**（初回実行で実測）。真実は preview.tsx 1 本。
  },
});
