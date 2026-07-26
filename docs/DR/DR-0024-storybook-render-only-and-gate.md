---
id: DR-0024
type: decision
title: 'Storybook は描画のみ（+ a11y）で導入し、storybook build を機械ゲートに追加する'
status: decided
date: 2026-07-26
step: 手2b
related: [DR-0017, DR-0023, DR-0025]
poc_feedback: 'ADR-0009（ビジュアル回帰）の判断材料。「描画のみで足りた」が実測結果'
---

# DR-0024: Storybook は描画のみで導入し、`storybook build` をゲートに入れる

## 背景

[DR-0017](DR-0017-storybook-as-catalog.md) は Storybook の採用を決めたが、**どこまで入れるか**を 2 つ未決に残していた
（handoff 未決 #8「`@storybook/addon-vitest`（＋ Playwright）まで入れるか」／ #9「`storybook build` を機械ゲートに入れるか」）。
手2b で両方に答えを出した。

## 決定

1. **描画のみで導入する。**`@storybook/addon-vitest` / `vitest` / `playwright` / `@vitest/browser-playwright` /
   `@vitest/coverage-v8` / `@chromatic-com/storybook` / `@storybook/addon-mcp` は**入れない**。
2. ただし **`@storybook/addon-a11y` は残す**（例外）。
3. **`storybook build` を機械ゲートに追加する**（ゲートは 5 本 → **6 本**）。

### 1. 比較した 3 案（未決 #8 の答え）

| 案                                       | 内容                                                       | 採否            |
| ---------------------------------------- | ------------------------------------------------------------ | --------------- |
| **A** init の既定を全部残す              | addon-vitest + Playwright + chromatic + mcp を含む 13 依存    | ❌              |
| **B** 描画のみに削る                     | test 系・SaaS 連携・MCP を全部外す                            | 🟨 ほぼ採用     |
| **C** 描画 + a11y + docs                 | B に `addon-a11y` を残す                                      | ✅ **採用**     |

**A を採らなかった理由**（4 つ。すべて手2b の実測後も成立している）

1. 🟥 **Playwright のブラウザバイナリまで引き込む。**[DR-0016](DR-0016-shadcn-deps-are-caret-ranges.md) で「shadcn が 7 件の `^` 依存を足した」ことを移送コストとして記録したが、
   A はそれを桁で超える。**PoC の catalog には vite も playwright も storybook も 1 つも無い。**
2. 🟥 **PoC の ADR-0009（ビジュアル回帰）は `proposed` で、判断条件が「UI が固まってから」。**手2b 時点で UI は固まっていない＝**判断条件を満たしていない**。
3. **必要性が 1 度も証明されていない**（2 回ルール）。DR-0017 が Storybook に与えた役割は「手5 の判定装置」であり、それには描画で足りるかを先に確かめるべき。
4. ★ **実測で「描画で足りる」ことが確認できた**（手2b Q4）。予行演習（H2B-07）で「どこが変わらなかったか」を
   **生成 CSS の静的分類と実効値の計算だけで列挙できた**（→ [DR-0027](DR-0027-token-swap-not-detectable-by-css-diff.md)）。ブラウザ実行は要らなかった。

**`addon-a11y` だけ例外にした理由**

[DR-0023](DR-0023-real-conflict-is-touch-target.md) で **touch-min 44px の衝突が未決になった**（handoff 未決 #11）。
`addon-a11y` は **axe-core のみでブラウザバイナリを引かず**、その未決を機械で測る手段をゼロコストで与える。
「必要性が既に 1 度証明されている」唯一の addon。

### 2. `storybook build` をゲートに入れる（未決 #9 の答え）

DR-0017 が挙げた最大のリスクは「**本体では通るが Storybook では壊れる**」。
Vite が本体（Next / Turbopack）と別系統のパイプラインとして増えるため、**両者が食い違っても誰も気づかない**状態になる。
ゲートに入れなければ、そのリスクを観測する手段が無い。

```
pnpm typecheck && pnpm lint && pnpm build && pnpm format:check && pnpm spell && pnpm build-storybook
```

## 根拠（実測）

2026-07-26・手2b。

| 観測                                        | 値                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| init が入れた devDependency                 | **13 件**（Playwright のブラウザバイナリのダウンロードを含む）              |
| 削った後の増分                              | **6 件**（`storybook` / `@storybook/nextjs-vite` / `addon-a11y` / `addon-docs` / `eslint-plugin-storybook` / `vite`） |
| 依存の合計                                  | 22 → **28**                                                                |
| `pnpm-lock.yaml` の増分                     | **+1,991 行**                                                              |
| `^` レンジ                                  | **7 件のまま**（すべて shadcn 由来。Storybook 側は全件厳密ピン）            |
| `build-storybook`                           | 🟦 **緑**（本体の `build` は typecheck で赤のままでも通る）                 |
| ゲートの新しい赤                            | **ゼロ**（typecheck 1 / lint 33 はベースラインどおり）                      |

## 影響

- 🟦 **未決 #8・#9 が閉じた。**
- 🟥 **手9 の移送コストが確定した。**PoC の catalog に**厳密ピンで 6 パッケージを追加**することになる（shadcn の 7 件と合わせて 13 件）。
- 🟨 `addon-vitest` は**捨てたのではなく保留**。PoC の ADR-0009 が「UI が固まってから」判断する設計なので、
  **手7 以降で UI が固まった時点が判断のタイミング**になる。そのとき本 repo の story がそのまま portable stories として使える。
- 🟨 `@storybook/addon-mcp`（Storybook を MCP 経由で AI に露出する）は**手7 の別経路になりうる**ので外したうえで未決に残した。

## 関連

- 手順書: [docs/手順/手2b_UIカタログStorybook.md](../手順/手2b_UIカタログStorybook.md) §2 D3・D4・D10・D11
- 実測の記録: [docs/実行記録.md](../実行記録.md) §手2b
