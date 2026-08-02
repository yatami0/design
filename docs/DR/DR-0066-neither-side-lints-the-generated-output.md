---
id: DR-0066
type: finding
title: '生成物は境界のどちら側でも検査されていない — 我々は 6 本中 0 本、受け手は設定が parse すらできない'
status: observed
date: 2026-08-02
step: 手8
related: [DR-0059, DR-0060, DR-0063, DR-0064, DR-0048]
poc_feedback: '🟥 architecture.md / ui.md の材料。**「規約を書いた」と「規約が守られているか機械で見ている」は別**。生成 AI に渡す規約は、検査する側の射程とセットで設計する'
---

# DR-0066: 生成物は境界のどちら側でも検査されていない

## 背景

手7 が手8 の問いを「出力は lint / validate.mjs を通るか」から
「**受け手の lint と我々の lint はどこで食い違うか**」へ具体化した（[DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md)）。
その食い違いを数えるために、まず**両側が生成物を見ているか**を確かめた。

## 発見

### 1. ★ 我々の機械ゲート 6 本は、生成物を 1 文字も見ていない

わざと違反する `.dc.html`（`p-4` / `text-gray-600` / `w-[192px]` / 生 px / 生 hex / `<button>` / `<table>`）を
`artifacts/` に置いて 6 本を回した。**全部黙った。**

| ゲート | 結果 | 理由 |
| --- | --- | --- |
| `typecheck` | ⬜ 見ない | `tsconfig` の `include` は `src/**` ほか |
| `lint` | ⬜ 見ない | `File ignored because no matching configuration was supplied` |
| `build` | ⬜ 見ない | — |
| `format:check` | ⬜ 見ない | `.prettierignore` の `artifacts/`。🟦 ignore を外せば読む |
| `spell` | ⬜ 見ない | `cspell.json` の `ignorePaths` に `artifacts` |
| `build-storybook` | ⬜ 見ない | — |

🟥 **`spell` には穴が二重にあった。**きれいなディレクトリへ置き直すと cspell は `.dc.html` を**読む**が、
**それでも 0 件**——**綴りしか見ない**ので `p-4` も `#3b82f6` も検出対象ではない。
→ **「射程外だから 0」と「射程内だが規則が無いから 0」が重なっていた。**

### 2. ★ 受け手の `_adherence.oxlintrc.json` は oxlint で読み込めない

```
$ npx oxlint@1.76.0 -c _adherence.oxlintrc.json <検体>
Failed to parse oxlint configuration file.
  x Rule 'no-restricted-syntax' not found in plugin 'eslint'
```

- 🟥 **`no-restricted-syntax` は oxlint 1.76.0（最新）に存在しない。**この設定の**中身の大半（56 エントリ）**がこのルール
- 🟥 **1 ルールの不在で設定ファイル全体が parse エラーになる**ため、
  **実装されている 2 本（`react/forbid-elements` / `no-restricted-imports`）まで巻き添えで死ぬ**
- 🟥 **`.dc.html` を直接食わせると `No files found to lint`**——ファイルとして認識すらしない

### 3. 実装されている 2 本を切り出して走らせても、検体は 0 件

赤テスト（`<button>` / `<table>` を含む断片）では**発火する**ことを確認してから検体にかけた。
検体（TSX へ機械翻訳した 1 周目・3 周目）は **0 件**——素の `<button>` `<table>` `<input>` `<select>` が無く、
import も `index` 経由だったため。

### 4. ★ 56 セレクタが「走ったと仮定」しても、当たるのは偽陽性だけ

`no-restricted-syntax` は ESLint 側が実装しているので、**受け手の 56 セレクタをそのまま ESLint に載せて**測った
（赤テストで 5 件発火することを確認済み）。

| 検体 | 件数 | 内容 |
| --- | --- | --- |
| 1 周目 | 2 | `<Button onClick={…}>` ×2 |
| 3 周目 | 3 | `<Select onValueChange={…}>` ×2 ／ `<Button onClick={…}>` ×1 |

🟥 **5 件すべて偽陽性。**`Button` は `React.ComponentProps<'button'>` を継承しており `onClick` は正当、
`Select` は Radix の `onValueChange` を持つ。**同じ検体を我々の typecheck に通すと 1 件も出ない。**

→ **受け手が `.d.ts` から props を機械抽出するとき、継承した props（HTML 属性・Radix の props）が落ちている。**

### 5. 我々の側で翻訳物を測ると、ESLint 0 件・typecheck 本物 2 件

