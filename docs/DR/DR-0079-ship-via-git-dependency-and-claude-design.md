---
id: DR-0079
type: decision
title: '出荷口は git 依存 ＋ Claude Design の 2 経路 — /design-sync は工場の経路として回し続ける'
status: decided
date: 2026-08-07
step: 工程0
related: [DR-0078, DR-0065, DR-0075, DR-0057]
poc_feedback: null
---

# DR-0079: 出荷口は git 依存 ＋ Claude Design の 2 経路

## 背景

工場になった以上（[DR-0078](DR-0078-repo-becomes-a-ui-factory-for-a-core-design-system.md)）、
「他 repo がどうやってこの UI を使うか」を決める必要がある（[工場の段取り.md](../工場の段取り.md) 工程0 D4・未決 #2）。
ユーザーの指示は「**他のリポジトリでも使えるように Claude Design にデザイントークンとして残す**」。

## 決定

1. **出荷口は 2 経路。**
   - **コード**: git 依存（本 repo を直接参照）。**npm publish は当面しない**——使い回し先が 1 つ実際に出てから再判断する。
   - **デザイン生成**: **Claude Design プロジェクト**（部品 31 件・tmp-admin のトークン値が CSS に焼き込み済み）。
     他 repo・他プロジェクトのデザイン作業は、ここを参照デザインシステムとして使う。
2. **`/design-sync` は回し続ける**（未決 #2 の答え）。旧地図では「検証の装置」だったが、
   今後は**工場の出荷経路そのもの**。起動が人であることは変わらない。
3. トークンの届き方は現状の形を正とする——**語彙は `.d.ts`・conventions header・`.prompt.md` 経由、値は `_ds_bundle.css` に焼き込み**
   （`tokens/` ディレクトリは空のまま。[DR-0057](DR-0057-design-sync-uploads-compiled-code-not-just-html.md) 手6 Q3 の実測）。
   独立したトークンファイルの配布形式（DTCG 等）は、**コード側の使い回し先が要求してから**検討する。

## 根拠（実測）

- **Claude Design が出荷口として機能することは 7 周の実測済み**——登録部品を使い（[DR-0065](DR-0065-claude-design-uses-the-registered-components.md)）、
  `.prompt.md` を直接読む（[DR-0075](DR-0075-design-side-reads-the-design-system-directly.md)）。7 周目は宣言語彙の外に出たクラス 0 件。
- 同期経路の現状: 31 部品・render check 31/31 clean・採点 13 story 全件 match（[実行記録 §手8e](../実行記録.md)）。
- npm publish を先送りする根拠は需要の不在ではなく**検証手段の不在**——公開形式の正しさ（exports・型・CSS の同梱）を検証する消費者がまだいない。

## 影響

**観測から直接言えること**

1. Claude Design プロジェクト（`3acbb737-85fe-4098-95f4-c99070168ba1`）は使い捨てではなく**維持対象の資産**になる。部品・語彙を変えたら再同期が要る。
2. 工程1（Vite 化）の Q4「converter は移行後も通るか」が**出荷経路の維持条件**に格上げされる。

**🟥 推論（未検証）**

- git 依存でのコード使い回しは**一度も実測していない**（tsconfig / Tailwind v4 の `@source` / CSS の取り込み方が消費側でどう要るかは未知）。
  最初の使い回し先が出た時点で、そのセットアップ手順自体を工程として記録する。

## 関連

- 地図: [工場の段取り.md](../工場の段取り.md) 工程0 D4・未決 #2
- 実測の記録: [実行記録.md](../実行記録.md) §工程0
