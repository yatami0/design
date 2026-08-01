# design-sync NOTES（手6）

このリポジトリを `/design-sync` で同期するときの申し送り。
台帳側の正本は `docs/実行記録.md §手6` と `docs/手順/手6_ClaudeDesignへの同期.md`。

## リポジトリ固有の事情（次回も効く）

- **[GENERAL] この repo は Next.js アプリであってライブラリ package ではない。**
  `build: next build` は `dist/` を出さず、`exports` も無い。converter はビルド済み `dist/` を要求するので、
  そのままでは `[NO_DIST]` で止まる。**3 段そろって初めて部品が見つかる。**
  - ① `cfg.entry = "src/index.ts"`（TS ソースを直接 entry に渡す）。
    converter の bundler は tsconfig の `paths` を解決するプラグインを持つので `@/` のまま通る。
  - ② `pnpm build:types`（`tsconfig.dts.json` → `dist/types`）で宣言を出し、`package.json` の `types` をそこへ向ける。
    **これが無いと `exported PascalCase symbols: 0` になり、緑のまま部品 0 件で完走する。**
  - ③ `tools/dts-alias.mjs` で `.d.ts` 内の `@/` を相対指定子へ書き換える。
    **`tsc` は `paths` を出力に書き戻さず、converter 側の ts-morph には `paths` が無い。**
    → `build:types` に組み込み済み。書き換え漏れがあれば `exit 1`。

- ~~**同期範囲は手6 D2 で決めた「① Tokens ＋ 製品層 ＋ ③ ＋ ④」＝ 14 部品。**~~
  🆕 **手7 D5=A（2026-08-02）で素材層 16 件を足した。同期範囲は 30 部品。**
  ★ Review 6 件と ① Tokens は引き続き `cfg.titleMap` の `null` で除外している。
  🟥 **手3 D3=B（画面は製品層しか見ない）は、境界の向こうでは維持しないことにした。**
  1 周目の実測で **`Card` が無いために design agent がカード面を手組みした**ため（実行記録 §手7 Q4）。
  `src/index.ts` の import 元は**製品層の再輸出**であって `@/components/ui/**` ではない（窓口は 1 本のまま）。

### 🟥 2 周目（手7）で見張るもの — 事前に書いた予測

| # | 予測 | 外れたら何を意味するか |
| --- | --- | --- |
| 1 | **Overlay 5 件（`Dialog` / `DropdownMenu` / `Popover` / `Sheet` / `Tooltip`）で `[GRID_OVERFLOW]` が出る** | portal / fixed がセル外に出るため。**出たら `cfg.overrides.<Name>.cardMode: "single"` を足す**（`Sidebar` / `AppShell` と同じ）。🟥 **先回りでは足していない**——converter が検出するかどうかも観測点 |
| 2 | **カードは 14 → 30 になる** | カード数を決めるのは export ではなく **story**。素材層 16 件には story が 1 本ずつある。**30 でなければ、その前提が誤り** |
| 3 | ★ **`Box` + `bg-card rounded-md border` の手組みが消え、`Card` が使われる** | **語彙表（conventions header）は 1 文字も変えていない。**消えれば「宣言語彙を外れた原因は部品の欠落」が確定する。消えなければ**語彙表の書き方の問題** |
| 4 | **`_adherence.oxlintrc.json` の規則が 16 部品ぶん増える** | 受け手は `.d.ts` から規則を作る（[DR-0059](../docs/DR/DR-0059-receiver-generates-its-own-adherence-lint.md)）。素材層は `className` を受けるので、**Layout 部品のような厳しい規則にはならないはず** |
| 5 | 🟥 **`buildCmd` に `pnpm build:types` を入れた**（下記 Re-sync risk #1 への対処） | 入れる前は「型が古いまま緑で完走」しうる状態だった。**入れたことで risk #1 が塞がったかを確認する** |

- **`① Tokens` の story は部品ではないので `titleMap: null` で除外した。**
  トークン自体は `_ds_bundle.css`（Storybook から採取したコンパイル済み CSS）経由で
  `styles.css` の `@import` closure に載るので design agent には届く。**`tokens/` は空のまま**が正常。

- **`Sidebar` / `AppShell` は `cardMode: "single"`**（`[GRID_OVERFLOW]`＝fixed/portal がセル外に出るため）。

- **`guidelinesGlob` は明示指定。**既定の `docs/*.md` は工程記録（handoff・実行記録・段取り・思想への指摘）まで
  さらってしまい、design agent には雑音になる。**設計判断に効く 6 本だけ**に絞ってある。

## 警告のうち「想定内」のもの

- **`[TOKENS_MISSING]` 9 件は全部 `--radix-*`。**Radix が実行時にインラインスタイルで設定する変数なので、
  静的なスタイルシートに無いのが正常（validate 自身が「実行時に設定される変数は EXPECTED to be absent」と明記）。
- **`[CSS_FROM_STORYBOOK]`。**この repo は CSS を dist に出さないので、converter が
  参照 Storybook のコンパイル済み CSS を採る。これが唯一の CSS 供給経路。
- **`[REFERENCE_STALE?]`。**描画に影響しない config 変更（`guidelinesGlob` 等）でも出る。
  **DS のソースを触ったときだけ**参照 Storybook を建て直すこと。

## ✅ 解決済み（前回の実行で直した）

- **フォントが本体と Storybook で食い違っていた。**`--font-sans` が `@theme inline` で自己参照しており、
  埋めていたのは `layout.tsx` の `next/font`（Geist）だけだった。Storybook もプレビューも移送先も
  `layout.tsx` を実行しないのでセリフ体に落ち、**compare は両側が同じフォールバックに落ちて「一致」に見えていた。**
  → 自己参照と本体の上書きを両方外し、Tailwind v4 の既定スタックへ戻した（[DR-0058]）。
  🟥 **`tmp-admin` は `--font-sans` を定義していない**——① 層の欠落そのものは未解決。

## 🟥 Re-sync risks（次の実行が見張るもの）

| # | 見張るもの | なぜ |
| --- | --- | --- |
| 1 | 🟥 **`dist/types` の鮮度** | `pnpm build:types` を忘れると **古い型のまま緑で完走**する。部品の props を変えたら必ず先に走らせる |
| 2 | 🟥 **`src/index.ts` の export 漏れ** | conventions header の validate で `useListDetail` の漏れを 1 件検出した。**export していない hook / 型は design agent から使えない**のに、Storybook では story 内で呼べてしまうので気づけない |
| 3 | 🟨 **フォント実体は同梱していない** | いまは system stack。Geist 等を DS のフォントにするなら ① Tokens 層に置き、`cfg.extraFonts` で同梱する必要がある |
| 4 | 🟨 **`_ds_bundle.css` は参照 Storybook 由来** | Storybook のビルド設定が変わると CSS の中身も変わる。**DS ソースを触ったら参照を建て直す** |
| 5 | 🟨 **grade は `close` ゼロ・全件 `match`** | 部分的に verify した箇所は無い。story cap（既定 6）に当たった部品も無い（最大 4 story） |
| 6 | 🟨 **`.d.ts` の props に React の継承分が混ざる** | `ButtonProps` に `ref` / `className` / `style` 等が出る。**Layout 部品は `className` を受けない設計**なので、conventions header 側で明示的に打ち消してある |
