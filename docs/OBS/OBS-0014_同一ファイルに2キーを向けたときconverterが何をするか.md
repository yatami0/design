---
id: OBS-0014
type: question
title: 同一ファイルに 2 キーを向けたとき converter が何をするかは、まだ一度も走っていない
status: open
date: 2026-08-08
updated: 2026-08-08
step: '-'
tags: [design-sync, converter, shipping, zero-target]
related: [DR-0091, DR-0066, DR-0085, DR-0048]
promoted_to: null
---

# OBS-0014: 同一ファイルに 2 キーを向けたとき converter が何をするかは、まだ一度も走っていない

> 凡例：🟦 確定／根拠あり ・ 🟨 暫定／裁量 ・ 🟥 未確認・要本人確認

## 0. 一行サマリ【起票時必須】

工程3 は「**`FilterField` は `FilterBar.tsx` と同居する初めての 2 キー目**なので、converter がどう扱うか見る」と
`/design-sync` に観測を託した。2026-08-08 の同期で**答えは出なかった**——
`FilterField` に story が無いのでカードが作られず、**当該の分岐が一度も実行されていない。**
🟥 **「対象 0 件で緑」の型がまた 1 つ。**問いは丸ごと残っている。

## 1. きっかけ（何を見て・何に引っかかったか）【起票時必須】

工程3 完了時、handoff の「次にやること」に**次回同期の観測 3 点**が登録されていた。その 2 番目:

> ② **`FilterField`（`FilterBar.tsx` と同居する初めての 2 キー目）**を converter がどう扱うか

同期後（[PR #12](https://github.com/yatami0/design/pull/12) · `cfeaff5`）の結果は **31 → 36 部品**。
`.design-sync/NOTES.md` はこう書いている:

> `cfg.componentSrcMap` は 37 件だが `FilterField` に story が無いので**カードは 36 件**

つまり**同居しているキーは、カードの生成まで到達していない。**

## 2. 何が分かっていて、何が分かっていないか【起票時必須】

**🟦 分かっていること（実測）**

- `componentSrcMap` は 37 件で、**同一ファイルに 2 キーが向いているのは 1 組だけ**:
  `src/patterns/FilterBar.tsx` → `FilterBar` ／ `FilterField`
- `FilterField` 単独の story は**無い**（`src/stories/Patterns/FilterBar.stories.tsx` の title は `③ Patterns/FilterBar` のみ・
  story ファイルは Patterns 配下に 4 本で `FilterField.stories.tsx` は存在しない）
- 出来たカードは 36 件。追加された 5 件は `Breadcrumb` / `Tabs` / `PeriodSelect` / `FilterBar` / `PageHeader`
- **工程3 が足したコア部品は 6 件なので、カードになったのは 5/6。**落ちた 1 件が `FilterField`
- 同期そのものは健全（`ok: true` / 56 story すべて `match` / render check 36/36 clean）

**🟥 分かっていないこと**

- **両方に story がある状態で、converter は 2 枚のカードを作るのか、1 枚に畳むのか、どちらかを落とすのか**
- `.d.ts` は 2 枚出るのか（[手8e の実測](../実行記録.md)では「部品 1 件につき `.d.ts` 1 枚」で、
  **複合部品のパーツの props はどこにも出ない**ことが分かっている。`FilterField` は同じ形に落ちる可能性がある）
- `componentSrcMap` に書いただけのキーが**何の副作用も持たない**のか（今回は grade も削除も動かなかったが、
  「動かなかった」と「そもそも参照されない」の区別はしていない）

## 3. 知識の結びつき（何と何がつながったか）

🟥 **要確認（本人）。**Claude 側の仮説として、以下は同じ型に見える:

- [DR-0066](../DR/DR-0066-neither-side-lints-the-generated-output.md) の「対象 0 件で緑」——
  **装置は動いたが、当たる対象がいなかったので何も分からなかった**
- [DR-0048](../DR/DR-0048-build-storybook-does-not-render.md) の「`storybook build` は描画しない」——
  **緑が保証の範囲を超えて読まれる**

🟨 今回はさらに**予測の側の問題**でもある: 観測 ② は「converter がどう扱うか」と書いたが、
**その分岐に到達する条件（両方に story がある）を確かめずに登録していた。**
これは [DR-0076](../DR/DR-0076-capture-the-run-not-just-the-output.md) が言う
「予測を登録した時点で数え方が予測のコピーになる」の**手前**で起きた失敗——
**予測が実行されうるかを検算していなかった。**

## 4. どうするかの候補（決めない・並べるだけ）

| 案 | 中身 | コスト | 🟥 効かない場合 |
| --- | --- | --- | --- |
| A | **`FilterField` に story を足して次回同期で測る** | 小（story 1 本） | 「story を足す」こと自体が工場の判断（棚に何を並べるか）なので、**測るためだけに足すのは本末転倒**になりうる |
| B | **`componentSrcMap` から `FilterField` を外す** | 小 | 問いは消えるが、**将来 2 キー目が本当に要るときに同じ所で止まる** |
| C | **測らない**と決めて理由を書く | 0 | 🟨 現時点で `FilterField` は `FilterBar` の内側でしか使われず、**単独で出荷する需要が無い**（これが理由になる） |
| D | converter のコードを読んで**静的に**答えを出す | 中 | 🟥 [DR-0006](../DR/DR-0006-shadcn-base-radix-preset-nova.md) の教訓——**一次情報も実測で置き換える**規律に反する（読みだけで済ませない） |

🟨 **Claude の見立ては C**（需要が無いので測らない）**＋ 需要が出たら A**。
ただし [DR-0077](../DR/DR-0077-abolish-the-two-occurrence-rule.md) 以後、
**「まだやらない」は回数ではなく中身の理由で書く**必要があるので、
C を採るなら「`FilterField` は単独で出荷する需要が無い」を明記して閉じること。

## 5. 決着の条件

- **`FilterField`（または他の 2 キー目）を単独で出荷したい需要が出たとき**、A で測って DR へ昇格させる
- あるいは **C を採って `closed`** にする（理由を明記）
