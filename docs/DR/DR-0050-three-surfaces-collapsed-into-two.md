---
id: DR-0050
type: finding
title: '「面は 3 層」が 2 層になっていた — 部品単位では見えず、中身の詰まったテンプレートで初めて出た'
status: observed
date: 2026-07-27
step: 手5
related: [DR-0046, DR-0043, DR-0002]
poc_feedback: '🟥 OBS 候補。写し方（マッピング）の誤りは部品カタログでは検出できない。テンプレートが要る'
---

# DR-0050: 面 2 と面 3 が同じ白になっていた

## 背景

tmp-admin §4.1 は「**面は 3 層**」と規定する——濃紺サイドバー（chrome）／キャンバス／白カード。
手4 の `AppShell`（④ Templates 層）はこの構造を**写したつもり**だった。

手5 の目視レビューで、ユーザーから
「**AppShell にチケットが並ぶメインの部分がない。見た目の検証ならテンプレートは充実させたい**」
という指摘があり、実データを詰めた story を足して測った。

## 発見

**面 2 と面 3 が同じ色だった。3 層の構造が 2 層に潰れている。**

| 面 | 要素 | 実測（`getComputedStyle`） |
| --- | --- | --- |
| 面 1 chrome | `.bg-sidebar` | `rgb(0, 58, 99)` 🟦 |
| **面 2 キャンバス** | `[data-slot="sidebar-inset"]` | **`rgb(255, 255, 255)`** |
| **面 3 カード** | `[data-slot="card"]` | **`rgb(255, 255, 255)`** 🟥 **同色** |

### 原因は写し方（マッピング）

手5 の 1 周目で `src/app/tmp-admin.css` に次のように写した。

```css
--background: #ffffff;  /* apple --color-bg      → キャンバスになる */
--card: #ffffff;        /* apple --color-surface → カードになる */
--secondary: #f2f2f7;   /* apple --color-bg-secondary（使われていない） */
--muted: #f2f2f7;       /* apple --color-bg-grouped（使われていない） */
```

apple の base では `--color-bg` も `--color-surface` も**両方 `#FFFFFF`**。
**そのまま 1:1 で写したので、キャンバスとカードが同じ色になった。**

apple は `--color-bg-secondary` / `--color-bg-grouped` に `#F2F2F7` を持っている。
**管理画面のキャンバスはそちらを指すべきだった**可能性が高いが、
🟥 **これは写し方の判断であって機械的に決まらない**（tmp-admin は面の色を名指ししていない）。

## 根拠（実測）

2026-07-27。Playwright（`storybook-static` を自前サーバで配り、`④ Templates/AppShell` の
`CardSurfaces` story を開いて `getComputedStyle().backgroundColor` を 3 要素から読んだ）。

`src/app/tmp-admin.css` の該当行は上記のとおり。`--secondary` と `--muted` に
`#f2f2f7` を入れてあるが、**`AppShell` も `Card` もそれを参照していない**。

## 影響

- 🟥 **部品単位のカタログでは検出できない種類の欠陥だった。**
  `Layout/Card` の story を単体で見ても白いカードが白い背景に乗っているだけで、
  **「面の階層が無い」とは判定できない。**中身が詰まった ④ Templates 層で初めて出た。
  → **[DR-0002](DR-0002-verify-three-layers-not-screens.md)「画面は部品を洗い出させる口実」の限界**でもある。
  画面は部品の洗い出しには使えるが、**面の構成は画面でしか測れない。**
- 🟨 **ユーザーの指摘が正しかった。**「見た目の検証ならテンプレートは充実させたい」は
  **好みの話ではなく、検出できる欠陥の種類が変わる**話だった。
- 🟥 **手5 の Q3 に 1 件追加。**[DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md) の 16 行にも
  [DR-0045](DR-0045-opacity-modifiers-were-invisible-to-lint.md) の 60 箇所にも入っていない。
  **どちらも「トークンが追従するか」の話で、本件は「追従した先の値が正しいか」**という別の軸。
- 🟨 **直し方は 2 通り**（🟥 どちらも未決。手5 では直さない）:
  - **A** `--background` を `#f2f2f7` にする（キャンバスをグレーに）
  - **B** `--card` を白のまま、`--background` を `--muted` へ寄せる
  どちらも **1 行**だが、**tmp-admin が面の色を名指ししていない**ので根拠が要る。

## 関連

- `src/app/tmp-admin.css` — 写し方の該当箇所
- [実行記録.md](../実行記録.md) §手5 H5-07
- [Storybookの設計と目視観点.md](../Storybookの設計と目視観点.md) §4
