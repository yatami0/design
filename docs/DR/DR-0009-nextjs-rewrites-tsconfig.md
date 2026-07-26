---
id: DR-0009
type: finding
title: 'Next.js 16 は build 時に tsconfig.json を書き換える（hook をすり抜ける経路）'
status: observed
date: 2026-07-26
step: 手0
related: [DR-0003]
poc_feedback: '🟥 PoC 側で要確認 → OBS 候補'
---

# DR-0009: Next.js 16 は build 時に tsconfig.json を書き換える

## 背景

手0 で `pnpm build` を初めて通したとき、`tsconfig.json` が勝手に変更された。

## 発見

**`next build` は `tsconfig.json` を書き換える。**実測で変更されたのは:

| 項目 | 変更 |
|---|---|
| `jsx` | `"preserve"` → **`"react-jsx"`**（「mandatory changes」として） |
| `esModuleInterop` | `true` を追加（SWC / babel の要件） |
| `resolveJsonModule` | `true` を追加（webpack 解決に合わせるため） |
| `include` | `.next/dev/types/**/*.ts` を追加 |

**PoC への含意（🟥 未確認）**

PoC の `@repo/typescript-config/nextjs.json` は `"jsx": "preserve"` を宣言している。しかし app 側の tsconfig に `react-jsx` が書き込まれれば、**共有設定の宣言は実質無効になる**。
ところが PoC の `apps/redmine/tsconfig.json` には現在それらの追記が無く、一方で handoff は `pnpm --filter redmine build` が緑だったと記録している。**この 2 つは整合しない可能性がある。**

**もう 1 つの含意**

PoC の `.claude/hooks/block-product-edit.mjs` は **Claude の編集を止めるが、Next 自身の書き換えは止めない**。成果物が「人以外の手」で変わる経路がここにある。

## 根拠（実測）

`pnpm build` の出力（design repo・next 16.2.10）:

```
We detected TypeScript in your project and reconfigured your tsconfig.json file for you.
  - include was updated to add '.next/dev/types/**/*.ts'
The following mandatory changes were made to your tsconfig.json:
  - esModuleInterop was set to true (requirement for SWC / babel)
  - resolveJsonModule was set to true (to match webpack resolution)
  - jsx was set to react-jsx (next.js uses the React automatic runtime)
```

## 影響

- 手9 で PoC へ移送する際、**PoC 側の共有 tsconfig の `jsx: preserve` が本当に効いているか**を確認する必要がある。
- 確認方法: PoC で `pnpm --filter redmine build` を回した後に `git diff apps/redmine/tsconfig.json` を見る。

## 関連

- [実行記録.md](../実行記録.md) §手0
