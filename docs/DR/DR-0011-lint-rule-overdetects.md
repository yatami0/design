---
id: DR-0011
type: finding
title: 'no-arbitrary-value は「値の発明」と「構文上の指定」を区別しない'
status: observed
date: 2026-07-26
step: 手1
related: [DR-0010]
poc_feedback: 'PoC の off リスト議論（ADR-0019）の材料'
---

# DR-0011: no-arbitrary-value は「値の発明」と「構文上の指定」を区別しない

## 背景

DR-0010 で任意値 24 件を分類したところ、**そもそもデザイン値ではないもの**が 6 件混ざっていた。

## 発見

`tailwindcss/no-arbitrary-value` は、角括弧記法を**一律に**弾く。しかし角括弧の中身には性質の違うものが入る。

| 検出された記法 | 中身の正体 | 思想①の目的に照らして |
|---|---|---|
| `transition-[width]`<br>`transition-[left,right,width]`<br>`transition-[margin,opacity]`<br>`transition-[width,height,padding]` | **CSS プロパティ名の列挙** | ❌ 値の発明ではない。トークン化する対象がそもそも無い |
| `grid-cols-[1fr_auto]`<br>`grid-rows-[auto_auto]` | **グリッドの構造定義**（`fr` / `auto`） | ❌ デザイン値ではなくレイアウトの構造記述 |
| `text-[0.8rem]` `rounded-[4px]` `min-w-[96px]` | **生の寸法値** | ✅ これが本来の検出対象 |

**思想①の目的は「AI が margin/padding を発明するのを止める」ことなので、上 2 群に対しては過剰検知**。

## 根拠（実測）

手1 の lint 出力 24 件のうち 6 件が上 2 群（`card.tsx` 2 件・`sidebar.tsx` 4 件）。全件は [部品カタログ 表5](../部品カタログ.md#表5-任意値の分類q2-の答え--手5-の判定に直結)。

## 影響

- 本 repo では**赤のまま残す**（DR-0007）。ただし赤の件数を比較するとき、この 6 件は**恒常的なノイズ**として差し引いて読む。
- 🟦 **PoC 側の off リスト議論（ADR-0019・「ESLint off/override の全件列挙」）に効く材料。**
  ルールを丸ごと off にすると (C) の生値検出まで消えるので、**「ルールごと off」ではなく「セレクタを絞って再宣言」という PoC 既存の作法**（`next.js` の fetch 例外がその形）が適用できる可能性がある。
- 実装レベルの対処は未調査（`eslint-plugin-tailwindcss` に許可リスト系のオプションがあるかは確認していない）。

## 関連

- [部品カタログ.md](../部品カタログ.md) 表5
