---
id: DR-0061
type: decision
title: 'フィールド幅を semantic 語彙として足す（`--container-field-*` / `w-field-*`）— 手7 D10'
status: decided
date: 2026-08-02
step: 手7
related: [DR-0060, DR-0019, DR-0005, DR-0062]
poc_feedback: '🟥 ui.md の材料。「ページ幅」と「コントロール幅」は別の語彙。前者だけ定義すると後者が任意値で書かれる'
---

# DR-0061: フィールド幅を semantic 語彙として足す

## 背景

[DR-0060](DR-0060-vocabulary-leaks-from-four-surfaces.md) で、**DS に「コントロール 1 個分の横幅」を表す語が無い**ことが分かった。
Claude Design の design agent は幅を決める合法な手段を持たず、`w-48` を書いた。

選択肢は 4 つあった（実行記録 §H7-06b）——
**A** 語彙を足す ／ **B** 素材層 16 件を製品層ラッパーで包む ／ **C** `DataGrid.columns` の cell を props 化 ／ **D** 潰さず手8 へ。

## 決定

**A のみを採る**（ユーザー判断 2026-08-02）。

```css
/* src/app/tokens.css */
--container-field-sm: calc(var(--spacing) * 32); /* 128px 短い選択肢・数値 */
--container-field-md: calc(var(--spacing) * 48); /* 192px 既定 */
--container-field-lg: calc(var(--spacing) * 80); /* 320px 検索ボックス */
```

- 🟦 **`md` は agent が `w-48` で求めた幅そのもの。**観測した実需をそのまま語彙にした
- 🟦 **値は書かず `--spacing` への参照**（[DR-0005](DR-0005-token-ownership-and-two-stage.md) 決定3・既存の semantic 語彙と同じ書き方）
- 🟨 **`--container-*` 名前空間に置いたのは Tailwind v4 の都合。**
  この名前空間だけが `w-*` と `max-w-*` の両方を生む（`--container-content` と同じ理由）
- conventions header の語彙表に **control width** の族として追記し、`SelectTrigger` の実例を 1 つ載せた
  （`className="w-field-md"` ／ `not className="w-48"`）

**B・C は採らない（今は）。**

| 案 | 採らない理由 |
| --- | --- |
| **B**（素材層 16 件をラッパーで包む） | 🟥 **A が無いとラッパーに渡す値の語彙が決まらない**（順序の事実）。🟥 **2 回ルールの証明が 1 回しかない**（`w-48` は 1 原因 2 箇所）。**手8 で「素材層由来の赤が何件か」が出てから対象を絞る** |
| **C**（`DataGrid.columns` の cell を props 化） | 手4 の成果物の設計変更。同じく証明 1 回 |
| **D**（潰さず手8 へ） | 🟦 **併用する。**A で塞いだ後に残る赤が、そのまま手8 の観測対象になる |

## 根拠（実測）

- `w-48` の実体は `.w-48{width:calc(var(--spacing) * 48)}`＝**トークン由来**。
  **agent は任意値を発明したのではなく、語彙が無い用途に既存の段を当てた**（DR-0060）
- 語彙表の幅の族は `max-w-content` / `max-w-wide` の 2 つだけで、**どちらもページ幅**だった
- 素材層の `.d.ts` に寸法系 props は 1 つも無い（`Select` は寸法系ゼロ、`Input` / `Table` は `className?` のみ）

## 結果

**この決定が変えること**

1. 🟦 **agent が幅を指定する合法な手段ができた。**`w-field-sm|md|lg` と `max-w-field-*`
2. 🟦 **トークン差し替えに追従する。**`.w-field-md{width:var(--container-field-md)}` で、
   `--container-field-md` は `--spacing` 参照。**手5 の 3 層構造の中に載っている**
3. 🟥 **出荷には safelist が必要だった** → [DR-0062](DR-0062-shipped-vocabulary-needs-safelist.md)

**🟥 まだ言えないこと**

- **agent が実際に `w-field-md` を選ぶか**は未検証。**3 周目で測る**——
  依頼文も部品構成も変えず、**語彙だけを変えた 1 変数の実験**になる
- ③（`cell` レンダラ）と ④（生 CSS）はこの決定では塞がらない。**手8 の数字を待つ**

## 関連

- 手順書: [手7](../手順/手7_ClaudeDesignに一覧を組ませる.md) §2 D10
- 実測の記録: [実行記録.md](../実行記録.md) §H7-08
- 発見: [DR-0060](DR-0060-vocabulary-leaks-from-four-surfaces.md)
