---
id: DR-0057
type: finding
title: '/design-sync が上げるのはコンパイル済みの実コンポーネント — プレビュー HTML は人間用のカードにすぎない（DR-0018 の訂正）'
status: observed
date: 2026-08-01
step: 手6
related: [DR-0018, DR-0017, DR-0024, DR-0002]
poc_feedback: '🟥 architecture.md の材料。「UI カタログ = Storybook」は Claude Design 連携の入力形式そのものになる'
---

# DR-0057: `/design-sync` が上げるのはコンパイル済みの実コンポーネント

## 背景

手6 の手順書を起草した時点で、私は「プレビュー HTML を自前で作る手」として §2 D2 を
**A 手書き／B Playwright で `storybook-static` から吸い出す／C 静的レンダリング経路を新規に書く**の 3 案に落としていた。

ユーザーから「**Claude 公式が提供しているコマンドがあったはず。それは Playwright を使う訳ではないと思う**」
「**手書きもよく分からない**」という指摘を受け、一次情報を取りに行った。

[DR-0018](DR-0018-design-sync-takes-preview-html.md) は `DesignSync` **ツール**の仕様だけを読んで書かれており、
**`/design-sync` skill 本体を読んでいなかった。**

## 発見

**DR-0018 の中核が誤っていた。3 案とも成立しない。**

### 1. 🟥 React コンポーネントは渡る（DR-0018 の「渡らない」は誤り）

skill 冒頭の対応表が、アップロードされる成果物と読み手を明示している。

| アップロードされるもの                                          | 読み手                    | 用途                                                                  |
| --------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------- |
| `_ds_bundle.js` + `_vendor/`                                     | **design agent のランタイム** | 生成されるすべてのデザインが `window.<globalName>.*` の**実コンポーネントを描画する** |
| `styles.css` / `fonts/` / `tokens/` / `_ds_bundle.css`           | すべての描画結果          | 見た目（トークン・フォント・部品のスタイル）                          |
| `<Name>.d.ts`（`<Name>Props`）                                    | **design agent**          | **コードを書く相手としての API 契約**                                 |
| `<Name>.prompt.md`                                                | **design agent**          | **使い方リファレンス**（構成のしかたと例）                            |
| `<Name>.html` プレビューカード                                    | **人間**（部品ピッカー）  | 部品を探し、同期結果を信頼するため                                    |
| `_ds_sync.json`                                                   | 次回の同期                | 内容ハッシュの錨。変わっていない部品の再検証を飛ばす                  |

**プレビュー HTML は「人がピッカーで探すためのカード」**であって、design agent が設計に使う実体ではない。
DR-0018 が「渡るのはプレビュー HTML だけ」と読んだのは、**ツール仕様に出てくるパス例が HTML だったから**にすぎない。

### 2. 🟥 フラグの載せ場所は「無い」のではなく 2 つある

DR-0018 は「フラグ（`stateful` / `behaviorHook` / `formBound` / `overlay` / `container`）を載せる場所は無い」と結論した。
実際には **design agent が読む場所が仕様上 2 つある。**

- **`<Name>.prompt.md`** — 部品ごとの使い方リファレンス
- **conventions header**（`readmeHeader` 設定キー） — 生成される README の先頭に付き、
  **design agent の system prompt に inline される**。skill は「**design agent は列挙された具体的な指示にしか従えない。
  語彙を名指ししなければ自分で発明する**」と明記し、書くべき 4 項目（ラップと初期化 / スタイリングの語彙 /
  真実がどこにあるか / 慣用的な組み立て例）を指定している。

### 3. Storybook は「入力」であり「正解合わせの基準器」

skill は shape を 2 つ持ち、`**/.storybook/main.*` があれば `shape = 'storybook'` に確定する。

> Storybook is the **fidelity oracle, not the runtime**.

- converter は package の**ビルド済み `dist/` を `_ds_bundle.js` にバンドル**する
- プレビューは **story のソースモジュール自体をコンパイルして**生成する（hooks・fixture・ローカルヘルパーごと）。
  部品の import は shipped bundle（`window.<Global>`）へ差し替えられる
- 🟥 **`storybook-static` からは 1 バイトもアップロードされない。**参照用のローカル基準器として使うだけ
- 🟥 **story のコードはビルド時に評価されない。**ブラウザでしか動かない

### 4. Playwright は使う。ただし「変換」ではなく「検証」のため

> Playwright + chromium are **required** for this shape (the compare loop is the verification), not optional.

