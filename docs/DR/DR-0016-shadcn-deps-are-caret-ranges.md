---
id: DR-0016
type: finding
title: 'shadcn が追加する依存は ^ レンジ（PoC の厳密ピン方針と衝突）'
status: observed
date: 2026-07-26
step: 手1
related: [DR-0003, DR-0006]
poc_feedback: '🟥 移送時にピンし直しが要る'
---

# DR-0016: shadcn が追加する依存は ^ レンジ

## 背景

本 repo は依存をすべて PoC の catalog と同一値で厳密ピンしている（DR-0003・PoC の ADR-0012 に倣う）。`shadcn init` / `add` が依存を追加するとき、この方針が保たれるかを確認した。

## 発見

**保たれない。shadcn は `^` レンジで追加する。**

```diff
   "dependencies": {
+    "class-variance-authority": "^0.7.1",
+    "clsx": "^2.1.1",
+    "lucide-react": "^1.27.0",
     "next": "16.2.10",
+    "radix-ui": "^1.6.7",
     "react": "19.2.7",
     "react-dom": "19.2.7",
+    "shadcn": "^4.15.0",
+    "tailwind-merge": "^3.6.0",
+    "tw-animate-css": "^1.4.0"
   },
```

**`shadcn`（CLI）が `dependencies` に入るのは一見おかしいが、正しい。**preset の実体は `src/app/globals.css` の `@import "shadcn/tailwind.css"` という **CSS の import 1 行**なので、ランタイム依存として必要になる。

## 根拠（実測）

- `git diff package.json`（`shadcn init` + `add` 18 件の後）。
- `src/app/globals.css` の先頭に `@import "tw-animate-css";` と `@import "shadcn/tailwind.css";` が追記されている。

## 影響

- 🟥 **移送時にピンし直しが要る**（手9）。PoC の catalog に 7 パッケージを厳密ピンで追加することになる。
- 🟦 **preset の差し替えが軽い理由が説明できる。**設計システムはコード生成ではなく CSS の import で入るので、`init` を別の preset code で回せば CSS の参照先が変わるだけ。公式が「別の code で init し直せば全部再構成される」と言うのはこれ。
  → **手5 の「トークン差し替え」とは別に、「preset ごと差し替える」という 2 つ目の軸がある**ことを意味する。手5 の設計時に区別すること。

## 関連

- [実行記録.md](../実行記録.md) §手1
