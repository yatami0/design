---
id: DR-0028
type: finding
title: '「定義した値しか使わせない」枠は閉じていない — lint は角括弧しか見ず、閉じると素材層が死ぬ'
status: observed
date: 2026-07-26
step: 手3
related: [DR-0010, DR-0011, DR-0019, DR-0021]
poc_feedback: '🟥 OBS 候補。PoC の `no-arbitrary-value: error` も同じ穴を持つ（`p-13` は素通り）'
---

# DR-0028: トークンの枠は閉じていない

## 背景

ユーザーが手3 の D4 について「**色や余白は基本的に定義したモノしか使いたくない。共通コンポーネントもアプリ側も同じ**」と要求した。
本 repo は PoC から `tailwindcss/no-arbitrary-value: error` を引き継いでおり（段取り §2 #4）、
**これで枠が閉じているという前提**で手0〜手2b を進めてきた。前提を実測で確かめた。

## 発見

### 1. lint は「角括弧が書かれているか」しか見ていない

プローブを 6 つ書いたところ、**止まったのは 3 つだけ**だった。

| 書いたもの | 生成された CSS | 実効値 | `no-arbitrary-value` |
|---|---|---|---|
| `p-13` | `padding:calc(var(--spacing) * 13)` | 52px | 🟥 **通る** |
| `gap-7` | `gap:calc(var(--spacing) * 7)` | 28px | 🟥 **通る** |
| `w-99` | `width:calc(var(--spacing) * 99)` | 396px | 🟥 **通る** |
| `m-[13px]` | `margin:13px` | 13px | 🟦 止まる |
| `text-[13px]` | `font-size:13px` | 13px | 🟦 止まる |
| `rounded-[3px]` | `border-radius:3px` | 3px | 🟦 止まる |

**Tailwind v4 の spacing は動的生成**（`calc(var(--spacing) * n)`）で、`n` に上限が無い。
**`--spacing` を 1 個定義した時点で、無限個の段が「定義済み」になっている。**

### 2. 枠を閉じると素材層が死ぬ。しかもゲートは緑

`src/app/tokens.css` の `@theme` に `--spacing: initial;` を 1 行足して再ビルドした。

| クラス | 閉じる前 | 閉じた後 |
|---|---|---|
| `p-4` / `gap-2` / `px-3` / `h-8` | 生成される | 🟥 **0 件** |
| `p-inset-md`（自前の用途名） | 生成される | 🟦 1 件 |

shadcn の素材 18 部品は spacing を **128 箇所**直書きしており、使う段は **11 種**（`0 / 0.5 / 1 / 1.5 / 2 / 2.5 / 3 / 4 / 6 / 7 / 8`）。
枠を閉じるとその全部が無効になる。**そして `pnpm build-storybook` は緑のまま完走した。**

### 3. `@theme` はグローバルで、層別に閉じられない

Tailwind v4 の名前空間制御（`--namespace-*: initial` / `--*: initial`）は**プロジェクト全体に効く**。
「素材層は開いたまま、製品層だけ閉じる」を `@theme` で表現する手段は無い。

## 根拠（実測）

2026-07-26。`pnpm build-storybook` の出力 CSS を grep、および `./node_modules/.bin/eslint`。

- プローブ `src/stories/_probe.tsx` に 6 クラスを記述 → 生成 CSS に **6 件すべて出現**（`.p-13{padding:calc(var(--spacing) * 13)}` 等）
- 同ファイルへの eslint → `no-arbitrary-value` が **3 件のみ**発火（`m-[13px]` / `text-[13px]` / `rounded-[3px]`）
- `--spacing: initial` を入れて再ビルド → `.p-4{` `.gap-2{` `.px-3{` `.h-8{` が **各 0 件**、`.p-inset-md{` が 1 件、**exit=0**
- `grep -ohE '\b(p|px|py|…|gap)-[0-9.]+' src/components/ui/*.tsx | wc -l` → **128**
- 🟦 **プローブ・実験値はすべて撤去し `git status --short` が空であることを確認済み**

一次情報: [Tailwind CSS — Theme variables](https://tailwindcss.com/docs/theme)（名前空間の消し方）。
⚠ 公式 docs は「spacing が動的生成されるか」を明記していないため、**実測で確定させた**（一次情報を実測で置き換える規律の 4 例目）。

## 影響

- 🟥 **D11（Layout プリミティブの API 形）が実質決まる。**`className` パススルーでは枠が閉じないので、
  **props で semantic 名を受ける案だけが「定義した値しか使わせない」を満たす。**
- 🟥 **D4（手5 の観測対象）の形が変わる。**閉じ方が層ごとに非対称になるため、
  「素材層のみ」では要求を満たさず、**製品層・アプリ層は別手段（props の型 ＋ lint の allowlist）で閉じる**しかない。
- 🟥 **「対象 0 件で緑」の 4 例目。**（1 例目: 手0 の赤テスト／2 例目: [DR-0025](DR-0025-storybook-init-is-not-selectable.md) の `.storybook/**`／3 例目: [DR-0021](DR-0021-tailwind-scans-docs-markdown.md) の docs 走査）
  **CSS は存在しないクラスを黙って無視する**ので、トークン系の破壊はゲートに映らない。手5 の判定でも同じ罠がある。
- 🟨 [DR-0011](DR-0011-lint-rule-overdetects.md) は `no-arbitrary-value` の**過剰検知**（`transition-[width]` 等）を指摘したが、
  本 DR は**過少検知**を示す。**同じルールが両方向に外している。**

## 関連

- [デザイントークン設計.md](../デザイントークン設計.md) §1・§2・§6
- 手順書: [手3](../手順/手3_Components層と製品層の分離.md) §2.5 調査1・§2 D4 / D11