compare ハーネス（`storybook/compare.mjs`）が **参照 Storybook のスクショと、生成したプレビューの描画を並べて撮り、
一致するまで直す**。**私が D2=B で提案した「Playwright でプレビューを作る」とは役割が正反対。**

### 5. 🟥 この repo は converter の想定する形をしていない

converter は `pkg` と `globalName`、そして**ビルド済み `dist/` エントリ**を要求する。

| 実測（`package.json`・2026-08-01）        | 値                                          |
| ----------------------------------------- | ------------------------------------------- |
| `name`                                    | `design`                                    |
| `private`                                 | `true`                                      |
| `build`                                   | `next build`（**アプリのビルドで dist は出ない**） |
| `main` / `module` / `exports`             | **無し**                                    |
| `dist/`                                   | **存在しない**                              |
| `.storybook/main.ts`                      | 🟦 **有り**（→ `shape = 'storybook'` に確定） |

**shape の判定は通るが、バンドルの材料が無い。**

## 根拠（実測）

2026-08-01。`/design-sync` skill は `~/.claude/skills/` にもプラグインにも実体が無く、
**Claude Code バイナリに埋め込まれている**（`~/.local/share/claude/versions/2.1.220`）。
`strings` で抽出して全文を読んだ。

- skill 本体（`name: design-sync`）— §0 期待値の設定 ／ §1 対象プロジェクトの選定 ／ §2 探索と config ／
  §3 逐次アップロード ／ conventions header の執筆
- storybook サブスキル（`# Storybook source shape`）— §2 ビルドと converter 実行 ／ §3 自己修復ループ ／
  §4 プレビューと storybook の突き合わせ ／ §5 逃げ道 ／ §6 アップロード ／ §7 再同期
- `package.json` は本 repo の実ファイルを読んだ

## 影響

**観測から直接言えること**

1. 🟥 **[DR-0018](DR-0018-design-sync-takes-preview-html.md) は `status: superseded` にすべき。**
   「story も React も渡らない」「フラグを載せる場所は無い」の 2 点が誤り。
   `group` が役割 9 カテゴリに使えること・`thin` / `variantsIdentical` の存在は正しい。
2. 🟥 **手6 の §2 D2（プレビューの作り方）は 3 案とも捨てる。**正しい道は「**公式 converter を走らせる**」の 1 本。
   自前生成は skill 自身が「off-script generation は正当だが、**off-script の検証は正当ではない**」と条件を付けている。
3. 🟦 **未決 #10（フラグの辞書をどこに持たせるか）に、仕様に書かれた経路が 2 つ見つかった**
   （`.prompt.md` と conventions header）。**「Claude Code 側の skill / rules に持たせるしかない」は前提ごと不要になった。**
4. 🟥 **手6 の最初の障害は「ライブラリとしてのビルドが無い」こと。**
   これは Storybook の有無でも認証でもなく、**この repo が Next.js アプリであってライブラリ package でない**ことに起因する。
5. 🟦 **手2b で Storybook を入れた判断（[DR-0017](DR-0017-storybook-as-catalog.md)）が、想定と違う形で効いた。**
   「開発カタログ」として入れたものが、**Claude Design 連携の入力形式そのもの**だった。
   段取りの「カタログは 2 つある（用途が違う）」という整理は、**片方がもう片方の入力**という関係に書き換わる。
6. 🟥 **一次情報を実測で置き換える規律の 6 例目。**しかも今回は
   **「ツールの仕様は読んだが、それを使う skill を読んでいなかった」**という新しい抜け方だった。

**🟥 推論（未検証）**

- `--entry` にビルド前の TS ソースを渡せば通るかもしれない（converter は esbuild を使う）。**未検証。**
  通らなければライブラリビルドを足すことになり、**手9 の移送コストが増える。**
- `.prompt.md` と conventions header にフラグを書けば design agent が実際に使い分ける、とは**まだ言えない**。
  「書いた」と「効いた」は別で、判定は手7。
- 37 story の compare ループが何周で収束するかは不明。skill は「大きな repo で数時間」と警告している。

## 関連

- 手順書: [手6](../手順/手6_ClaudeDesignへの同期.md)
- 訂正対象: [DR-0018](DR-0018-design-sync-takes-preview-html.md)
- 先行調査（二次情報）: [ClaudeDesignShadcnIntegration.md](../../ClaudeDesignShadcnIntegration.md) —
  「ローカルの React コンポーネントを変換してアップロード」と書いており、**こちらの方が実態に近かった**
