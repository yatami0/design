---
id: DR-0087
type: decision
title: '取得は題材の層だけが持ち、コアは題材を知らない — 規約ではなく lint 2 本で守る'
status: decided
date: 2026-08-07
step: 工程2
related: [DR-0078, DR-0081, DR-0066]
poc_feedback: '工場の規約: 「コア / 題材」の境界はディレクトリで引き、fetch 直書き禁止 + import 制限の 2 本で機械が守る'
---

# DR-0087: 取得は題材の層だけが持ち、コアは題材を知らない

## 背景

工程2 で MSW を入れるにあたり、**この repo に取得（fetch）が 1 件も無かった**ことが着手前の実測で分かった
（`src/**` の `fetch(` = 0 件）。部品 33 件はすべて props で受ける純表示で、
唯一のデータは手書きフィクスチャを story が直接 import していた。
→ **MSW を入れるとは「モックを足す」ことではなく、無かった層を新設すること**であり、
その層がコア（出荷物）か題材（Redmine 固有）かを決める必要が生じた。

## 決定

**取得は題材の層（`src/redmine/`）だけが持つ。コア（部品・Pattern・Template）はデータを props で受け取る。**

| | 置き場 | `src/index.ts` から出荷 | 中身 |
| --- | --- | --- | --- |
| コア | `src/components` `src/patterns` `src/templates` `src/styles` | 🟦 する | 語彙（`tone` 等）しか知らない |
| 題材 | `src/redmine` `src/mocks` | 🟥 **しない** | URL の形・`status.id → tone` の対応表・モック |

**そして、これを文書ではなく機械で守る**——[DR-0081](DR-0081-poc-feedback-redirected-to-factory-conventions.md)（`poc_feedback` は「工場の規約へ戻す候補」）の**最初の実例**として、
PoC が持っていて本 repo が落としていた 2 ルールを `eslint.config.mjs` へ戻した:

1. **`fetch` の直書き禁止**（`no-restricted-syntax`）。例外は `src/redmine/**` だけ
2. **コアから題材への import 禁止**（`no-restricted-imports`）。`@/redmine/*` `@/mocks/*` を
   `src/components` `src/patterns` `src/templates` から見えなくする

🟥 **落としていた理由は「本 repo に守る対象が存在しない」**と `eslint.config.mjs` の冒頭コメントに明記されていた。
工程2 で対象が生まれたので、条件が満たされた。

## 検討した選択肢

| | 案 | 却下の理由 |
| --- | --- | --- |
| A | 部品に取得を持たせる | story が全部ネットワーク依存になり、**見た目の検証装置（Storybook）が壊れる**。素材層 diff 0 行を 6 回続けてきた形も崩れる |
| B | **題材の薄いクライアント ＋ 画面が呼ぶ**（採用） | — |
| C | コア側に汎用の取得 hook を作る | **時期尚早。**抽象化の材料が Redmine 1 種類しかない。🟥 理由は回数ではない（[DR-0077](DR-0077-abolish-the-two-occurrence-rule.md)）——**2 つ目の使い回し先が出るまで、何を共通化すべきか決まらない** |

## 根拠（実測）

- **赤テストで 2 ルールとも発火を確認した**（足して 0 件のまま緑なのが一番危ない）:
  `Button.tsx` に `fetch('/redmine/issues.json')` を 1 行 → `no-restricted-syntax` が赤 ／
  `EmptyState.tsx` に `import { getDb } from '@/mocks/db'` → `no-restricted-imports` が赤。
  **どちらも戻して緑に復帰**
- 🟦 **正の対照**: `src/redmine/client.ts` は `fetch` を 3 箇所書いているが**緑**（例外が効いている）
- ルール追加後のベースラインは **error 33 / warning 1 で内訳まで不変**（新しい赤ゼロ）

## 結果

- 実 API に繋ぐ日に書き換わるのは **① `REDMINE_BASE_URL` ② 認証ヘッダ ③ `convert.ts`** の 3 点だけ、
  という設計になった（工程2 Q3 の答えの形）。**検証は工程3 以降**——画面が snake_case を 1 度でも
  直接読んだら、この設計は破れている
- 🟨 **「Redmine 固有 / コア」の判定規則（[段取り 未決 #6](../工場の段取り.md)）は、まだ立てていない。**
  この決定は**ディレクトリ境界という暫定の線**であって規則ではない。
  ★ ただし規則の候補は 1 つ見えた——**コアは語彙（有限集合）を持ち、題材は対応表を持つ**
  （`StatusPill` は `tone` しか知らず、「status 5 番が完了」は題材側）。**工程3 で他の固有物に当てる。**

## 関連

- データモデル: docs/データモデル.md §5・§6
- 手順書: docs/手順/工程2_データの器_MSWとデータモデル.md §0 Q4・D4・D12
- 実測の記録: docs/実行記録.md §工程2
