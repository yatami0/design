---
id: DR-0038
type: finding
title: '`no-arbitrary-value` が見る文脈は className / cva / cn の 3 つだけ — 素の const と object literal は見ない'
status: observed
date: 2026-07-26
step: 手3
related: [DR-0028, DR-0033, DR-0011]
poc_feedback: '🟥 OBS 候補。PoC の任意値禁止も同じ穴を持つ。cva / cn を経由しない文字列は検査されない'
---

# DR-0038: 任意値禁止ルールが見る文脈は 3 つだけ

## 背景

[DR-0033](DR-0033-step5-criteria-differ-per-layer.md) で、製品層とアプリ層に
「数値の段」「パレット色」を禁じる `no-restricted-syntax` を張ると決めた。
**どの文脈を張れば既存ルールと穴の位置が揃うか**を確かめる必要があった。

## 発見

`tailwindcss/no-arbitrary-value`（`eslint-plugin-tailwindcss` 4.2.0）が検査するのは **3 文脈だけ**。

| 書き方 | 検出されるか |
|---|---|
| `<div className="p-[13px]" />` | 🟦 **される** |
| `cva('base', { variants: { s: { lg: 'p-[19px]' } } })` | 🟦 **される** |
| `cn('p-[21px]')` | 🟦 **される** |
| `export const plain = { size: { lg: 'p-[23px]' } }` | 🟥 **されない** |
| `export const bare = 'p-[25px]'` | 🟥 **されない** |

**shadcn の任意値 24 件がすべて検出されていたのは、それらが `cva()` と `className` の中にあったから。**
ルールが「任意値を全部見ている」わけではない。

## 根拠（実測）

2026-07-26。`src/components/Layout/_probe.tsx` に 5 パターンを書いて `eslint` を実行。

```
4:57  error  Arbitrary value detected in 'p-[19px]'   ← cva
5:22  error  Arbitrary value detected in 'p-[21px]'   ← cn
（object literal と bare const は無検出）
```

さらに、最初のプローブを `export const cls = 'p-[13px] bg-[#ff0000]'` の形で書いたときは
**1 件も検出されなかった**——これが発見の入口になった。

## 影響

- 🟦 **自前の `no-restricted-syntax` を同じ 3 文脈に揃えた。**
  `JSXAttribute[name.name='className']` と `CallExpression[callee.name=/^(cn|cva|clsx|classnames|tv)$/]` の下で
  `Literal` と `TemplateElement` を見る（数値の段・パレット色 × 4 セレクタ = 8 本）。
  **穴の位置を既存ルールと一致させる**ことで、「片方は止まるが片方は通る」という食い違いを避けた。
- 🟥 **残る穴は 2 つ**（object literal / bare const）。**lint では閉じられない。**
  → [DR-0032](DR-0032-layout-primitives-take-props-not-classname.md)（props で受ける）が主で lint が補助、という順序の実測的な裏付けになる。
- 🟨 **[DR-0011](DR-0011-lint-rule-overdetects.md) と合わせて、このルールは両方向に外している。**
  DR-0011 は過剰検知（`transition-[width]` は値ではない）、[DR-0028](DR-0028-token-frame-is-not-closed.md) は過少検知（`p-13` は素通り）、
  本 DR は**検査範囲そのものの限定**。3 つは別々の問題。

## 関連

- [実行記録.md](../実行記録.md) §手3「実測で分かったこと」1
- 手順書: [手3](../手順/手3_Components層と製品層の分離.md) §5 H3-01 / H3-02
