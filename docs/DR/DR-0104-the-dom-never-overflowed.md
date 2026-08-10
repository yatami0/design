---
id: DR-0104
type: finding
title: '検査は射程に在り毎回走っていたが、その条件を満たす DOM が 130 story に 1 つも無かった'
status: observed
date: 2026-08-10
step: 工程5
related:
  [
    DR-0102,
    DR-0103,
    DR-0048,
    DR-0094,
    DR-0101,
    DR-0090,
  ]
poc_feedback: '工場の規約へ戻す候補（「対象 0 件で緑」の型を 1 つ足す）'
---

# DR-0104: 検査は射程に在り毎回走っていたが、その条件を満たす DOM が 130 story に 1 つも無かった

## 背景

工程5 で稼働ピボット（92 列）の story を足したところ、**完成バーが初めて赤になった**。
落ちたのは自分で書いた主張ではなく、**全 story に自動で掛かっている面②（axe）**だった。

## 発見

- 落ちた規則は **`scrollable-region-focusable`（serious）**——
  **横スクロールできる領域が、キーボードでは焦点を得られない**（マウスでしか最後の列に行けない）。
- 🟥 **この規則は無効化されていない。**`.storybook/preview.tsx` が無効にしているのは
  `color-contrast` と `region` の 2 つだけで、**この規則はずっと射程に在り、130 story すべてで毎回走っていた。**
- 🟥 **欠陥は新しくない。**器（`overflow-x-auto`）は素材層 `ui/table.tsx` が
  `shadcn add` の初日から持っており、**チケット一覧（6 列）も同じ器を使っている。**
- ★★ **足りなかったのは検査でも規則でもなく、条件を満たす DOM だった**——
  **溢れる表が 130 story に 1 件も無かった。**
- 🆕 同じ回に、**同じ型の 2 件目**が出た: `color-contrast / elmPartiallyObscured` が **105 件**
  （`tools/a11y-scan.mjs` の未分類）。**これも「横に溢れる表が 1 つも無かった」ために 1 度も出ていない。**

★ **これは既知の 3 型のどれとも違う:**

| 型 | 何が欠けていたか | 初出 |
| --- | --- | --- |
| 対象 0 件で緑 | **対象**が 0 件（走ったが何も見ていない） | 通算 16 例 |
| 保留で緑 | **判定**が保留のまま緑（[DR-0100](DR-0100-pending-judgements-split-into-three-kinds.md)） | 部品4 |
| 主張 0 本で緑 | **要求**が 0 本（[DR-0102](DR-0102-green-must-be-read-as-an-area.md)） | 部品6 |
| 🆕 **条件未到達で緑** | 対象も検査も要求も在るが、**規則の前提条件を満たす状態を 1 度も作っていない** | 本件 |

## 根拠（実測）

- **赤**: `pnpm test-storybook` → `Test Files 1 failed | 58 passed (59)` /
  `Tests 1 failed | 132 passed (133)`。落ちた story は `⑤ 題材（Redmine）/稼働表 > Quarter Ninety Columns`。
  axe の出力は逐語で
  `Expected the HTML found at $('.overflow-x-auto') to have no violations` /
  `"Scrollable region must have keyboard access (scrollable-region-focusable)"` /
  `Fix any of the following: Element should have focusable content / Element should be focusable`。
  対象は `<div data-slot="table-container" class="relative w-full overflow-x-auto">`。
- **無効化されていないことの確認**: `.storybook/preview.tsx` の `a11y.config.rules` は
  `'color-contrast': { enabled: false }` と `region: { enabled: false }` の **2 件のみ**。
- **溢れる story が無かったことの確認**: `Overflow` という名の story は 4 本あるが
  （`Alert` / `Field` / `RadioGroup` / `Textarea`）、**どれも表ではない。**
- **実際に溢れていることの実測**（`tools/pivot-probe.mjs` K6-c）:
  `scrollWidth 3980 / clientWidth 1200`（溢れ **2780 px**）・`th` **94 本**。
- **緑に戻したときの実測**: 製品層ラッパーで器に `tabIndex={0}` を足す → `137 / 137 緑`。
- **2 件目**: `node tools/a11y-scan.mjs` → `🟥 未分類 105 件`
  （全件 `color-contrast / elmPartiallyObscured` / `⑤ 題材（Redmine）/稼働表`）。分類後は exit 0。

## 影響

**観測から直接言えること**

- **`DataGrid` を使う既存の画面（チケット一覧）も同じ欠陥を持ったまま 130/130 緑だった。**
  製品層ラッパー（工程5 D9=B）はその画面にも同時に効く。
- **バーの「130/130 緑」は、130 通りの DOM で 130 通りの状態を試した結果ではない。**
  規則の前提条件（溢れる・重なる・長い・多い）に到達した story の数は、別の量である。
- 🟥 **この型は「掛かっている検査を数える」（[DR-0102](DR-0102-green-must-be-read-as-an-area.md) の面積）では見つからない。**
  面② は 130/130 で 100% と表示されていた。

**🟥 推論（未検証）**

- 🟥 **同じ形の未到達が他にもあると考えられる**（長い文字列・多い要素・小さい画面・深い入れ子）。
  **数える方法は分かっていない**——「規則が発火しうる DOM 条件」の一覧が axe 側にも我々の側にも無い。
  検証するなら、**極端な入力の story を意図的に足して差分を見る**のが最短だが、
  **「どこまで極端にすれば十分か」の停止条件が書けない。**
- 🟥 **「溢れる表を 1 本 story に持つ」を規約にするかは決めていない**（本 DR は発見のみ）。

## 関連

- 手順書: [docs/手順/工程5_稼働表_ピボット.md](../手順/工程5_稼働表_ピボット.md) §2 D9・D13
- 実測の記録: [docs/実行記録.md](../実行記録.md) §工程5
