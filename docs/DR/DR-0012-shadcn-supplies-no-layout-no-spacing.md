---
id: DR-0012
type: finding
title: 'shadcn は Layout プリミティブも spacing / typography トークンも供給しない'
status: observed
date: 2026-07-26
step: 手1
related: [DR-0005, DR-0015]
poc_feedback: null
---

# DR-0012: shadcn は Layout プリミティブも spacing / typography トークンも供給しない

## 背景

[共通コンポーネント思想](../共通コンポーネント思想.md) は「Layout / Overlay は自作テンプレとして持つ」「Layout テンプレが取れる `gap` / `padding` を semantic token に限定する」と決めていた。shadcn がどこまで供給するかを確かめた。

## 発見

### ② Components 層 — Layout が全滅

| 思想の Layout カテゴリ | shadcn |
|---|---|
| Box / Stack / Grid / Container / Spacer / Section | ❌ **1 つも無い** |
| Card / Section 相当 | ✅ Card はある |

shadcn は**レイアウトプリミティブを提供しない方針**。配置は各所で Tailwind ユーティリティを直書きする。

### ① Tokens 層 — 色と radius しか無い

生成された `src/app/globals.css` の宣言を全件棚卸しした結果:

| 群 | 内容 | 有無 |
|---|---|---|
| 色 | `background`/`foreground` ペア（card / popover / primary / secondary / muted / accent / sidebar 系）・`destructive`・`border`・`input`・`ring`・`chart-1..5`・`sidebar-*` | ✅ ある |
| 角丸 | `--radius` と `--radius-sm..4xl`（`calc()` 派生） | ✅ ある |
| フォント | `--font-sans` / `--font-heading` の **2 つだけ**。サイズ階調は無し | 🟨 ほぼ無い |
| **余白（spacing）** | — | ❌ **1 つも無い** |
| **タイポのサイズ階調** | — | ❌ **無い** |

## 根拠（実測）

- 部品一覧（公式 docs・63 件）に Layout プリミティブが存在しない。手1 の [部品カタログ 表3](../部品カタログ.md#表3-欠落リストq5-の答え--手3-の作業対象) に列挙。
- `src/app/globals.css`（138 行・init が生成）の `@theme inline` / `:root` / `.dark` を全文確認。

## 影響

- 🟦 **思想の「Layout は自作テンプレで持つ」判断は実装上も正しかった。**ただし理由は思想の言う「数値とパターンを閉じ込めるため」だけでなく、**shadcn がそもそも提供しない**から。
- 🟥 **思想①「gap/padding を semantic token に限定する」は shadcn だけでは成立しない。**手2 で **semantic spacing と typography を自前定義するのが必須**。
- 一方 **Overlay は shadcn が十分に供給しており自作不要**（→ DR-0013）。思想が Layout と Overlay を同格で「自作テンプレ」としたのは、**Layout については正しく Overlay については過剰**だった。
- Tailwind v4 の `--spacing`（1 変数基準のスケール）を semantic spacing とみなすかは**手2 の判断**。

## 関連

- [部品カタログ.md](../部品カタログ.md) 表3
