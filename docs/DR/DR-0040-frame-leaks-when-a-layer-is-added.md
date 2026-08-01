---
id: DR-0040
type: finding
title: '枠は層を足すたびに漏れる — 新しいディレクトリは lint の射程に自動では入らない'
status: observed
date: 2026-07-26
step: 手4
related: [DR-0033, DR-0028, DR-0025]
poc_feedback: '🟥 OBS 候補。ディレクトリ単位で効かせる規約は「足したときに漏れる」前提で運用手順が要る'
---

# DR-0040: 枠は層を足すたびに漏れる

## 背景

[DR-0033](DR-0033-step5-criteria-differ-per-layer.md) は、製品層とアプリ層に
「数値の段」「パレット色」「素材層の直 import」を禁じる lint を張ると決めた。
手4 で ③ 層（`src/patterns/` `src/templates/`）を新設する際、
**H4-01（ゲートの射程テスト）でこれらが射程外だと判明した。**

## 発見

### 1. 新ディレクトリは 3 ルールすべての射程外だった

赤テスト用に `p-13` / `text-gray-600` / 素材層の直 import を置いたが、
**`eslint` は exit 0 で 1 件も出さなかった。**

`--print-config` で確認した結果:

| ルール | `src/patterns/` での状態 |
|---|---|
| `no-restricted-syntax`（数値の段・パレット色） | 🟥 **Server Actions 禁止だけ**。手3 で足した 8 セレクタが当たらない |
| `no-restricted-imports`（素材層の直 import 禁止） | 🟥 **なし** |
| `tailwindcss/no-arbitrary-value` | 🟦 有り（`files` を絞っていないため） |

### 2. 原因は「ディレクトリ名で射程を指定している」こと

手3 の設定は `files: ['src/components/**', 'src/app/**']` と書いていた。
③ 層のディレクトリは**手3 の時点で存在しなかった**ので、射程に入れようがなかった。

**これは設定ミスではなく、ディレクトリ単位で効かせる規約の構造的な性質。**
`tailwindcss/no-arbitrary-value` が漏れなかったのは、**`files` を絞っていないから**。

### 3. 「対象 0 件で緑」の 5 例目

| # | 事例 | 手 |
|---|---|---|
| 1 | lint が対象 0 件で緑（PoC の前例） | — |
| 2 | `.storybook/**` がどのゲートの射程にも入っていなかった（[DR-0025](DR-0025-storybook-init-is-not-selectable.md)） | 手2b |
| 3 | Tailwind が `docs/**.md` を走査していた（[DR-0021](DR-0021-tailwind-scans-docs-markdown.md)・逆方向の漏れ） | 手2 |
| 4 | `--spacing: initial` で余白が全部消えてもビルドは緑（[DR-0028](DR-0028-token-frame-is-not-closed.md)） | 手3 |
| **5** | **③ 層が lint の射程外**（本 DR） | **手4** |

## 根拠（実測）

2026-07-26。`src/patterns/_probe/` `src/templates/_probe/` `src/lib/fixtures/_probe/` に
プローブを置いて `eslint` と `--print-config` を実行。

- lint: **exit 0・出力なし**（typecheck / format / spell は 3 ディレクトリとも検出した）
- `files` に ③ 層を足して再テスト → **3 ルールとも発火**（import 制限 1・パレット色 1・数値の段 1）

## 影響

- 🟦 **H4-01 を H4-05 より前に置いた設計がそのまま効いた。**
  Pattern を書いた後に気づいていたら、**書いたコード全部を検査し直すことになっていた。**
- 🟥 **層を足すたびに `eslint.config.mjs` の `files` を更新する運用手順が要る。**
  忘れると「新しい層だけ枠の外」という抜け道ができ、[DR-0033](DR-0033-step5-criteria-differ-per-layer.md) が形骸化する。
  → **手順書テンプレートの「ゲートの射程を確かめる」ステップを、新ディレクトリを作る手すべてに置く**のが素直な対処。
  🟨 ただし**必要性はまだ 2 回目**（手2b・手4）。仕組み化するかは手9 で判断する（2 回ルール）。
- 🟨 **代案がある。**`files` を絞らず全体に張り、`ignores` で素材層だけ外す形なら漏れない。
  ただし `src/lib/**` や設定ファイルまで巻き込むので、**副作用の確認が要る**。手5 以降で検討する。

## 関連

- [実行記録.md](../実行記録.md) §手4
- 手順書: [手4](../手順/手4_PatternsTemplates層と一覧.md) §2 追記（D8）・§5 H4-01
