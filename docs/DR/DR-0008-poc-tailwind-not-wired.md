---
id: DR-0008
type: finding
title: 'PoC の Tailwind はアプリに配線されていない（@tailwindcss/postcss が catalog に無い）'
status: observed
date: 2026-07-26
step: 手0
related: [DR-0005]
poc_feedback: 'OBS 候補（手9 で起票）'
---

# DR-0008: PoC の Tailwind はアプリに配線されていない

## 背景

手0 で Tailwind v4 を配線しようとしたとき、PoC 側の構成を写そうとしたが写す元が無かった。

## 発見

**PoC では Tailwind がアプリに一度も配線されていない。**

- `apps/` 配下に **CSS ファイルが 0 件**
- `apps/redmine/package.json` に **tailwind 系の依存が無い**
- `apps/redmine/src/app/layout.tsx` に **CSS の import が無い**
- PoC の catalog（`pnpm-workspace.yaml`）に **`@tailwindcss/postcss` が無い**

Tailwind v4 は「PostCSS プラグイン 1 個 + CSS の `@import`」で配線するため、**`@tailwindcss/postcss` が catalog に無いことは配線されていないことの機械的な証拠**になる。

一方で **`tailwindcss/no-arbitrary-value: 'error'` は既に立っており**（`packages/eslint-config/next.js` L84）、`packages/tailwind-config/theme.css`（トークン語彙の正本）も存在する。

## 根拠（実測）

```bash
find apps -name "*.css" -not -path "*/node_modules/*" -not -path "*/.next/*"   # → 0 件
grep -rn "tailwind" apps --include="*.ts" --include="*.tsx" --include="*.json" # → 0 件
grep -n "tailwind" pnpm-workspace.yaml   # → tailwindcss: 4.3.3 のみ。@tailwindcss/postcss は無い
```

## 影響

- **PoC は「守るための構造だけが先に立っていて、中身が空」**という状態。`theme.css` が孤立資産になっている理由がこれ。
- 本 repo の手0〜手2 は、**PoC 側で未着手の配線を hook に縛られない場所で先に踏む**ことになる。Claude Design の成否と無関係に価値が残る。
- 手9 で PoC へ戻すとき、`@tailwindcss/postcss` の catalog 追加が必要になる。

## 関連

- [実行記録.md](../実行記録.md) §手0
