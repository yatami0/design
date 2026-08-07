---
id: DR-0072
type: decision
title: '依存パッケージの型は公開 API に素通ししない——Omit で選別し、自層の名前で出し直す'
status: decided
date: 2026-08-07
step: 手8c
related: [DR-0059, DR-0060, DR-0066, DR-0070]
poc_feedback: 'architecture.md の材料（packages/ui の公開 API 規則。未決 #29 の `.d.ts` 品質にも効く）'
---

# DR-0072: 依存パッケージの型は公開 API に素通ししない——Omit で選別し、自層の名前で出し直す

## 背景

`DataGrid.columns: ColumnDef<TData, TValue>[]` は TanStack の型の素通しで、`cell` の任意 JSX という**開けた覚えのない口**が一緒に公開された。手8 の 6 周で語彙表の外に出た逸脱（`tabular-nums` 等）は全部ここから出ている（[DR-0060](DR-0060-vocabulary-leaks-from-four-surfaces.md) 面③）。依存の型を再輸出するときの規則が無かった（手8c Q6）。

## 決定

- **依存パッケージの型を公開 API に素通ししない。**公開するときは (a) **Omit で口を選別**し (b) **自層の名前で出し直す**（例: `DataGridColumn`——TanStack は実装詳細へ戻す）
- **任意 JSX / 任意文字列の口が付いてくる型はとくに素通し禁止**——型と一緒に「枠の外」が公開される
- 例外: **コード所有モデル**（利用者がソースを編集できる shadcn 型の配布）なら素通しは成立する。我々の `/design-sync` は bundle 配布（パッケージ境界型）なので該当しない

## 根拠（実測）

- **我々の実測**: 6 周ぶんの生成物で、語彙表の外の逸脱（`tabular-nums` 2×4 周・`font-emphasis` 計 4・cell 内 `text-table` 等）は**全件 `columns[].cell` 経由**（[実行記録 §手8c](../実行記録.md) H8C-01）
- **パッケージ境界を保つ DS は全て選別か出し直しをしていた**（[二層構造の設計.md](../二層構造の設計.md) §5・全出典つき）: MUI は `export type { ClickAwayListenerProps } from '@mui/base/…'`（利用者に下層を import させない）／ Ark→Chakra は Zag の型を **Omit（`dir`/`getRootNode`）＋ prefix 改名**して 3 層貫通（`FocusChangeDetails as AccordionFocusChangeDetails`）／ Spectrum は `SpectrumButtonProps extends Omit<AriaButtonProps, 'onClick'>, StyleProps` ／ Primer ADR-005: "keeping the exported types close to what we author" ／ Polaris は再輸出しない
- **素通しをする shadcn はコード所有モデルとセット**——data-table は部品ですらなく「自分で組み立てるガイド」（"instead of a data-table component … a guide on how to build your own"）

## 影響

**観測から直接言えること**

- `DataGridColumn`（[製品層の部品設計.md](../製品層の部品設計.md) §3.2）はこの規則の最初の適用。`ColumnDef` は `.d.ts` から消える
- 受け手の lint 生成が `.d.ts` から `ColumnDef` を解決できず落としていた 5 件（未決 #29 の一部）は、**型が自前になれば消える方向**

**🟥 推論（未検証）**

- `accessor: (row) => ReactNode` は残るので「枠の外」が完全に閉じるわけではない。書式の語彙（numeric/emphasis/size）を対で与えれば className がそこを通らなくなる、は [DR-0063](DR-0063-forbidding-without-an-alternative-fails.md) からの類推。7 周目で測る

## 関連

- 手順書: [手8c_製品層に何を作るべきかの調査設計.md](../手順/手8c_製品層に何を作るべきかの調査設計.md)（Q6）
- 実測の記録: [実行記録.md](../実行記録.md) §手8c
- 🔺 **ADR 昇格候補**（公開 API の規約・外から見える。起案は判定と分ける）
