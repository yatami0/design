---
id: DR-0103
type: decision
title: '測る側にも網を掛ける — 数字を作る 1,512 行に型検査も自動テストも無かった'
status: decided
date: 2026-08-09
step: '-'
related: [DR-0094, DR-0101, DR-0098, DR-0100, DR-0102]
poc_feedback: '工場の規約（測定器）候補'
---

# DR-0103: 測る側にも網を掛ける

## 背景

この repo が台帳に載せている数字——**critical 0 ／ serious 148 ／ 色の組 9 ／ 判定の保留 23 ／
開いた overlay 7/7 ／ 出荷入口 4 本**——は、すべて **`tools/*.mjs` が作っている。**

🟥 **その測る側は、既に 2 度壊れていた。**

| # | 何が壊れていたか | どう見つかったか |
| --- | --- | --- |
| 1 | [DR-0094](DR-0094-the-bar-engine-ran-without-any-css.md) バーの実行エンジンが **CSS を 1 行も当てずに**走っていた | 🟥 **面④ を実装した最初の実行で偶然** |
| 2 | [DR-0101](DR-0101-a-comment-satisfied-the-check-for-absence.md) 静的検査が **JSDoc のコメントで通っていた** | 🟥 **別件の story を書いていて偶然** |

**2 度とも人が偶然見つけた。**部品4 K3・部品5 C5-05 の両方向の赤テストは**毎回手で打って捨てていた。**

## 決定

**測る側に 2 枚の網を掛ける。**

| 網 | 実装 | 現況 |
| --- | --- | --- |
| **型** | 🆕 `tsconfig.tools.json`（`checkJs: true` ／ `include: tools/**/*.mjs`）＋ `pnpm typecheck:tools` | 🟥 **56 件**（ベースライン） |
| **赤テスト** | 🆕 `tools/self-check.mjs`（検体を `tmp/self-check/` に書き、走査先を環境変数で向ける）＋ `pnpm self-check` | 🟦 **8 / 8** |

**付随して決めたこと 3 つ。**

1. 🟥 **本体の `tsconfig.json` には混ぜない。**
   **eslint のベースライン 50 件と同じ場所に別種の 56 件を積むと「新しい赤」が見えなくなる**（CLAUDE.md のベースライン運用）。
2. 🟥 **新しく書く道具は 0 件で入れる。**本回の `coverage-scan.mjs` / `self-check.mjs` は型エラー 0
   ＝ **eslint の「自作分の赤は 0」を型にも当てた。**
3. 🟨 **ゲートは 7 本のまま。**8 本目にするかは**ユーザー判断**（部品3 D7 の前例——**ゲートの本数は CLAUDE.md の規約**）。

## 根拠（実測）

**① 網が 1 枚も無かったこと**

- `tsconfig.json` の `include` は `src/**` / `*.config.ts` / `.storybook/**` のみ。
  `npx tsc --noEmit --listFiles` の repo 内 166 ファイルに **`tools/*.mjs` は 1 本も無い。**
- `allowJs: true` だが **`checkJs` が無い**＝ **`include` に足しても型検査はされない。**
- `eslint` は 7 本とも見ている（error 0 / warning 0）が、**`**/*.{js,mjs,cjs}` は `disableTypeChecked`**＝ **型情報を 1 つも使っていない。**
- 🟥 **`*.test.*` / `*.spec.*` が repo に 0 ファイル**（story の `play` が唯一の実行検査で、`tools/` は 1 本も掛からない）。

**② 誰も気づかないことの実測（部品6 K4）**

`tools/a11y-scan.mjs` に**意図的な数え落とし**を入れた（`axe.run(document, { resultTypes: ['violations'] })`＝ 部品4 D8=B より前の形）。

| ゲート | 結果 |
| --- | --- |
| typecheck / build / format / spell / build-storybook | 🟦 **全部 exit 0** |
| lint | 🟦 **error 50 / warning 1（内訳まで一致）** |
| **バー** | 🟦 **130 / 130 緑** |
| 🟥 **台帳の数字** | 🟥 **判定の保留 23 → 10 ／ 既知の色の組 9 → 2** |
| 🟥 **`a11y-scan` 自身** | 🟥 **exit 0**（未分類 0 のまま）＝ **黙って数え落とす** |

★★★ **ゲート 7 本は 1 本も動かず、台帳の数字だけが変わった。**

**③ 型を掛けた初回（部品6 K3）**

**56 件**（🟥 **予測 10〜40 は外れた**）。

| ファイル | 件数 |
| --- | --- |
| 🟥 **`a11y-scan.mjs`** | **25**（**台帳の数字を作っている当のファイルが最多**） |
| `edit-probe.mjs` | 17 |
| `visual-probe.mjs` | 6 |
| `hit-area-probe.mjs` | 4 |
| `opened-overlay-check.mjs` | 3 |
| `title-map-check.mjs` | 1 |
| `dead-class-scan.mjs` | 0 |

規則別: `TS7006`（暗黙の any 引数）23 ／ `TS7053` 10 ／ `TS2345` 6 ／ `TS7034` 4 ／ `TS7005` 4 ／ `TS2339` 4 ／ ほか 5。

**④ 赤テストの赤テスト（両方向）**

- `opened-overlay-check.mjs` から `stripComments` を外して [DR-0101](DR-0101-a-comment-satisfied-the-check-for-absence.md) の穴を戻す
  → `pnpm self-check` が **7/8・exit 1**（落ちたのは「コメントに書いただけでは通らない」の 1 本）。
- 戻す → **8/8・exit 0**。**本番の `opened-overlay-check` は 7/7 のまま。**

## 影響

**観測から直接言えること**

- **測る側を壊しても、ゲート 7 本は 1 本も反応しない**（②）。
- **台帳の数字を作っている `a11y-scan.mjs` は、型の網を掛けると最も赤いファイルだった**（③）。
- 🟦 **`self-check` は [DR-0101](DR-0101-a-comment-satisfied-the-check-for-absence.md) の再発を実際に検知する**（④）。
  **同じ穴が次に入っても、今度は人の偶然に頼らない。**

**🟥 推論（未検証）**

- 🟥 **56 件の型エラーが「実際の誤り」を含むかは数えていない。**
  **大半は `TS7006`（引数の型注釈が無い）で、それ自体は誤りではない。**
  ★ **ただし [DR-0094](DR-0094-the-bar-engine-ran-without-any-css.md) も [DR-0101](DR-0101-a-comment-satisfied-the-check-for-absence.md) も型では捕まらない形だった**——
  **だから網を 2 枚にした**（型だけでは足りないことは既に分かっている）。
- 🟥 **`self-check` が覆っているのは 2 本（`opened-overlay-check` / `coverage-scan`）だけ。**
  **残り 6 本（`a11y-scan` を含む）には検体が無い。**★ **`a11y-scan` は Storybook のビルドを要求するので、検体の作り方が別問題になる。**

## 関連

- 手順書: [docs/手順/部品6_緑の面積を数える.md](../手順/部品6_緑の面積を数える.md)
- 実測の記録: [docs/実行記録.md §部品6](../実行記録.md)
- [DR-0102](DR-0102-green-must-be-read-as-an-area.md)（緑は面積で読む＝ 同じ回の相棒）
