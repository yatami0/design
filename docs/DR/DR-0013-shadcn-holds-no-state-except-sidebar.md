---
id: DR-0013
type: finding
title: 'shadcn は Radix の薄い再輸出で state を持たない — 例外は Sidebar 1 つ'
status: observed
date: 2026-07-26
step: 手1
related: [DR-0006, DR-0012, DR-0015]
poc_feedback: null
---

# DR-0013: shadcn は Radix の薄い再輸出で state を持たない — 例外は Sidebar 1 つ

## 背景

[共通コンポーネント思想](../共通コンポーネント思想.md) は「状態・振る舞いは分類軸にせず、開閉は `useXxxModal()` / `useXxxDrawer()` へ切り出す」と決めていた。shadcn/Radix の実装がこれとどれだけ食い違うかで、手3 のラッパー層の工数が決まる。

## 発見

**食い違いは想定より小さい。**

| 部品 | shadcn の実装 | 思想との差 | ラップ |
|---|---|---|---|
| Dialog / Sheet / Popover / Dropdown Menu / Select | **Radix プリミティブの薄い再輸出**（`data-slot` を足すだけ）。`open` / `onOpenChange` は Radix の制御 props としてパススルーし、**shadcn のファイル自身は state を持たない** | 🟦 ほぼ無い | ❌ 不要 |
| Checkbox / Select（値） | 同上 | 🟦 無い | ❌ 不要 |
| **Sidebar** | ⚠ **`useState` + `createContext` + Provider + cookie 永続 + キーボードショートカット（Cmd/Ctrl+B）を内包** | 🟥 **正面から反する** | ✅ 要検討 |
| Tooltip | state は無いが **`TooltipProvider` の配線が必須** | 🟨 種類が違う差分 | 🟨 Provider を束ねる場所が要る |

**`useXxxModal()` が `{open, onOpenChange}` を返して `<Dialog {...modal}>` に渡せば、思想はラッパー無しでそのまま成立する。**

## 根拠（実測）

- `src/components/ui/*.tsx` 18 件を grep（`onOpenChange` / `useState` / `createContext` / `Provider`）した結果、**state の徴候があったのは `sidebar.tsx` と `tooltip.tsx` のみ**。
- `dialog.tsx` の実装（先頭 38 行）を確認: `import { Dialog as DialogPrimitive } from "radix-ui"` して `<DialogPrimitive.Root data-slot="dialog" {...props} />` を返すだけ。
- `sidebar.tsx` は 32 export・`useState` + Context + `document.cookie` 書き込み + `window.addEventListener('keydown')` を持つ。

## 影響

- **手3 の作業は Sidebar 1 つに集中する。**lint の赤も 33 件中 17 件が `sidebar.tsx`（+ 依存する `use-mobile.ts` 3 件）＝**全体の 6 割**。
- 思想の「Layout / Overlay を同格で自作テンプレとして持つ」は、**Overlay については過剰**だった（→ DR-0012）。
- Tooltip の Provider は思想に想定が無い形の差分（→ DR-0015 の指摘 1・3）。

## 関連

- [部品カタログ.md](../部品カタログ.md) 表4
