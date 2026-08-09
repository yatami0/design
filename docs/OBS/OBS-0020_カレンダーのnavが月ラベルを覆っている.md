---
id: OBS-0020
type: question
title: カレンダーの nav が月ラベルを覆っている — 直すか、測るだけにするか
status: open
date: 2026-08-09
updated: 2026-08-09
step: '-'
tags: [datepicker, calendar, a11y, overlay, 完成バー]
related: [DR-0100, DR-0089, DR-0049, OBS-0017]
promoted_to: null
---

# OBS-0020: カレンダーの nav が月ラベルを覆っている

> 凡例：🟦 確定／根拠あり ・ 🟨 暫定／裁量 ・ 🟥 未確認・要本人確認

## 0. 一行サマリ【起票時必須】

**`DatePicker` の月ラベル「August 2026」は、前月／次月ボタンを載せた `nav` の下に敷かれている。**
🟦 **操作は壊れていない**（日付セル 42 件は 1 件も覆われていない）が、
🟥 **axe はここで背景色を決められず、判定を保留する**（[DR-0100](../DR/DR-0100-pending-judgements-split-into-three-kinds.md) の (b)・**保留 23 件のうち 1 件**）。

## 1. きっかけ（何を見て・何に引っかかったか）【起票時必須】

[部品5](../手順/部品5_判定の保留と描かれていない状態.md) の着手前実測で、
**保留 12 件を割ったときに 1 件だけ「色の話ではないもの」が出た。**

axe の言い分: `Element's background color could not be determined because it is overlapped by another element`

**実測**（2026-08-09・`DatePicker/Open`・1200×900）:

| 要素 | 矩形 (x, y, w, h) | `pointer-events` |
| --- | --- | --- |
| `nav.absolute.inset-x-0.top-0` | **34, 70, 196×28** | `auto` |
| `.rdp-caption_label`（「August 2026」） | **88, 74, 87×20** | `auto` |
| 前月ボタン | 34, 70, 28×28 | — |
| 次月ボタン | **202**, 70, 28×28 | — |

- 🟥 **ラベルは nav の矩形に完全に含まれ、`elementsFromPoint` の先頭は `NAV`**（ラベルは 2 番目）
- 🟦 **日付セル 42 件のうち、覆われているものは 0 件**
- 🟦 **ラベル自体の対比は問題無い**（`rgb(0,0,0) on rgb(255,255,255)`・比 **21.00**）——**測ったのは我々で、axe ではない**

## 2. 経緯と今の理解【起票時必須・「わからない」でもよい】

- 🟨 **部品5 では「測るだけ」にした**（D5=A）。理由:
  - **月ラベルは非対話要素**なので、覆われても操作は壊れない。**日付セルは 1 件も覆われていない**（実測）
  - 🟥 **ただし [DR-0089](../DR/DR-0089-overlays-do-not-cover-their-anchor.md) と同じ形が潜在している**——
    あれは `Select` の overlay がトリガ 32px のうち 30px を隠していた件で、**最初は「幅の問題」に見えていた**
  - ★★ **潜在するのは `captionLayout="dropdown"`**（react-day-picker の標準機能で、
    **月・年を選ぶセレクトをこの位置に置く**）。**そこに置いた瞬間、nav がクリックを奪う**
- 🟦 **`nav` は素材層 `src/components/ui/calendar.tsx` の実装**（`absolute inset-x-0 top-0 … justify-between`）。
  **上流 shadcn のまま**で、**この repo は素材層を 8 手＋工程0〜4＋部品2〜5 で 2 箇所しか触っていない**
- 🟥 **「覆っているが触れる」なのか「触れない」なのかは、ラベル位置に対話要素を置いて初めて分かる**——**まだ置いていない**

## 3. 知識の結びつき（本人の頭の中で何と繋がったか）

🟥 **要確認。**

## 4. 判断が変わる条件

- 🟥 **月・年の選択（`captionLayout`）を出す日**——**そのとき nav の当たり判定が正面から効く**
- 🟨 **`bgOverlap` の保留が 2 件目を出したとき**——**1 件なら個別の話だが、2 件目が出れば「重ね方」の話になる**
- 🟨 **面⑥（当たり判定 44px・[DR-0049](../DR/DR-0049-hit-area-reaches-44px-only-at-default-size.md)）を返す回**——
  **日付セル 28px の話と同じ場所を測ることになる**

## 5. 塞ぐときの選択肢（測ってから決める）

| 案 | 中身 | 代償 |
| --- | --- | --- |
| A | **製品層で `nav` に `pointer-events-none` を当て、ボタンだけ `auto` に戻す** | 🟨 **製品層で素材の内部要素にクラスを当てる形**（`Calendar` は製品層の窓口を持たない＝ 部品3 の実測） |
| B | **素材層 `calendar.tsx` を直す** | 🟥 **素材層 diff 0 行の連続記録を切る**（[DR-0035](../DR/DR-0035-sidebar-stays-as-vendor.md) 系の判断） |
| C | **何もしない**（保留として数え続ける） | 🟥 **`captionLayout` を出す日に踏む** |
