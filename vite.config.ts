// 工程1 — 土台の入れ替え（Next → Vite）。手順書 P1-03。
//
// この repo の出荷物は「アプリ」ではなく「ライブラリ ＋ カタログ」（DR-0078 / DR-0079）。
// だから build は lib モード 1 本で、JS と .d.ts（vite-plugin-dts）を同時に出す。
// 手6 の継ぎ木（tsconfig.dts.json ＋ tools/dts-alias.mjs）はこれで消える（工程1 Q3）。
//
// 🟥 `vite build` は型検査をしない（esbuild 変換のみ）。型の網は
//    `tsc --noEmit`（ゲート 1 本目）と vite-plugin-dts の宣言生成が持つ——
//    K1 赤テストの実測は docs/実行記録.md §工程1。
//
// D10=A: この 1 本を Storybook（@storybook/react-vite）とも共有する。
//    lib モードの build.lib / external が storybook build に漏れて干渉したら、
//    実測を記録してから設定を分離する（手順書 §2 D10）。
import path from 'node:path';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    // shadcn（components.json）と tsconfig の paths に合わせる
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  plugins: [
    react(),
    tailwindcss(),
    dts({
      // 宣言は converter（/design-sync）が読む「API 契約」。旧 tsconfig.dts.json と
      // 同じ射程: story と旧 src/app は出さない。
      // 置き場は dist/ 直下に JS と共置（D11。outDir 指定は v5.0.3 が無視した——実測）。
      // converter へは package.json の `types: "dist/index.d.ts"` で根を教える
      include: ['src'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/stories/**',
        'src/app/**',
        // 🆕 工程2: **題材（Redmine）は出荷しない**（データモデル §6）。
        // 🟥 実測で分かったこと: dts の射程は `include`、JS の射程は「entry からの到達可能性」で、
        //    **2 本ある**。src/mocks は design.mjs に 1 バイトも入らないのに `.d.ts` だけ出ていた。
        //    → 塞ぐ前に測った差分は 実行記録 §工程2（K4）。
        'src/mocks/**',
        'src/redmine/**',
      ],
      entryRoot: 'src',
    }),
  ],
  build: {
    // 🆕 工程2: `public/` は **Storybook に worker を配るため**に生えたもの（msw init）。
    // 🟥 既定では `vite build` がそれを dist へ丸ごと写す＝**ライブラリの出荷物に
    //    mockServiceWorker.js が混ざる**（実測。K4 で見つけた）。lib モードに public は要らない。
    copyPublicDir: false,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'design',
    },
    rollupOptions: {
      // ランタイム依存は同梱しない（利用側の node_modules を使う）。
      // package.json dependencies と 1:1 — 依存を増減したらここも追随する
      external: [
        /^react($|\/)/,
        /^react-dom($|\/)/,
        /^@tanstack\/react-table($|\/)/,
        /^class-variance-authority($|\/)/,
        /^clsx($|\/)/,
        /^lucide-react($|\/)/,
        /^radix-ui($|\/)/,
        /^shadcn($|\/)/,
        /^tailwind-merge($|\/)/,
        /^tw-animate-css($|\/)/,
      ],
    },
  },
});
