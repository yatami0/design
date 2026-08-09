---
id: OBS-0019
type: question
title: story が一度も描いていない状態を、どこまで機械で要求するか
status: open
date: 2026-08-09
updated: 2026-08-09
step: '-'
tags: [storybook, a11y, 完成バー, sidebar, overlay]
related: [DR-0096, DR-0098, DR-0099, DR-0035, OBS-0008]
promoted_to: null
---

# OBS-0019: story が一度も描いていない状態を、どこまで機械で要求するか

> 凡例：🟦 確定／根拠あり ・ 🟨 暫定／裁量 ・ 🟥 未確認・要本人確認

## 0. 一行サマリ【起票時必須】

**overlay の「開いた状態」は機械で要求できるようになった**（[DR-0099](../DR/DR-0099-the-blind-spot-list-must-be-machine-derived.md)）が、
🟥 **同じ形の「story が一度も描いていない状態」は他にも在り、そちらは `Primitive.Portal` では引けない。**
**どこまでを機械の要求にするかが決まっていない。**

## 1. きっかけ（何を見て・何に引っかかったか）【起票時必須】

[部品4](../手順/部品4_開かれないoverlayを開く.md) の着手前実測（Q4）で、`Sidebar` に同じ形を見つけた。

| 状態 | 実装 | story |
| --- | --- | --- |
| `expanded`（デスクトップ） | `data-state="expanded"` | 🟦 `Sidebar/Default` |
| `collapsed` | `data-state="collapsed"` | 🟥 **無** |
| mobile | 🟥 **中身が `Sheet`（portal）に出る**（`openMobile`） | 🟥 **無**（viewport を変える story が 1 本も無い） |

🟥 **`Sidebar` は portal を「持っている」が、mobile のときだけ**——
`tools/opened-overlay-check.mjs` は素材層の `Primitive.Portal` で引くので、
**`sidebar.tsx` は `Sheet` を経由しており自身では Portal を書いていない＝ 一覧に出てこない。**

## 2. 経緯と今の理解【起票時必須・「わからない」でもよい】

- 🟦 **部品4 では範囲外にした**（D1=B）。理由は 2 つ:
  - `Sidebar` は [DR-0035](../DR/DR-0035-sidebar-stays-as-vendor.md) で「**素材のまま使う**」と決めた部品で、
    **状態面の借金 33 件（部品1 D6=B）と同じ扱い＝ 触るときに返す**のが筋
  - **mobile は viewport を変える道具の新設**になり、部品4 の問いと無関係な変数が 1 つ増える
- 🟨 **「開閉」と「レイアウトの状態」を同じ検査で扱うべきかが分からない。**
  前者は**閉じている間 DOM を持たない**（＝ 検査の対象が 0 件）が、
  後者は**DOM は在るが別の姿**（＝ 検査は走るが、片方の姿しか見ていない）。
  🟥 **「対象 0 件で緑」なのは前者だけ**で、後者は別の型かもしれない。
- 🟥 **[完成バー](../部品の完成バー.md) の面③（状態面）が既に「共通の面」を定義している**
  （`default` / `hover` / `focus-visible` / `disabled` / `empty` / `invalid` / `loading` / `overflow`）が、
  **`collapsed` も `mobile` もその一覧に無い。**面③ を広げる話なのか、別の面なのかが決まっていない。

## 3. 知識の結びつき（本人の頭の中で何と繋がったか）

🟥 **要確認。**

## 4. 判断が変わる条件

- 🟨 **`Sidebar` を触る回が来たとき**（DR-0035 の「素材のまま」を見直すとき）
- 🟨 **viewport を変える story が別の理由で必要になったとき**（例: レスポンシブの検証）
- 🟥 **面③ の借金 33 件を返す回**（部品1 D6=B）——**そのとき「状態」の定義を 1 度決め直すことになる**

## 5. 積み残しの実測（部品4 で数えたが扱っていないもの）

🆕 [DR-0098](../DR/DR-0098-incomplete-was-counted-as-green.md) で**判定の保留（axe の incomplete）を初めて数えた**。
**出荷物の棚に 23 件**あり、うち**harness 由来でないものが 12 件**:

| rule | 件数 | 対象 |
| --- | --- | --- |
| `color-contrast` | 10 | `Avatar`（fallback）／ `DatePicker` の日付セル・月ラベル |
| 🟥 **`aria-valid-attr-value`** | 2 | `DropdownMenu` の `#radix-_r_4_` ／ `DatePicker` の `.border-border` |

🟥 **どれも「測れば違反なのか、本当に測れないのか」を見ていない。**
★ **`aria-valid-attr-value` は参照先が実在しないときに出る形**なので、**本物の欠陥の可能性がある。**
