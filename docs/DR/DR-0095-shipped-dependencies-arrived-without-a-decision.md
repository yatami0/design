---
id: DR-0095
type: finding
title: '出荷物の依存 2 件は、誰の判断でもなく入っていた — 規則は「足すとき」を見張るが、副産物で入る経路を見張らない'
status: observed
date: 2026-08-09
step: '-'
related: [DR-0092, DR-0085, DR-0078, DR-0093, DR-0072]
poc_feedback: '工場の規約: 依存の審査は「足す操作」ではなく `dependencies` の差分に掛ける。副産物で入った依存は、使われるまで誰にも見えない'
---

# DR-0095: 出荷物の依存 2 件は、誰の判断でもなく入っていた

## 背景

[DR-0092](DR-0092-the-core-holds-the-vessel-not-the-state.md)（2026-08-08・工程4）が一般則を立てた——

> **出荷物に依存を 1 件足すことは、使い回し先全部がその依存を取ること。器（依存 0）で済む形を先に探す。**

[部品3](../手順/部品3_DatePickerと射程の外の3件.md) は `DatePicker` を出荷する回で、
着手前実測として「この部品はどんな依存を増やすか」を数えた。**答えは 0 件だった**——
`react-day-picker` も `date-fns` も**既に `dependencies` に居た**。

## 発見

**その 2 件がいつ・誰の判断で入ったのかを引いたら、判断が存在しなかった。**

```
$ git log --oneline -S"react-day-picker" -- package.json
5a9abde 工程3 — 共通シェル。チケット一覧が新土台で動いた（#10）
```

- **工程3（2026-08-07）で `shadcn add calendar` を打った副産物**として入っている。
  工程3 の手順書 §2 にも実行記録にも、**この 2 件を出荷物の依存にする判断は 1 行も無い。**
- 🟥 **`calendar` 自身は出荷していない。**`src/index.ts` は
  「`calendar` は `PeriodSelect` の内部実装なので出さない」と**明示的に書いている**——
  つまり **「部品は出さない」と決めた一方で、その部品の依存は出荷物として払い続けていた。**
- **[DR-0092](DR-0092-the-core-holds-the-vessel-not-the-state.md) が立ったのはその翌日**（2026-08-08）。
  規則より前に入ったので、**規則が一度も当たっていない依存が出荷物に 2 件ある**状態だった。

★★★ **一般則は「足す判断をするとき」に掛かる形で書かれている。**
**しかし依存が増える経路は、判断を伴わない**——`shadcn add` は
`registryDependencies`（部品）と `dependencies`（npm パッケージ）を**同時に引く**。
**前者は目に見える**（ファイルが増える）が、**後者は `package.json` の 1 行**で、
**その部品を出荷しない限り誰も使わないので、実害が出るまで見えない。**

## 根拠（実測・2026-08-09）

| 問い | 実測 |
| --- | --- |
| 2 件の出自 | `5a9abde`（工程3・`shadcn add calendar` の副産物） |
| `dependencies` か `devDependencies` か | 🟥 **`dependencies`**（＝ 使い回し先が全部取る） |
| `calendar` は export されているか | 🟥 **されていない**（`src/index.ts` L89 に理由つきで明記） |
| 実際の利用箇所 | `react-day-picker` → `src/components/ui/calendar.tsx` の **1 箇所** ／ `date-fns` → **コア `PeriodSelect`** と**題材 `redmine/period.ts`** の 2 箇所 |
| レジストリの申告 | `calendar.json` の `dependencies` = `["react-day-picker@latest","date-fns"]`（実測・HTTP 200） |
| DR-0092 が立った日 | 2026-08-08（＝ **2 件が入った翌日**） |

🟨 **`date-fns` だけは「使われていた」**——`PeriodSelect` が `format` で日付を文字列にしている。
**つまり出荷物のコアは 2026-08-07 から date-fns に依存していた**が、それも記録が無い。

## 影響

**観測から直接言えること**

- **`dependencies` の差分は、出荷入口の 4 本**（[DR-0085](DR-0085-three-independent-scopes-decide-what-ships.md)・
  [DR-0091](DR-0091-claude-design-is-a-fourth-shipping-entrance.md)）**のどれからも見えない。**
  JS の到達可能性・`.d.ts` の `include`・`publicDir`・story の `title` は
  **どれも「何が出るか」を見ており、「何を引き連れて出るか」を見ていない。**
- **副産物で入った依存は「使われるまで安全に見える」**——`calendar` を出荷しなかった 2 日間、
  この 2 件は `dist` にも `.d.ts` にも現れず、**`package.json` の 2 行だけが濁っていた。**
- ★ **今回の `DatePicker` 出荷は「依存 0 増」だが、それは事実の半分**——
  **増えないのは既に払っているから**であって、**この部品が軽いからではない。**

**🟥 推論（未検証）**

- **同じ経路で入った依存が他にもあるかは数えていない。**`dependencies` 12 件のうち、
  `shadcn add` の副産物で入ったものが何件あるかは**この回では調べていない**（→ 次の回の観測項目）。
- **検査を置けば止まるかも未検証**——`dependencies` の増加を落とす検査は
  **赤テストの検体を作れる**（既存 12 件がある）が、本回では置いていない。

## 決着（この finding が要求したこと）

🟦 **[部品3 D4=A（ユーザー判断 2026-08-09「推奨で」）で追認した**——
**2 件は出荷物の依存として妥当**とする。理由は **器では済まないから**:
カレンダーの自作は**有限の語で言えない**（週の開始曜日・うるう年・月送り・
キーボード操作・ARIA grid）＝ [段取り §2](../工場の段取り.md) が「(b) 外部ライブラリ」に分類した側。

🟥 **ただし「気づいたら入っていた」を「決めた」に変えたのが本 DR の役割。**
**追認は結論であって、経路の穴が塞がったわけではない。**

## 関連

- 手順書: [docs/手順/部品3_DatePickerと射程の外の3件.md](../手順/部品3_DatePickerと射程の外の3件.md) §1.2 / D4
- [DR-0092](DR-0092-the-core-holds-the-vessel-not-the-state.md)（一般則の出どころ）
- [DR-0093](DR-0093-shadcn-radix-nova-is-not-a-single-primitive-source.md)（**同じ形の 1 例目**——`combobox` が `@base-ui/react` を裏口から引く）
- 実測の記録: [docs/実行記録.md](../実行記録.md) §部品3
