---
id: DR-0096
type: finding
title: '開かれない overlay は、どの検査からも見えない — Popover は 2 日間、名前の無い dialog を出荷していた'
status: observed
date: 2026-08-09
step: '-'
related: [DR-0048, DR-0089, DR-0090, DR-0091, DR-0070]
poc_feedback: '工場の規約: 開閉を持つ部品は「開いた story」を必須にする。閉じた状態しか描かない story は、その部品を 1 度も検査していない'
---

# DR-0096: 開かれない overlay は、どの検査からも見えない

## 背景

[部品3](../手順/部品3_DatePickerと射程の外の3件.md) C3-03 で `DatePicker`（Popover ＋ Calendar の合成）に
**開いた状態の story**（`DatePicker/Open`）を置き、完成バーに通した。

## 発見

**バーが落ちた。落ちたのは `DatePicker` ではなく `Popover` だった。**

```
Expected the HTML found at $('#radix-_r_4_') to have no violations:
<div role="dialog" data-slot="popover-content" …>
Received: "ARIA dialog and alertdialog nodes should have an accessible name (aria-dialog-name)"
```

- `PopoverContent` は Radix の **`role="dialog"`** を出すが、**名前を 1 つも持たない**。
  shadcn の `popover.tsx` は `aria-label` も `aria-labelledby` も配線していない。
- 🟨 **`PopoverTitle` を置いても解決しない**——上流の `PopoverTitle` は
  `data-slot` つきの `<div>` で、**`aria-labelledby` に繋がっていない**（実測）。
  `Dialog` は Radix 側が `DialogTitle` を自動で紐づけるので通るが、**`Popover` は紐づけない。**
- ★★★ **`Popover` は工程3（2026-08-07）から出荷している。**
  2 日間、**名前の無い dialog を出荷していた。**

### 🟥 なぜ 2 日間見えなかったか —— 検査の対象が 0 件だったから

**`Popover` を開く story が 1 本も無かった。**

| story | 開くか | 検査の対象 |
| --- | --- | --- |
| `Popover/Default` | 🟥 **開かない**（トリガを描くだけ） | 🟥 **0 件**（閉じた popover は DOM を持たない） |
| `PeriodSelect/Custom` | 🟥 **開かない**（`custom` のトリガが出るだけ） | 🟥 **0 件** |

**axe は「そこに無いもの」を違反として出さない。**閉じた overlay は DOM に存在しないので、
**a11y の走査も、面①（描画された）も、面④（語彙の効果）も、全部「0 件で緑」になる。**

★★ **これは [DR-0048](DR-0048-build-storybook-does-not-render.md)（`build-storybook` は落ちない）とは別の穴。**
DR-0048 は「**実行しないから見えない**」、本件は「**実行しても、開かないから見えない**」。

## 根拠（実測・2026-08-09）

- `DatePicker/Open`（`play` でトリガを click する初めての Popover story）が、**初回の実行で落ちた。**
- 塞いだあと **124/124 緑**（バー全数）。
- 塞ぎ方は **製品層で `PopoverContent` を昇格させ、`aria-label` を型で必須にした**
  （[部品3 D10=B](../手順/部品3_DatePickerと射程の外の3件.md)）。
  🟦 **素材層は 1 行も触っていない**（`Select.tsx` の先例と同じ手）。
  🟥 **`tsc` が既存の使用箇所 2 つを両方落とした**——`DatePicker` と `Popover/Default`。
  **型で要求すると、書き忘れは書いた瞬間に落ちる**（面⑤「型の閉じ」）。

## 影響

**観測から直接言えること**

- **開閉を持つ部品は「開いた story」が無いと 1 度も検査されていない。**
  現況で開く story を持つのは `Dialog/Open` と 🆕 `DatePicker/Open` の **2 件だけ**——
  🟥 **`DropdownMenu` / `Sheet` / `Tooltip` / `Select` の中身は、いまも開かれていない。**
- **名前の既定は持てない**（popover の中身を決めるのは使う側）ので、
  **「名前を付けること」を文書に書く形では守れない**——**型で要求するしかない。**
- ★ **「44 部品が完成バーを通っている」の意味が 1 段弱まる**——
  バーは **story が描いた DOM しか見ない**ので、**story が開かない状態は射程外。**
  [台帳 §4](../部品の完成バー_台帳.md)（バーが見ていない出荷物）に**「開かれていない状態」という欄が要る。**

**🟥 推論（未検証）**

- 上記 4 部品（`DropdownMenu` / `Sheet` / `Tooltip` / `Select`）にも同種の欠陥があるかは**測っていない**。
  🟨 `Sheet` は Radix の `Dialog` 系なので `SheetTitle` が紐づく見込みだが、**確かめていない**。
- **「開いた story」を機械で要求できるか**（開閉を持つ部品の一覧を機械が知る方法）は未検討。

## 関連

- 手順書: [docs/手順/部品3_DatePickerと射程の外の3件.md](../手順/部品3_DatePickerと射程の外の3件.md) D10
- [DR-0089](DR-0089-overlays-do-not-cover-their-anchor.md)（**同じ `Popover`/`Select` 系の 1 例目**——開いてみて初めて重なりが分かった）
- [docs/部品の完成バー.md](../部品の完成バー.md) §0 罠 3（portal は観測から消える）／ §7（バーが保証しないこと）
- 実測の記録: [docs/実行記録.md](../実行記録.md) §部品3 C3-03
