---
id: DR-0062
type: finding
title: '出荷する語彙は safelist しないと CSS に載らない — 「書けたのに届かない」新しい形'
status: observed
date: 2026-08-02
step: 手7
related: [DR-0061, DR-0021, DR-0048, DR-0057]
poc_feedback: '🟥 architecture.md の材料。**消費者が書く語彙**を持つ設計システムは、Tailwind の使用検出だけでは出荷できない'
---

# DR-0062: 出荷する語彙は safelist しないと CSS に載らない

## 背景

[DR-0061](DR-0061-field-width-vocabulary.md) で `--container-field-*` を定義した直後、
「宣言しただけで `_ds_bundle.css` に載るのか」を確かめた。

## 発見

🟥 **載らない。**Tailwind は「**この repo が使ったクラス**」しか生成しない。
`w-field-*` は **移送先の design agent が書く語彙**であって、**本 repo の部品は 1 つも使わない。**

→ トークンを定義し、conventions header に書き、agent がそのとおり `w-field-md` と書いても、
**CSS に規則が無いので何も効かない。**しかも:

- ビルドは緑
- validate も緑（トークンは定義済みなので `[TOKENS_MISSING]` にもならない）
- 生成物の見た目は「幅が効いていないだけ」で、**エラーにならない**

**[OBS-0003](../OBS/OBS-0003_対象0件で緑が5回出た.md)（対象 0 件で緑）と同型だが、方向が逆。**
これまでは「**検査の射程が 0 件**」だった。今回は「**出荷物の射程が 0 件**」——
**書けたのに届かない**という新しい形。

## 対処

`src/app/globals.css` に safelist を 1 行。

```css
@source inline('{w,max-w}-field-{sm,md,lg}');
```

## 根拠（実測）

2026-08-02。Tailwind **4.3.3**。

```
① safelist を書く前のビルド成果物: grep -c '\.w-field-md' ds-bundle/_ds_bundle.css → 0
② @source inline() を足して参照 Storybook を再ビルド（exit 0）
③ .design-sync/sb-reference/assets/iframe-DPijgIoc.css:
     .w-field-sm{width:var(--container-field-sm)}
     .w-field-md{width:var(--container-field-md)}
     .w-field-lg{width:var(--container-field-lg)}
     .max-w-field-md{max-width:var(--container-field-md)}
     --container-field-md:calc(var(--spacing) * 48)
④ 赤テスト: 宣言していない .w-field-xl は 0 件（safelist の範囲だけが出ている）
```

🟦 **生成された規則は `var(--container-field-*)` を参照している**ので、トークン差し替えに追従する。

## 影響

**観測から直接言えること**

1. ★ **「トークンを足す」と「語彙を出荷する」は別の作業。**
   本 repo の既存語彙（`p-inset-*` 等）が届いていたのは、**たまたま自分の部品が使っていたから**にすぎない。
2. 🟥 **conventions header に書いた語彙は、書いた時点では検証されない。**
   [DR-0057](DR-0057-design-sync-uploads-compiled-code-not-just-html.md) の skill が要求する
   「header の名前が成果物に実在するか grep せよ」は**この穴を塞ぐための工程**だった——
   実際、今回もその grep（実行記録 §H7-08）で確認している。
3. 🟨 **`@source inline()` は Tailwind 4.1+ の機能。**本 repo は 4.3.3 で使える。
   PoC が古い版なら**代わりに「語彙を使う story を 1 本置く」**必要がある。

**🟥 推論（未検証）**

- 既存語彙のうち「**部品が使っていないもの**」が他にもあるかは**全件検査していない**。
  header の grep 検証は 20 クラス全部が実在することを確かめたが、
  **それは今の部品構成でたまたま全部使われている**という意味でしかない。
  → **部品を減らすと語彙が静かに消える。**再同期のたびに header の grep 検証を回す理由がここにある。

## 関連

- 手順書: [手7](../手順/手7_ClaudeDesignに一覧を組ませる.md) §2 D10
- 実測の記録: [実行記録.md](../実行記録.md) §H7-08
- 決定: [DR-0061](DR-0061-field-width-vocabulary.md)
- 同型: [OBS-0003](../OBS/OBS-0003_対象0件で緑が5回出た.md)（射程が 0 件でも緑になる）
