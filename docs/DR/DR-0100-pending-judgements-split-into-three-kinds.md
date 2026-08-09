---
id: DR-0100
type: finding
title: '判定の保留は 3 種類に割れた — 多くは検査器の事情で、一部は既知の違反と同じものだった'
status: observed
date: 2026-08-09
step: '-'
related: [DR-0098, DR-0097, OBS-0017, OBS-0019]
poc_feedback: '工場の規約: 「保留」を数えるだけでは足りない。種類（誰の事情か）と理由（機械の messageKey）を一緒に保存し、分類できないものは落とす'
---

# DR-0100: 判定の保留は 3 種類に割れた

## 背景

[DR-0098](DR-0098-incomplete-was-counted-as-green.md)（部品4 D8=B）で **axe の `incomplete` を初めて数えた**。
**出荷物の棚に 23 件**あり、**うち 12 件が未調査**のまま [OBS-0019](../OBS/OBS-0019_storyが一度も描いていない状態をどこまで機械で要求するか.md) §5 に積まれていた。

🟥 **OBS-0019 は「`aria-valid-attr-value` は参照先が実在しないときに出る形なので、本物の欠陥の可能性がある」と書いた。**

## 発見

### 1. 🟥 見立ては外れた —— `aria-valid-attr-value` の参照先は 2 件とも実在した

**実測**（2026-08-09・部品5 §1.1）:

| story | 要素 | `aria-controls` | 参照先は実在するか |
| --- | --- | --- | --- |
| `DatePicker/Open` | `date-picker-trigger` | `radix-_r_0_` | 🟦 **実在する** |
| `DropdownMenu/SubMenuOpen` | `dropdown-menu-sub-trigger` | `radix-_r_3_` | 🟦 **実在する** |

**原因は axe の側にあった。**`axe-core@4.12.1` の `ariaValidAttrValueEvaluate` は、
`preChecks['aria-controls']` で **`aria-haspopup` が `false` / `null` 以外なら、参照先 ID の実在を 1 度も確かめずに
`needsReview` を立てる**（ソース実測）:

```js
'aria-controls': function ariaControls() {
  var hasPopup = ['false', null].includes(virtualNode.attr('aria-haspopup')) === false;
  if (hasPopup) {
    needsReview = 'aria-controls="'.concat(virtualNode.attr('aria-controls'), '"');
    messageKey = 'controlsWithinPopup';
  }
  return virtualNode.attr('aria-expanded') !== 'false' && … && hasPopup === false;
}
```

★★ **overlay のトリガは、参照先が在っても無くても同じ「保留」になる。**
＝ 🟥 **この保留を数えても、参照の健全性については何も分からない。**

★ **これは [部品4 D7=C](../手順/部品4_開かれないoverlayを開く.md) が `aria-hidden-focus` で見つけた形の 2 例目**
（`isModalOpen()` が `role="menu"` を見ない）。**「保留」の多くは、部品ではなく検査器の側の事情。**

### 2. 🟥 逆に、`color-contrast` の保留 9 件は「保留」だが中身は本物だった

axe は「**文字が短くて本文か判定できない**」（`shortTextContent`）として保留するが、
**色そのものは測れている**（`fgColor` / `bgColor` / `contrastRatio` を返している）。

| 対象 | 実効色 | 比 | AA（4.5） |
| --- | --- | --- | --- |
| `DatePicker` の日付セル（5 件） | `#8a8a8e on #ffffff` | **3.43** | 🟥 **未達** |
| `Avatar` の fallback「小」「中」「大」「空」（4 件） | `#85858b on #f2f2f7` | **3.28** | 🟥 **未達** |

🟥 **どちらも既に `violations` 側に出ている色の組**（86 件 / 6 件）**と同一。**
★★★ **同じ欠陥が、文字数だけで `violations` と `incomplete` に振り分けられている。**

### 3. 保留は 3 種類に割れる

| 種類 | 件数 | 誰の事情か | 判断を持つ場所 |
| --- | --- | --- | --- |
| **(a) 文字が短くて判定を保留**（`shortTextContent`） | **9** | **部品**（色は本当に AA 未達） | [OBS-0017](../OBS/OBS-0017_意味色とfillの対比が全滅している.md)（① 層の配色） |
| **(b) 重なっていて背景色を決められない**（`bgOverlap`） | **1** | **部品**（`nav` が月ラベルを覆っている） | 🆕 [OBS-0020](../OBS/OBS-0020_カレンダーのnavが月ラベルを覆っている.md) |
| **(c) 検査器が無条件に保留** | **13** | 🟦 **axe**（ソース実測で確認） | **畳む。ただし引き換えに我々が測る** |

## 影響

### 🟦 観測（この回で確かめたこと）

- **保留 23 件は再現する。**同じコミットで `tools/a11y-scan.mjs` を 2 回打ち、**ノード単位で完全一致**
  （🟥 **「再現しない」に賭けた予測は外れた**）
- **種類と理由を機械が持つようにした**（部品5 D2=C）——`messageKey` / `pair` / `contrastRatio` を保存し、
  **分類できないものが 1 件でもあれば `exit 1`**。**赤テストで両方向を確認**（分類を 1 語消して赤・戻して緑）

### 🟥 推論（まだ確かめていない）

- **他の機械ゲートにも「保留」の口があるかは、1 つも数えていない**（→ [OBS-0022](../OBS/OBS-0022_他の機械ゲートにも保留の口があるか.md)）
- **`shortTextContent` の閾値**（何文字までが「短い」か）は読んでいない。
  **日本語 1 文字の部品は今後も同じ扱いになる**見込みだが、**確かめていない**

## 一般則（この repo に効く形）

> **数える場所を作っただけでは読めない。**
> **「保留」は "誰の事情で保留なのか" を種類として持ち、分類できないものは落とす。**
> **畳むときは必ず引き換え（機械が測れなかったものを、我々が測る手）を書く。**

★ **「引き換えを書けないなら畳まない」は [部品1 D3](../手順/部品1_完成バーを機械で閉じる.md)（`color-contrast` を外す代わりに
数える場所を移した）と [部品4 D7=C](../手順/部品4_開かれないoverlayを開く.md)（`aria-hidden-focus` を外す代わりに
`expectFocusTrapped` を置いた）の 3 例目。**
