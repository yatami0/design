---
id: DR-0074
type: finding
title: '規約から外れていたのは受け手だけではない。我々のコードが同じ逸脱を書いていた'
status: observed
date: 2026-08-07
step: 手8d
related: [DR-0060, DR-0063, DR-0066]
poc_feedback: 'ui.md の材料（規約の検査対象に自分のコードを含める）'
---

# DR-0074: 規約から外れていたのは受け手だけではない。我々のコードが同じ逸脱を書いていた

## 背景

手7・手8 の 6 周で数えた「逸脱」は、すべて **Claude Design が生成した側**の観測だった（[DR-0060](DR-0060-vocabulary-leaks-from-four-surfaces.md) の 4 面）。
手8c の設計はその 6 周を入力にして部品を決め、手8d でその設計を実装した。
**実装の副産物として、同じ逸脱が我々自身のコードにもあることが分かった。**

## 発見

- **面①（`SelectTrigger` の幅を `className` で書く）は、我々の story にもあった**——
  `src/stories/Selection/Select.stories.tsx` が **`<SelectTrigger className="w-48">`** を書いていた。
  **1 周目の生成物（r1）が書いた `w-48` と 1 文字も違わない。**
- **面③（一覧の書式クラス）は、我々の画面にもあった**——`src/app/page.tsx` の `columns[].cell` が
  `font-mono` と `font-mono tabular-nums` を書いていた。story 3 本も同様。
- 🟦 **どちらも「見つけに行った」のではなく、部品を閉じた瞬間に機械が見つけた。**
  `SelectTrigger` から `className` を Omit したら、**`tsc` が型エラー 1 件として出した**（実装後の初回 typecheck）。
- 🟥 **`w-48` は 4 種類の検査すべてを通り抜けていた**——ESLint（`w-48` は正当な Tailwind クラスで
  `no-arbitrary-value` の角括弧に当たらない・[DR-0028](DR-0028-token-frame-is-not-closed.md)）／ typecheck（当時は `className` が開いていた）/
  `storybook build` ／ 手7 で「語彙を足した」ときの棚卸し。

## 根拠（実測）

```
# 実装後の初回 typecheck（2026-08-07・手8d H8D-04）
src/stories/Selection/Select.stories.tsx(25,22): error TS2322:
  Property 'className' does not exist on type 'IntrinsicAttributes & SelectTriggerProps'.

# 書式クラス（手8d H8D-05 の書き換え前）
src/app/page.tsx:57   cell: (ctx) => <span className="font-mono">{ctx.row.original.id}</span>
src/app/page.tsx:74   <span className="font-mono tabular-nums">…</span>
src/stories/Patterns/ListDetail.stories.tsx / Templates/AppShell.stories.tsx  同型
```

- ベースラインの lint は **error 33 / warning 1** で、**そのすべてが素材層**（[handoff](../handoff.md)）。
  つまり **`w-48` は最後まで赤にならなかった。**
- 手7 は「語彙を足したら使われた」（[DR-0063](DR-0063-forbidding-without-an-alternative-fails.md)）で `--container-field-*` を新設し、
  **conventions header の実例も `w-field-md` に更新した**が、**我々の story は `w-48` のまま残った**。

## 影響

**観測から直接言えること**

- **規約の遵守を「受け手（生成 AI）の問題」として数えていた期間、同じ違反が自分の側にも存在した。**
  6 周の逸脱表は「向こう側の逸脱」だけを数えており、**こちら側は数えていなかった**。
- **型で閉じると、自分のコードの違反も同時に出る。**逃げ道を塞ぐ作業は、
  相手を縛る作業であると同時に**自分の棚卸しでもある**（今回は 4 箇所が自動で見つかった）。
- **語彙を足すだけでは既存の違反は消えない。**手7 で語彙と header の実例は更新されたが、
  **既存コードの書き換えは伴っていなかった**（＝「新しい書き方を教える」と「古い書き方を消す」は別作業）。

**🟥 推論（未検証）**

- 🟥 **`page.tsx` の書式クラスが 6 周の生成物に写っていた可能性がある。**
  design agent が読むのは `.d.ts` と `<Name>.prompt.md`（story 由来の実例）で、
  **`.prompt.md` は story から実例を引く**（手6）。**story が `w-48` を持っていた以上、
  「禁止されている書き方を、実例として渡していた」可能性がある。**
  🟨 **検証方法**: 7 周目の再同期後に `<Name>.prompt.md` を grep し、`w-48` / `font-mono` が
  実例として載っていたかを見る。載っていたなら、[DR-0063](DR-0063-forbidding-without-an-alternative-fails.md) の「語彙を足したら使われた」は
  **語彙の効果と実例の効果が混ざった観測**だったことになる。

## 関連

- 手順書: [docs/手順/手8d_製品層の部品実装.md](../手順/手8d_製品層の部品実装.md)
- 実測の記録: [docs/実行記録.md §手8d](../実行記録.md)
