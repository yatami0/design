---
id: DR-0022
type: finding
title: '思想の 3 層は shadcn 側に 3 層とも実在する — 欠けているのは semantic 層のうち spacing / typography だけ'
status: observed
date: 2026-07-26
step: 手2
related: [DR-0012, DR-0019]
poc_feedback: 'OBS-0003 の材料。「shadcn は semantic 1 層」という前提が誤りだった'
---

# DR-0022: 思想の 3 層は shadcn 側に 3 層とも実在する

## 背景

[段取り](../UI検証の位置づけと段取り.md) §3.5 の摩擦表 #4 は、手1 より前の調査に基づき次のように書いていた。

> トークンの層数が違う … 思想＝3 層（primitive/semantic/component）、**shadcn＝実質 semantic 1 層**（primitive は Tailwind パレット、**component token 無し**）

手2 H2-02 で、4 者の語彙を全件仕分けしてこの前提を検証した。

## 発見

**「shadcn は semantic 1 層で component token を持たない」は誤りだった。3 層とも実在する。**

| 層            | 実体                                                                                                | 件数 |
| ------------- | ----------------------------------------------------------------------------------------------------- | ---- |
| **primitive** | Tailwind v4 の `theme.css`（色 288 ／ 非色 131）                                                        | 419  |
| **semantic**  | shadcn `:root` の意味色（`--background` `--foreground` `--primary` `--destructive` `--border` `--ring` …） | 18   |
| **component** | 🆕 `--sidebar-*`（8・`globals.css`）／ `--card-spacing`（`card.tsx` の任意プロパティ）／ `--sidebar-width` `--sidebar-width-icon` | 11   |

**欠けているのは「層」ではなく、semantic 層のうち spacing と typography だけ。**

```
primitive   : ✅ 419 件（Tailwind）— むしろ過剰
semantic 色 : ✅ 18 件（shadcn）
semantic 余白: ❌ 0 件  ← ここだけが穴
semantic 字 : ❌ 0 件  ← ここだけが穴
component   : ✅ 11 件（shadcn）
```

## 根拠（実測）

2026-07-26。全件の仕分けは [トークンマッピング.md](../トークンマッピング.md) 表2。

- `src/components/ui/card.tsx:15` — `[--card-spacing:--spacing(4)]` を定義し、`gap-(--card-spacing)` / `py-(--card-spacing)` で参照。
  `data-[size=sm]` では `--spacing(3)` に切り替える。**部品固有の値をテーマ用に外へ出す**という、思想の component token の定義そのもの。
- `src/components/ui/sidebar.tsx:29-31,134-135` — `SIDEBAR_WIDTH = "16rem"` 等を **TS 定数**で持ち、`style` 経由で `--sidebar-width` を注入。
- `src/app/globals.css:83-90` — `--sidebar` 〜 `--sidebar-ring` の 8 変数。**名前に部品名が入っている**。
- `@import` 先（`shadcn/tailwind.css` 629 行）も確認したが、持ち込む 51 変数は**すべて `--scroll-fade-*` / `--shimmer-*`**＝
  `@utility` の実装変数で、設計語彙ではない。**[DR-0012](DR-0012-shadcn-supplies-no-layout-no-spacing.md) の「spacing / typography は無い」は射程を広げても成立する。**

## 影響

- 🟦 **思想の 3 層モデルは、この構成でそのまま宣言できる。**「shadcn は層が足りない」ではなく「**特定の 2 群だけが空**」という問題に縮んだ。
- 🟥 ただし **component token の値の置き場が 2 系統に割れている**のが本当の問題。
  `--sidebar-*` の色は CSS にあるが、**`--sidebar-width` の値は `sidebar.tsx` の TS 定数**（`"16rem"`）。
  → tmp-admin の `--sidebar-width: 264px` を流し込むには**部品を触るしかない**＝手5 の「変わらない箇所」の 1 つ。
- 🟨 `--card-spacing` は**自前の semantic spacing（[DR-0019](DR-0019-semantic-spacing-typography-vocabulary.md)）が接続できる唯一の shadcn 部品**。
  `--card-spacing` を `--spacing-inset-md` に向け替えれば、Card だけは部品を触らずに semantic 層へ載る可能性がある。→ **手3 で試す価値がある**。
- 🟨 [段取り](../UI検証の位置づけと段取り.md) §3.5 摩擦表 #4 の記述を訂正した（本 DR へのリンクを追加）。

> **一次情報を実測で置き換える規律が効いた 2 例目。**1 例目は [DR-0006](DR-0006-shadcn-base-radix-preset-nova.md)（CLI の設定モデルが公式 docs と違った）。

## 関連

- [トークンマッピング.md](../トークンマッピング.md) 表2 「Q1 の答え」
- 手順書: [docs/手順/手2_トークン層マッピング.md](../手順/手2_トークン層マッピング.md) §5 H2-02（「判断」欄がこの分岐を予告していた）
