---
id: DR-0017
type: decision
title: 'UI カタログは Storybook を採用し手2b として挿入する（階層は役割 9 カテゴリ）'
status: decided
date: 2026-07-26
step: 手2b
related: [DR-0002, DR-0010, DR-0018]
poc_feedback: 'ADR-0009（ビジュアル回帰）の判断材料になる'
---

# DR-0017: UI カタログは Storybook を採用し手2b として挿入する

## 背景

⚠ **段取り（手0〜手9）に UI カタログが一度も入っていなかった。**ユーザーの指摘で発覚。

見落としの度合いは大きい。根拠は最初から手元にあった——PoC の `docs/framework/architecture.md` §3.6 は
**「UI カタログ = Storybook（描画のみ）」**をテスト層の表に明記し、**「story を単一ソースにする」**
（loading / error / empty を 1 回書き、Vitest portable stories / Storybook / 将来のスナップショットで使い回す）
を方針としている。これを「部品層を先にやる根拠」として引用しておきながら、段取りに落とさなかった。

## 決定

1. **UI カタログは Storybook 10.5 を採用する**（ユーザー決定 2026-07-26）。
2. **フレームワークは `@storybook/nextjs-vite`** を採る（webpack 版ではなく）。
3. **段取りに「手2b」を新設**し、手2 の後・手3 の前に置く。
4. **カタログの階層は役割 9 カテゴリで揃える**（`title: 'Action/Button'`）。
5. **開発カタログと Claude Design への受け渡しは別物として扱う**（→ DR-0018）。Storybook は手6 を賄わない。

### なぜ手2b（枝番）か

- 導入・配線は部品作成と**独立した問題**（互換性リスクの出どころが違う）。分けておくと赤の原因を切り分けられる——PoC の「gate を 3 回に割る」と同型。
- 手2 のトークン語彙をカタログ最初のページにでき、手3 以降は部品を作るたびに載せていける。
- **手5（トークン差し替え実験）の 3 手前**に入るので、判定装置として間に合う。

### なぜ Storybook が手5 に要るのか

DR-0010 により、手5 の判定は「変わったか / 変わらなかったか」の二値ではなく
**「どこが変わらなかったか」を列挙する形**になった。**列挙するには全部品を一望できる面が要る。**
1 画面（手4 の一覧）だけを見ても、部品ごとの変化は見えない。
→ **Storybook は開発補助ではなく、手5 の判定装置。**

### なぜ nextjs-vite か

- 公式が Vite 版を推奨（「faster, more modern」。webpack 版は「custom Webpack / Babel 設定が Vite と非互換な場合」向け）
- **PoC は Vitest 統一方針**（`architecture.md` §3.6）で、`@storybook/addon-vitest` は Vite ベース。portable stories を後で使うなら Vite 側に揃うのが自然
- Next 16 は Turbopack が既定だが、Storybook は自前のバンドラを使うので Next の bundler 選択とは無関係

## 根拠（実測・2026-07-26 npm registry）

| パッケージ | 版 | peer |
|---|---|---|
| `@storybook/nextjs-vite` | 10.5.4 | `next: ^14.1.0 \|\| ^15.0.0 \|\| **^16.0.0**` / `react: ^19` / `vite: ^5〜^8` |
| `@storybook/nextjs`（webpack） | 10.5.4 | `next: ^16.0.0` も明示 / `webpack: ^5` |
| `@storybook/addon-vitest` | 10.5.4 | `vitest: ^3 \|\| ^4`（**PoC の catalog は 4.1.10 で一致**）/ `@vitest/browser-playwright` |

Tailwind は PostCSS 経由で自動処理され、`.storybook/preview.ts` で `import '../src/app/globals.css'` するだけ（公式 recipe）。

## 影響

- 🟥 **Vite が新規依存**として入る。本 repo にも PoC にも今は無い。**本体の Next ビルドとは別系統のパイプラインが 1 本増える**＝「本体では通るが Storybook では壊れる」二重管理のリスクを抱える。手2b の観測項目に入れる。
- 🟥 `@storybook/addon-vitest` を使うなら **Playwright（`@vitest/browser-playwright`）も要る**。手2b で addon-vitest まで入れるかは手2b の判断ポイント。
- 🟦 PoC の **ADR-0009（ビジュアル回帰・`proposed`・判断条件は「UI が固まってから」）**の判断材料になる。
- 決定4 により、[部品カタログ.md](../部品カタログ.md) の表・Storybook の階層・Claude Design のペイン（DR-0018）が**同じ構造**で揃う。

## 手2b で答えを出す問い（手順書作成時の種）

| # | 問い |
|---|---|
| 1 | Storybook のビルドは本体と**同じ結果**になるか（Tailwind トークンが同じに解決されるか） |
| 2 | shadcn の部品（`src/components/ui/**`）に story を書くとき、**部品本体を触らずに済むか** |
| 3 | 役割 9 カテゴリを `title` の階層にしたとき、[部品カタログ 表2](../部品カタログ.md) の「分類できなかった 2 件」はどこに置かれるか |
| 4 | `@storybook/addon-vitest`（＋ Playwright）まで入れるか、描画のみに留めるか |
| 5 | Storybook 自体を機械ゲート（`storybook build`）に入れるか |

## 関連

- [UI検証の位置づけと段取り.md](../UI検証の位置づけと段取り.md) §5
- 出典（2026-07-26 取得）: [Storybook for Next.js（webpack）](https://storybook.js.org/docs/get-started/frameworks/nextjs) / [同（Vite）](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite) / [Tailwind recipe](https://storybook.js.org/recipes/tailwindcss)
