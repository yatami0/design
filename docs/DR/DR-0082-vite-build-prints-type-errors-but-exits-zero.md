---
id: DR-0082
type: finding
title: 'vite build は型エラーを赤い字でログに出しながら exit 0 で通る — 型の網は tsc 1 本'
status: observed
date: 2026-08-07
step: 工程1
related: [DR-0080]
poc_feedback: '工場の規約: ゲート構成の条項（ビルドの緑を型の保証に数えない）'
---

# DR-0082: vite build は型エラーを赤い字でログに出しながら exit 0 で通る — 型の網は tsc 1 本

## 背景

工程1 で `next build` を `vite build`（lib モード・Vite 8/Rolldown ＋ vite-plugin-dts 5.0.3）に
置き換えるにあたり、新しい網の検査能力を赤テストで確定した（手順書 §0.1 の K1・K2）。

## 発見

- **K1（部品に型エラー 1 行）**: `next build` は **exit 1**・`tsc --noEmit` は **exit 2**。
  **`vite build` は exit 0**——ただし vite-plugin-dts が **`error TS2322` をログに赤く印字したうえで**、
  `dist/design.mjs` と `.d.ts` ツリーを最後まで出力した。
- **K2（実在しない import 1 行）**: `vite build` は **exit 1**（TS2882・dts の診断で停止）。
- つまり dts プラグインの診断は**「解決不能」では落ち、「型の不整合」では落ちない**。
- 「対象 0 件で緑」（16 例）は**ログの数字を読めば見抜けた**が、これは**ログに赤が印字されていても
  exit 0** という別種——**終了コードだけを見る CI・スクリプトは必ず騙される**。

## 根拠（実測）

- 検体: `src/components/Layout/Stack.tsx` 末尾に `const __k1_type_error: number = "not a number";`
- `./node_modules/.bin/vite build` → exit **0**、ログに
  `src/components/Layout/Stack.tsx:43:7 - error TS2322: Type 'string' is not assignable to type 'number'.`
- 同一検体で `./node_modules/.bin/tsc --noEmit` → exit **2**／`./node_modules/.bin/next build` → exit **1**
- 検体を戻して全網 exit 0（2026-08-07・実行記録 §工程1 P1-01/P1-03）

## 影響

**観測から直接言えること**

- 工程1 以降のゲート 6 本のうち、**型を止めるのは `tsc --noEmit` の 1 本だけ**。
  `pnpm build`（vite）の緑を型の保証に数えてはならない。
- 型エラーがあっても `dist/`（JS と `.d.ts`）は生成される——**ビルドが通った事実は出荷物の型の健全性を意味しない**。

**🟥 推論（未検証）**

- vite-plugin-dts に診断で fail させる設定が存在する可能性はある（今回、既定値の挙動だけを測った）。
  必要になったらオプションを実測してから導入する。

## 関連

- 手順書: docs/手順/工程1_NextからViteへの土台入れ替え.md §0.1
- 実測の記録: docs/実行記録.md §工程1
