---
id: DR-0007
type: decision
title: 'shadcn 出力は整形対象外にするが lint の赤は ignore しない'
status: decided
date: 2026-07-26
step: 手1
related: [DR-0003, DR-0010, DR-0014]
poc_feedback: null
---

# DR-0007: shadcn 出力は整形対象外にするが lint の赤は ignore しない

## 背景

`shadcn add` 後、機械ゲートが 2 種類の赤を出した。①prettier の整形と食い違う ②lint / typecheck が落ちる。この 2 つは性質が違うので扱いを分ける必要があった。

## 決定

1. **整形（prettier）: 対象外にする。**`.prettierignore` に `src/components/ui/` `src/hooks/` `src/lib/utils.ts` を追加する。
   - 整形すると「shadcn が吐いたそのもの」でなくなり、**手5 の「部品を触っていない」の証拠性が落ちる**
   - `shadcn add` / `update` のたびに全行 diff になる
   - ⚠ **編集禁止という意味ではない**（PoC の `src/generated/` とは性質が違う）。整形対象外というだけ
2. **lint / typecheck: 赤のまま記録して進む。ignore もルール緩和もしない。**
   - ignore すると **Q1・Q2 の答えが消え、手5 の判定が甘くなる**
   - **手1 の成果物は「緑の状態」ではなく「赤の内訳」**
3. 自分で書く部品（Layout プリミティブ等）は `src/components/` 直下に置き、整形対象に残す。

## 根拠（実測）

- `pnpm format:check` は決定1 の適用後に緑へ戻った。整形されたのは自分のファイル（`src/app/globals.css`・`src/app/layout.tsx`）のみ。
- `pnpm lint` は **33 件の赤のまま**、`pnpm typecheck` / `pnpm build` は **1 件の赤のまま**残してある（→ DR-0010・DR-0014）。
- 決定2 の判断軸は PoC の前例：「gate が無言で機能停止する」ことを避ける（`.gitignore` に生成物を入れると drift gate が常に緑になる、という S0-13 の議論と同型）。

## 影響

- 以降の手で `format:check` は信号として使えるが、`lint` / `typecheck` は**赤がベースライン**になる。新しい赤に気づくには**件数と内訳を毎回比較する**必要がある。
- 手3 で部品をラップ・修正した場合、赤の件数が動く。差分の説明を実行記録に書く。

## 関連

- [実行記録.md](../実行記録.md) §手1
