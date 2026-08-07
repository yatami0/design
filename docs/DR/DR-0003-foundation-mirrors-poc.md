---
id: DR-0003
type: decision
title: '土台は PoC と同一版・同一 lint の単体 Next.js アプリ（monorepo にしない）'
status: superseded
date: 2026-07-26
step: 手0
related: [DR-0016, DR-0009, DR-0080]
poc_feedback: null
---

# DR-0003: 土台は PoC と同一版・同一 lint の単体 Next.js アプリ（monorepo にしない）

## 背景

「移送可能なコード」（DR-0001）を作る以上、環境が PoC と違うと**「移送できたか」の判定が信用できない**。一方で monorepo をそのまま再現するのは重い。

## 決定

1. **単体の Next.js アプリ**（monorepo にしない）。`src/` が PoC の `apps/redmine/src/` と 1:1 で対応する形にして、移送の写像を明快に保つ。
2. **依存は PoC の catalog と同一値で厳密ピン**（`^` なし。PoC の ADR-0012 に倣う）。
3. **ESLint は PoC の `base.js` + `next.js` を 1 ファイルへ統合**する。ただし本 repo に守る対象が存在しないルールは落とす。
   - 写す: `strictTypeChecked` / non-negotiable-async 4 件 / 設定ファイルの `disableTypeChecked` override / react-hooks / **`tailwindcss/no-arbitrary-value`** / Server Actions 禁止
   - 落とす: fetch 直書き禁止（mutator も生成 hooks も無い）／`no-restricted-imports`（`redmine-api` も `lib/api` も無い）
4. **shadcn が置く `src/components/ui/**` は lint の ignore に入れない。**生成物ではなく編集する実体コードであり、ignore すると手1 の観測（Q1・Q2）ができなくなる。
5. `tsconfig.json` に `paths: { "@/*": ["./src/*"] }` を追加する（shadcn が要求）。

## 根拠（実測）

- ピンした版: next 16.2.10 / react 19.2.7 / typescript 6.0.3 / tailwindcss 4.3.3 / eslint 10.7.0 / typescript-eslint 8.64.0 / eslint-plugin-tailwindcss 4.2.0 / prettier 3.9.5 / cspell 10.0.1（実行環境 node 24.18.0・pnpm 10.28.1）。
- **緑を信用せず赤テストで gate の発火を確認した**（PoC で「配線前は `pnpm lint` が対象 0 件で成功していた＝何も検査していなかった」事故があったため）:
  - `className="bg-[#ff0000] p-[13px]"` → `no-arbitrary-value` が **2 件検出**（色と余白の両方）
  - 未 await の Promise → `no-floating-promises` が **1 件検出**（型情報つき lint の配線も生きている）
- 手0 完了時、`typecheck` / `lint` / `build` / `format:check` / `spell` すべて緑。

## 影響

- 🟥 決定3 の帰結として、**本 repo で lint が緑でも PoC で緑とは限らない。**移送後に PoC 側で再走が要る（手9）。
- 🟥 決定5 は PoC との差分。PoC の `apps/redmine/tsconfig.json` には `paths` エイリアスが無いため、PoC 側に足すか相対パスへ書き換えるかを手9 で決める。
- `next.config.ts` から `output: 'standalone'` と `outputFileTracingRoot` を落とした（monorepo でのコンテナ配布用のため）。移送先では PoC 側の設定が正。

## 関連

- [実行記録.md](../実行記録.md) §手0
