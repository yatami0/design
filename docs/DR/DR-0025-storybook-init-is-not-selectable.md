---
id: DR-0025
type: finding
title: 'storybook init は「描画のみ」を選べず、eslint 設定を壊れた状態にし、.storybook/** はどのゲートの射程にも入っていなかった'
status: observed
date: 2026-07-26
step: 手2b
related: [DR-0006, DR-0024]
poc_feedback: '🟥 移送時に必ず出る。PoC でも同じ init を踏むことになる'
---

# DR-0025: `storybook init` は「描画のみ」を選べない

## 背景

手2b の手順書 §2 **D3** で「**描画のみに留める**」と決めたうえで、再現性のために非対話で実行した。

```bash
pnpm dlx storybook@10.5.4 init --type nextjs --builder vite --yes --no-dev --no-agent
```

## 発見

### 1. 「描画のみ」を選ぶ経路が無い

`init` は **13 個の devDependency** を入れ、**Playwright のブラウザバイナリをダウンロードした**。
`--help` に addon を選ぶフラグは無く、`--yes` は「既定を全部入れる」を意味する。

| 分類            | 入れられたもの                                                                             |
| --------------- | ------------------------------------------------------------------------------------------ |
| 描画に要る      | `storybook` / `@storybook/nextjs-vite` / `vite` / `@storybook/addon-docs`                    |
| a11y            | `@storybook/addon-a11y`                                                                      |
| lint            | `eslint-plugin-storybook`                                                                    |
| 🟥 テスト一式    | `@storybook/addon-vitest` / `vitest` / `playwright` / `@vitest/browser-playwright` / `@vitest/coverage-v8` |
| 🟥 SaaS / AI 連携 | `@chromatic-com/storybook` / `@storybook/addon-mcp`                                          |

あわせて `vitest.config.ts` / `vitest.shims.d.ts` / `src/stories/`（Example 一式）を生成し、`.gitignore` を書き換えた。

### 2. 🟥 `eslint.config.mjs` を**壊れた状態**にした

`import storybook from 'eslint-plugin-storybook'` を**先頭に足しただけで、config 配列に追加していない**。

- 結果: **プラグインは 1 つも効いていない**のに、依存と import だけが残る。
- 本 repo の設定は `defineConfig(...)` の**呼び出し形式**なので、codemod が配列末尾を見つけられなかったと推測される。

### 3. 🟥 `.storybook/**` は**どのゲートの射程にも入っていなかった**

`tsconfig.json` の `include` が `src/**/*` と `*.config.ts` しか持たないため:

| ゲート                | `.storybook/**` の扱い                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| `pnpm typecheck`      | 🟥 **対象外**（意図的な型エラーを入れても検出されない）                                          |
| `pnpm lint`           | 🟥 **`Parsing error: … was not found by the project service` で 2 件落ちる**（検査されずにエラーだけ出る、最悪の状態） |
| `pnpm format:check`   | 🟦 対象                                                                                          |

## 根拠（実測）

すべて 2026-07-26。

- `git diff package.json` — devDependencies が 12 → 25 件（**+13**）
- init の出力 — `Installing Playwright browser binaries … Chrome Headless Shell 151`
- `git diff eslint.config.mjs` — 追加されたのは **import 行のみ**（1 hunk）。`grep -n storybook eslint.config.mjs` の結果も 2 行だけ
- `.storybook/main.ts` に `export const probe: number = 'x'` を入れて `pnpm typecheck` → **検出されない**。
  `tsconfig.json` の `include` に `.storybook/**/*.ts(x)` を足すと → `.storybook/main.ts(20,14): error TS2322` が出る（＝射程に入った）
- `pnpm lint` のベースライン 33 件に対し、init 直後は **41 件**（うち 2 件が `.storybook` の Parsing error）

## 影響

- 🟥 **PoC でも同じことが起きる。**PoC の `architecture.md` §3.6 は Storybook 採用を明記しており、
  移送時に同じ `init` を踏む。**「描画のみ」で入れたいなら init の後に削る工程が要る**——これは手順として PoC 側に渡す必要がある。
- 🟥 **`.storybook/**` をゲートに載せる設定は移送時に必ず要る。**`tsconfig.json` の `include` に足すだけだが、
  **足さないと「検査していないのに緑」**（PoC で実際に起きた「lint が対象 0 件で緑」と同型）。
- 🟨 **`eslint.config.mjs` の書式によって codemod が失敗する。**PoC は `@repo/eslint-config` としてパッケージ化しているので、
  同じ codemod がどう振る舞うかは移送時に確認が要る。
- 🟦 **一次情報を実測で置き換える規律が効いた 3 例目。**
  1 例目は [DR-0006](DR-0006-shadcn-base-radix-preset-nova.md)（CLI の設定モデルが公式 docs と違った）、
  2 例目は [DR-0022](DR-0022-shadcn-has-component-tokens.md)（3 層は実在した）。
  **今回は「ツールが書いた設定を読まずに信じると、効いていないものを効いていると思い込む」形。**

## 関連

- 手順書: [docs/手順/手2b_UIカタログStorybook.md](../手順/手2b_UIカタログStorybook.md) §2 追記・追記2（D10〜D14）
- 対処の決定: [DR-0024](DR-0024-storybook-render-only-and-gate.md)
