---
id: DR-0083
type: finding
title: 'lib ビルドは use client を警告 0 で剥がす — ソースに残した決定は dist に届かない'
status: observed
date: 2026-08-07
step: 工程1
related: [DR-0079]
poc_feedback: '工場の規約: git 依存の出荷条項（Next の利用者は dist ではなく src を import する、または directive 保持の仕組みを入れる）'
---

# DR-0083: lib ビルドは use client を警告 0 で剥がす — ソースに残した決定は dist に届かない

## 背景

工程1 D4 で `'use client'` ディレクティブを「将来 Next で使い回すときに要る」ため**残す**と決めた。
Rollup 系バンドラは module level directive の警告を出す前提で「警告の件数を記録する」としていた。

## 発見

- ソースの部品層 4 ファイルが `'use client'` を持つが、**`dist/design.mjs` には 1 件も残らない**。
- **警告も 0 件**（Vite 8 の Rolldown はディレクティブを黙って捨てる。Rollup 時代の
  「Module level directives cause errors when bundled」警告すら出ない）。
- つまり **D4 の「残す」はソースの話でしかなく、出荷物（dist）には効いていない**。

## 根拠（実測）

- `grep -rl "'use client'" src/components src/patterns src/templates src/hooks | wc -l` → **4**
- `grep -c "use client" dist/design.mjs` → **0**
- ビルドログ（/tmp/vite-clean.txt 相当・実行記録 §工程1）に directive への言及 **0 行**（`grep -ci directive` = 0）
- 2026-08-07・vite 8.1.5（Rolldown 1.1.5）・formats: ['es']

## 影響

**観測から直接言えること**

- **git 依存の出荷（DR-0079）で Next の利用者に `dist/` を向けると、`'use client'` が失われた状態で届く。**
- ソース（`src/`）を直接 import させる形なら、ディレクティブは保たれる。

**🟥 推論（未検証）**

- Next の App Router で dist を import すると Client Component 境界が壊れて実行時エラーになるはず
  （`useState` 等が Server Component 扱いで落ちる）。使い回し先が実際に出た時点で実測する。
- `rollupOptions.output.preserveModules` や directive 保持プラグインで残せる可能性がある。
  **需要（Next の利用者）が出るまで入れない**——理由は「まだ利用者がおらず、正しい要件（dist か src か）を決められない」から。

## 関連

- 手順書: docs/手順/工程1_NextからViteへの土台入れ替え.md §2 D4
- 実測の記録: docs/実行記録.md §工程1
