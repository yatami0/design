---
id: DR-0033
type: decision
title: '手5 の判定基準を層ごとに変える —「触ったか」ではなく「何を書いたか」で判定する'
status: decided
date: 2026-07-26
step: 手3
related: [DR-0028, DR-0032, DR-0027, DR-0010]
poc_feedback: '🟥 OBS 候補。PoC の no-arbitrary-value も同じ穴を持つので、セレクタ 2 本の追加が要る'
---

# DR-0033: 手5 の判定基準は層ごとに変える（手3 D4）

## 背景

手5 の問いは「**部品を 1 行も触らずに見た目が変わるか**」。
[DR-0001 以来](DR-0001-repo-role-and-deliverable.md)この「触ったか」が判定基準だったが、
手3 D1=(c)（欠落品 + 既定値ラッパー）が確定して**製品層が値を持つ層になった**ため、
「素材層のみを見る」も「素材層＋製品層の両方を見る」も、**どちらも合否を定義できなくなった**。

## 決定

**判定基準を層ごとに変える。**

| 層 | 判定基準 | 判定方法 |
|---|---|---|
| **素材層** `src/components/ui/**` | **1 行も触っていない** | `git diff --stat main -- src/components/ui/` が空 |
| **製品層** `src/components/<役割>/**` | 🆕 **生値も数値ユーティリティも書かれていない** | lint（下記 2 セレクタ）が 0 件 |
| **アプリ層** `src/app/**` | 同上 ＋ 素材層を直 import していない | 同上 ＋ `no-restricted-imports`（D3=B） |

**つまり「触ったか」ではなく「何を書いたか」で判定する。**

### 強制の仕組み

```js
// eslint.config.mjs — files で製品層・アプリ層だけに効かせる
'no-restricted-syntax': ['error',
  { selector: "JSXAttribute[name.name='className'] Literal[value=/(^|\\s)(p|px|py|gap|w|h|m|size|space-[xy])-[0-9]/]",
    message: '数値の段は使えない。semantic な用途名を使うこと' },
  { selector: "JSXAttribute[name.name='className'] TemplateElement[value.raw=/(^|\\s)(p|px|py|gap|w|h|m|size|space-[xy])-[0-9]/]",
    message: '同上（テンプレートリテラル）' },
]
```

## 根拠（実測）

2026-07-26。

### 1. `@theme` では層別に閉じられない

`--spacing: initial` を入れると **`p-4` / `gap-2` / `px-3` / `h-8` がすべて 0 件**になり、
素材 18 部品の余白 **128 箇所**が同時に死ぬ（[DR-0028](DR-0028-token-frame-is-not-closed.md) §2）。
`@theme` はプロジェクト全体に効くので、**「素材層は開いたまま製品層だけ閉じる」を表現できない。**

### 2. セレクタは動く（プローブで確認）

| 書き方 | 止まるか |
|---|---|
| `className="p-13 gap-7"` | 🟦 止まる |
| `className="p-4"` | 🟦 止まる（primitive なので意図どおり） |
| `className={cn('p-13', x)}` | 🟦 止まる |
| `` className={`p-13 ${x}`} `` | 🟦 止まる（2 本目のセレクタ） |
| `className="p-inset-md gap-stack-md"` | 🟦 通る（狙いどおり） |
| 🟥 `className={variants.size.lg}`（cva / 定数経由） | 🟥 **抜ける** |

### 3. 既存ルールでは代替できない

`eslint-plugin-tailwindcss` 4.2.0 が持つ 8 ルールを実際に列挙した。
`no-custom-classname`（`whitelist` オプション付き）は **「Tailwind に存在しないクラス」を検出するルール**であり、
**`p-13` は正当な Tailwind クラスなので素通りする。**「許可した段だけ通す」機能は無い。

## 影響

- 🟥 **lint だけでは閉じない。**`cva` や定数経由の文字列は `className` の外で定義されるので捕まらない。
  → **[DR-0032](DR-0032-layout-primitives-take-props-not-classname.md)（props で受ける）が主、lint は補助**という順序になる。
- 🟨 **素材層は開いたまま。**`p-4` 等 128 箇所は残る。**手5 では「素材層の直書きは追従しない」を前提として明記する**
  （[DR-0010](DR-0010-shadcn-invents-values.md) の延長）。
- 🟥 **手5 の手順書に、この 3 段の判定基準をそのまま書く。**[DR-0027](DR-0027-token-swap-not-detectable-by-css-diff.md) の
  3 段判定（静的分類 → 実効値計算 → 目視）は「変わったか」を見る手続きで、本 DR は「合格とは何か」の定義。**両方要る。**

## 関連

- [デザイントークン設計.md](../デザイントークン設計.md) §6
- 手順書: [手3](../手順/手3_Components層と製品層の分離.md) §2 D4・§2.6-D4
