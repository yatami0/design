---
id: DR-0098
type: finding
title: '機械が「分からない」と答えたものが、緑として記録されていた — axe の incomplete を落とす側も数える側も見ていなかった'
status: observed
date: 2026-08-09
step: '-'
related: [DR-0096, DR-0097, DR-0094, DR-0048]
poc_feedback: '工場の規約: 検査結果を「合格 / 不合格」の 2 値で読まない。機械が判定を保留した件数を、合格と別に数える'
---

# DR-0098: 機械が「分からない」と答えたものが、緑として記録されていた

## 背景

[部品4](../手順/部品4_開かれないoverlayを開く.md) C4-02 で `Sheet` に**開いた story** を置き、完成バーに通した。
**通った。**[DR-0096](DR-0096-overlays-that-no-story-opens-are-invisible-to-every-check.md) の推論（「`SheetTitle` が紐づく見込み」）どおりに読めた。

🟥 **同じ回で `DropdownMenu` と `Select` が `aria-hidden-focus` で落ちた**ので、
**なぜ `Sheet` だけ通るのか**を確かめに行った。

## 発見

**`Sheet` は通っていない。axe が判定を放棄していた。**

story の中で axe を直接走らせた実測（2026-08-09）:

| story | `violations` | `incomplete` |
| --- | --- | --- |
| `Sheet/Open` | 🟦 **0** | 🟥 **`aria-hidden-focus` / serious / 3 ノード** |
| `DropdownMenu/Open` | 🟥 `aria-hidden-focus` / serious | 🟥 `aria-hidden-focus` / serious / 2 ノード |

### 🟥 なぜ「保留」が緑になっていたか —— 2 つの経路が独立に同じものを捨てていた

| 経路 | 何を見ているか | incomplete |
| --- | --- | --- |
| **落とす側**（`.storybook/preview.tsx` の `a11y.test: 'error'`） | `violations` のみ | 🟥 **見ない** |
| **数える側**（`tools/a11y-scan.mjs`） | `resultTypes: ['violations']` と**明示して**取得 | 🟥 **捨てている** |

★★★ **この repo は「機械が分からないと答えたもの」を、2026-08-09 まで 1 件も記録していなかった。**

### 分かれ目は `axe-core` の modal 判定

`axe-core@4.12.1` のソース実測（`isModalOpen()`）:

```js
const definiteModals = querySelectorAllFilter(axe._tree[0],
  'dialog, [role=dialog], [aria-modal=true]', isVisibleOnScreen)
if (definiteModals.length) { return true }   // → focusable-modal-open が undefined を返す ＝ incomplete
```

- **`Sheet`** は `role="dialog"` → modal と認識 → **判定を放棄（incomplete）**
- **`DropdownMenu`（`role="menu"`）／ `Select`（`role="listbox"`）** は認識されない
  → 幾何ヒューリスティックも当たらない → **violation**

🟥 **どちらの場合も、axe は「フォーカスが閉じ込められているか」を答えていない。**
**違いは「答えなかったこと」が緑に見えるか赤に見えるかだけ。**

## 根拠（実測・2026-08-09）

- **story 内で `axe.run(document)` を直接実行**して `violations` と `incomplete` を分けて出力した
  （`color-contrast` / `region` は無効化した状態）。結果は上表。
- **`axe-core@4.12.1` の `isModalOpen()` / `focusableModalOpenEvaluate()` を読んだ**
  （`node_modules/.pnpm/axe-core@4.12.1/.../axe.js` L17660 / L26415）。
  `aria-hidden-focus` は `all: ['focusable-modal-open', 'focusable-disabled', 'focusable-not-tabbable']`。
- **`tools/a11y-scan.mjs` から `resultTypes: ['violations']` を外して全 story を再走査した**
  （`storybook-static` ＋ axe-core 4.12.1・story 128 題）:

| 棚 | violations | **判定の保留（新規計測）** |
| --- | --- | --- |
| 出荷物 | 148（**critical 0**・serious 148） | 🆕 **23**（`aria-hidden-focus` 11 ／ `color-contrast` 10 ／ **`aria-valid-attr-value` 2**） |
| 除外 | 195 | 🆕 **0** |

  🟨 **`bypass` は 102 件 / 44 story 出たが harness 由来**（iframe 1 枚に story 1 つ）なので
  `region` / `landmark-one-main` と同じ扱いにした。**消したのではなく分類し、数をコードのコメントに残した。**
- 🟦 **「閉じ込められているか」は我々が測った**——`userEvent.tab()` を 3 回打っても
  `DropdownMenu` / `Select` / `Sheet` / `Dialog` の**いずれも中身から出ない**（実測）。

## 影響

**観測から直接言えること**

- **「バーが緑」は「違反が無い」ではなく「違反として確定したものが無い」だった。**
  🟥 **保留は 23 件あり、うち `aria-valid-attr-value` 2 件は harness 由来ではない**
  （`DropdownMenu` の `#radix-_r_4_` ／ `DatePicker` の `.border-border`）。
- **`aria-hidden-focus` の指摘は、部品の欠陥ではなく検査器の限界。**
  Radix は modal overlay を開くと `hideOthers()` で document の残りに `aria-hidden` を付けるが、
  **focus は実際に閉じ込められている**（実測）。axe はそれを見る手段を持たない。
- ★ **[DR-0097](DR-0097-an-exception-that-covered-the-whole-set-hid-the-rule.md) と同型の 2 例目**——
  あちらは「例外が全量を覆って規則が観測されなかった」、
  **本件は「保留という第 3 の答えが、2 値の器に入れた瞬間に消えた」。**
- ★★ **「対象 0 件で緑」（通算 17 例）とは別の型。**
  **対象は在り、検査も走り、それでも緑になる**——**判定が返ってこなかったから。**

**🟥 推論（未検証）**

- 保留 23 件のうち `color-contrast` 10 件（`Avatar` / `DatePicker` の日付セル）が
  **本当に測れないのか、測れば違反なのか**は見ていない。
- **他の機械ゲートにも同じ形があるか**は数えていない。
  🟨 候補: `tsc` の `skipLibCheck` ／ eslint の `--report-unused-disable-directives` 未設定 ／
  `cspell` の `Files checked` に入らないパス。**「合格でも不合格でもない結果」を返す口があるか**で数える。

## 関連

- 手順書: [docs/手順/部品4_開かれないoverlayを開く.md](../手順/部品4_開かれないoverlayを開く.md) D7・D8
- [DR-0096](DR-0096-overlays-that-no-story-opens-are-invisible-to-every-check.md)（本 DR の起点。**同 DR の推論「`Sheet` は通る見込み」は当たったが、理由は違った**）
- [DR-0097](DR-0097-an-exception-that-covered-the-whole-set-hid-the-rule.md)（「規則が一度も観測されなかった」の 1 例目）
- 実測の記録: [docs/実行記録.md](../実行記録.md) §部品4 C4-03