| ゲート | 検体からの増分 |
| --- | --- |
| `lint` | 🟦 **0 件**（error 33 / warning 1 のまま） |
| `typecheck` | 🟥 **7 件。うち本物 2 件**——`React.createElement(StatusPill, { tone })` が**必須 `children` を満たさない**（残る 5 件は翻訳の書き方に由来） |

🟥 **`tabular-nums` はどちらの網にも掛からない。**
数値の段でもパレット色でも任意値でもないので、我々の `no-restricted-syntax` は素通りし、
受け手も className を見ない（[DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md) §4）。

## 根拠（実測）

2026-08-02、ブランチ `step/h8-output-passes-gates`（`5c36b88` から分岐）。

- 射程の赤テスト: `artifacts/_probe/red-test.dc.html` を置いてゲート 6 本 → 全本無反応。
  名指しでの確認（`eslint <file>` は ignored 警告、`cspell <file>` は `Files checked: 0`、
  `prettier --check --ignore-path /dev/null <file>` は `[warn]`）
- 受け手の設定: `DesignSync(get_file, '_adherence.oxlintrc.json')`（`truncated: false`）。
  写しは `artifacts/h8/_adherence.oxlintrc.json`（🟨 `x-omelette` メタデータは除いた。oxlint は読まない）
- oxlint 1.76.0 を `npx` で実行。ルール個別確認も実施
- 56 セレクタの ESLint 実行: `artifacts/_probe/eslint-receiver.config.mjs`（撤去済み）
- 検体: `artifacts/h8/RedmineIssueList.r1.tsx` / `.r3.tsx`（手順書 §2.2 の 5 規則で機械翻訳。
  **翻訳で赤を消していないことを、禁止語彙・宣言語彙の出現数の全件突き合わせで確認済み**）

## 影響

**観測から直接言えること**

1. ★ **手8 の問いの前提が外れた。**「どこで食い違うか」を問う前に、**両側とも生成物を検査していない。**
   食い違い表（[実行記録 §手8](../実行記録.md)）は、ほとんどのセルが「射程外」か「規則が無い」で埋まった。
2. ★ **「規約を書いた」と「規約が守られているか機械で見ている」は別。**
   手6 は conventions header を「書けた」と答え、手7 は「効いた」と答えたが、
   **効いたことを機械で確認する手段は、境界のどちら側にも成立していない。**
   守られたのは **agent が読んで従ったから**であって、**止められたからではない。**
3. ★ **受け手の lint は「飾り」ですらなく「壊れている」。**
   [DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md) §推論の「走っていなければただの飾り」より悪い——
   **走らせようとすると設定が読めず、動く 2 本まで道連れになる。**
4. 🟥 **`.d.ts` からの props 抽出が浅い。**[DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md) §影響 3 は
   「`.d.ts` の質が受け手の lint の質を決める」としたが、**型は正しく、抽出が継承分を落としていた。**
   **質の問題ではなく抽出の欠陥。**
5. 🟦 **生成物の質そのものは高い。**[DR-0065](DR-0065-claude-design-uses-the-registered-components.md) の観測と矛盾しない——
   **赤が出ないのは「検査していないから」であって「悪いものが無いから」ではないが、
   実際に悪いものも少ない。**この 2 つを混ぜない。

**🟥 推論（未検証）**

- **旧版の oxlint に `no-restricted-syntax` があったかは確認していない。**
  ルールは足されるもので消えるものではないので、**存在しなかったと見るのが自然**だが、実測していない。
- **受け手が oxlint 以外のランナーでこの設定を使っている可能性がある。**
  ファイル名は oxlint を名指ししているが、**実際に何が走っているかは我々からは見えない。**
- **`React.createElement` ＋ 必須 `children` の型不整合が、移送時に何件になるかは分からない。**
  検体 2 本で 2 件。**`columns[].cell` を使う画面が増えれば比例して増える**と思われる。

## 関連

- 手順書: [手8](../手順/手8_出力は機械ゲートを通るか.md)
- 実測の記録: [実行記録.md](../実行記録.md) §手8
- 前提: [DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md)（受け手が作る lint）／ [DR-0064](DR-0064-design-project-receives-runtime-only.md)（何が届くか）
- 同型: [DR-0048](DR-0048-build-storybook-does-not-render.md)（緑は描画を保証しない）——**「対象 0 件で緑」の 14・15 例目**
- 残った穴: [DR-0063](DR-0063-forbidding-without-an-alternative-fails.md) の `tabular-nums` は**どの網にも規則が無い**
