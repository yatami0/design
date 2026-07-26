---
id: DR-0014
type: finding
title: 'exactOptionalPropertyTypes: true と shadcn は非互換（移送時に必ず出る）'
status: observed
date: 2026-07-26
step: 手1
related: [DR-0003, DR-0007]
poc_feedback: '🟥 移送時に必ず出る。手3 で対処を決める'
---

# DR-0014: exactOptionalPropertyTypes: true と shadcn は非互換

## 背景

本 repo の tsconfig は PoC の `@repo/typescript-config/base.json` を逐語で写しており、`exactOptionalPropertyTypes: true` を含む（DR-0003）。shadcn の素のコードがこれを通るかが手1 の Q1 だった。

## 発見

**通らない。1 箇所で落ちる。**

```
src/components/ui/dropdown-menu.tsx:94:6
Type error: ... is not assignable to type 'DropdownMenuCheckboxItemProps'
with 'exactOptionalPropertyTypes: true'.
  Types of property 'checked' are incompatible.
    Type 'CheckedState | undefined' is not assignable to type 'CheckedState'.
```

`pnpm typecheck` と `pnpm build` の**両方が同一原因で赤**になる（`next build` は型検査を含むため）。

型系の lint も 9 件落ちる: `restrict-template-expressions` 4（`sidebar.tsx` 2・`use-mobile.ts` 1 ほか）／`no-confusing-void-expression` 4（`sidebar.tsx` 3・`use-mobile.ts` 1）／`react-hooks/set-state-in-effect` 1（`use-mobile.ts`）。

## 根拠（実測）

手1 の `pnpm typecheck` / `pnpm build` 出力（部品 18 件・shadcn CLI 4.15.0・base=radix）。

## 影響

🟥 **PoC の共有設定が定めている項目なので、移送時に必ずぶつかる。**

対処の選択肢（**手3 で決める**）:

| 案 | 内容 | 代償 |
|---|---|---|
| a | `exactOptionalPropertyTypes` を off にする | **PoC 全体の型の厳しさが落ちる**。共有設定の変更なので影響が広い |
| b | `dropdown-menu.tsx` を 1 行直す | **「部品を触る」**ことになる。手5 のベースラインが動く |
| c | `DropdownMenuCheckboxItem` を使わない（該当 export を削る） | 使える部品が減る。一覧画面では列表示切替に使いたい可能性がある |

⚠ **`build` が赤のままだと手4（画面を組んで見る）で詰まる。**遅くとも手3 の終わりまでに決着が要る。

## 関連

- [実行記録.md](../実行記録.md) §手1
