---
id: DR-0015
type: finding
title: '共通コンポーネント思想への指摘 3 点（分類の穴・Overlay の定義・フラグの不足）'
status: observed
date: 2026-07-26
step: 手1
related: [DR-0012, DR-0013]
poc_feedback: null
---

# DR-0015: 共通コンポーネント思想への指摘 3 点

## 背景

shadcn の 63 部品を [共通コンポーネント思想](../共通コンポーネント思想.md) の役割 9 カテゴリへ割り当てたところ、**2 件が分類不能・8 件が迷い**として残った。分類できないものは「分類の欠陥」か「shadcn 固有の事情」のどちらかなので、前者を切り出した。

> ⚠ **思想の正本はユーザーが持つ。本 DR は指摘であって書き換えではない。**

## 発見

### 1. 「部品でないもの」の置き場が無い

`Direction`（RTL/LTR をツリーに配るコンテキスト提供者）は 9 カテゴリのどれにも属さないが、**実在し、アプリに配線が要る**。`Tooltip` も `TooltipProvider` を要求する（DR-0013）。

→ 役割分類とは別の軸（**配線が要るか**）が必要かもしれない。

### 2. Overlay の定義が 2 条件の AND になっている

思想は Overlay を「**重なり・開閉**」と定義している。このため **開閉するが重ならない**部品（`Accordion` / `Collapsible`）が Layout にも Overlay にも綺麗に入らず宙に浮く。

→ 思想が「状態を分類軸から追い出し、フラグで表す」と決めた趣旨に照らすと、**Overlay は「重なり」だけで定義し、開閉は `stateful` フラグで表す**ほうが一貫する。

### 3. フラグに Provider を表す軸が無い

`behaviorHook` は「振る舞いを担う hook」だが、`TooltipProvider` のように **hook ではなく Provider で配線するもの**が表せない。

→ `provider` フラグを足す余地がある。

### 参考: 分類が揺れた 8 件

| 部品 | 揺れの理由 |
|---|---|
| Accordion / Collapsible | 上記 2 |
| Field | フォーム専用の配置構造。思想の Layout は汎用の配置 |
| Command / Combobox | 複数カテゴリの合成（Overlay + Selection + Navigation） |
| Carousel / Item / Toggle | 2 カテゴリのどちらとも読める |
| Attachment / Bubble / Message / Message Scroller | **AI チャット UI 向けの新カテゴリ。**思想が作られた時点に存在しなかった部品群（今回の題材では使わない） |

## 根拠（実測）

[部品カタログ 表1・表2](../部品カタログ.md#表2-分類できなかった迷ったものq4-の答え)（全 63 部品の割り当てと迷いの記録）。

## 影響

- 指摘 2 を採るなら、表1 の `Accordion` / `Collapsible` の行が Layout → Overlay(stateful) に移る。手3 の作業対象は変わらない。
- 指摘 1・3 を採るなら、Provider の配線を束ねる場所を手4（Patterns/Templates）で扱うことになる。
- **どれも採否はユーザー判断。**採らない場合、表2 の迷いは「そういうもの」として残る。

## 関連

- [部品カタログ.md](../部品カタログ.md) 表2
