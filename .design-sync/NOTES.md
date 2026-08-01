# design-sync NOTES（手6）

このリポジトリを `/design-sync` で同期するときの申し送り。
台帳側の正本は `docs/実行記録.md §手6` と `docs/手順/手6_ClaudeDesignへの同期.md`。

## リポジトリ固有の事情（次回も効く）

- **[GENERAL] この repo は Next.js アプリであってライブラリ package ではない。**
  `build: next build` は `dist/` を出さず、`exports` も無い。converter はビルド済み `dist/` を要求するので、
  そのままでは `[NO_DIST]` で止まる。
  - 対処 ①: `cfg.entry = "src/index.ts"`（TS ソースを直接 entry に渡す）。
    converter の bundler は tsconfig の `paths` を解決するプラグインを持つので `@/` のまま通る。
  - 対処 ②: `pnpm build:types`（`tsconfig.dts.json` → `dist/types`）で宣言を出し、
    `package.json` の `types` をそこへ向ける。**これが無いと部品が 1 件も見つからない**
    （converter は公開部品を `.d.ts` の PascalCase 値 export から数える）。
  - 対処 ③: `tools/dts-alias.mjs` で `.d.ts` 内の `@/` を相対指定子へ書き換える。
    **`tsc` は `paths` を出力に書き戻さず、converter 側の ts-morph には `paths` が無い**ので、
    書き換えないと `export { X } from '@/…'` が解決されず `exported PascalCase symbols: 0` になる。
    → `build:types` に組み込み済み。書き換え漏れがあれば `exit 1`。

- **同期範囲は手6 D2 で決めた「① Tokens ＋ 製品層 ＋ ③ ＋ ④」。**
  素材層 16 件（`② 素材層/…`）と ★ Review 6 件は `cfg.titleMap` の `null` で除外している。
  🟥 **素材層を足すときは手3 D3=B（画面は製品層しか見ない）を境界の向こうでも守れるか先に判断すること。**

- **`① Tokens` の story は部品ではないので `titleMap: null` で除外した。**
  トークン自体は `_ds_bundle.css`（Storybook から採取したコンパイル済み CSS）経由で
  `styles.css` の `@import` closure に載るので、design agent には届く。

- **`Sidebar` / `AppShell` は `cardMode: "single"`。**
  `[GRID_OVERFLOW]`（fixed/portal がセル外に出る）を validate が検出したため。

## 警告のうち「想定内」のもの

- **`[TOKENS_MISSING]` 9 件は全部 `--radix-*`。**
  Radix が実行時にインラインスタイルで設定する変数なので、静的なスタイルシートに無いのが正常。
  （validate 自身が「実行時に設定される変数は EXPECTED to be absent」と書いている）

## 🟥 Re-sync risks（次の実行が見張るもの）

- **[GENERAL] 🟥 フォントが本体と Storybook で食い違っている。**
  `src/app/layout.tsx` は `next/font/google` の **Geist** を読み込み `--font-sans` を `<html>` に挿す。
  **Storybook は `layout.tsx` を実行しない**ので `--font-sans` が未定義になり、
  `globals.css` の `@theme inline { --font-sans: var(--font-sans) }` が自己参照で解決不能になって
  **ブラウザ既定（セリフ体）に落ちる。**
  - compare は storybook と preview を突き合わせるので、**両側が同じフォールバックに落ちて「一致」に見える。**
    skill が名指しする通り、**この一致を合格として扱ってはいけない。**
  - 影響: このまま上げると **design agent が作る UI は全部セリフ体**になり、本体の見た目と違う。
  - 🟥 **未対処。**判断は `docs/手順/手6_ClaudeDesignへの同期.md` §2 D8。
- **`--font-sans: var(--font-sans)` は自己参照。**上の件の直接原因。
  本体では `layout.tsx` が同名の変数を上書きするので偶然動いているだけで、
  **Storybook・プレビュー・移送先（PoC）では成立しない。**
