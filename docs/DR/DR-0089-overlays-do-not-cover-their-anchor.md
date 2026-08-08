---
id: DR-0089
type: decision
title: 'オーバーレイはアンカーに重ねない — 位置決めは prop ではなく工場の既定'
status: decided
date: 2026-08-08
step: '-'
related: [DR-0090, DR-0070, DR-0088, DR-0074]
poc_feedback: '工場の規約: オーバーレイの位置決めは部品が持ち、画面に選択肢を出さない'
---

# DR-0089: オーバーレイはアンカーに重ねない

## 背景

ユーザーが「Select のボタンと開くリストの大きさが揃わない」と指摘した。
調べると原因は幅ではなく**重なり**だった——上流（shadcn）の `SelectContent` は
`position="item-aligned"` を既定にしており（[select.tsx L63](../../src/components/ui/select.tsx)）、
これは**ネイティブ `<select>` の再現**で、選択中の項目がトリガの上に重なる位置に開く。

ユーザーの判断（2026-08-08）: **「ドロップダウンはボタンと被らないのが自然。
出てくるリストはボタンと揃えなくてもいい、でも上か下に出して被らないようにしたい」**。

## 決定

**オーバーレイ（ドロップダウン等）は、アンカーとなるコントロールに重ねない。**

1. **`position` は `popper` に固定する。**`item-aligned` は採らない。
2. **`align` は `start` に固定する。**上流既定の `center` は popper では左へはみ出す（下記実測）。
3. 🟥 **prop にしない。**これは工場の規定であって画面ごとの選択ではないので、
   製品層 `SelectContent` で `position` / `align` を**型から消す**
   （[Select.tsx](../../src/components/Selection/Select.tsx)。`SelectTrigger` から `className` を消したのと同じ手）。
4. **幅を揃える prop は作らない。**popper にすると上流の
   `min-w-(--radix-select-trigger-width)` が効き、**トリガ幅を下限に中身で伸びる**——
   ユーザーの要求（「揃えなくていい、でもボタンより大きくなる」）を既定が満たす。
   → [DR-0088](DR-0088-core-subject-boundary-is-decided-by-two-questions.md) の問い②に対し、
   **語彙を作らずに済んだ**ケース。
5. 🟥 **素材層は 1 行も触らない**（`src/components/ui/select.tsx` の diff 0 行を維持）。

## 根拠（実測）

Playwright（viewport 1280×800・トリガは `width="md"`）。
🟨 **検体 story と計測器は使い捨てにした**——`position` / `align` を渡す story は本決定で型から消したので、
同じ形では再実行できない。数値は下表と[実行記録](../実行記録.md)に転記した:

| 検体 | 重なり | 左端のずれ | リスト幅 | リスト高 |
|---|---|---|---|---|
| `item-aligned` + `center`（上流既定） | 🟥 **縦 30px** | +5px | 187px | 112px |
| `popper` + `start`（本決定） | 🟦 **0** | 🟦 **0px** | 192px | 112px |
| `popper` + `center` | 0 | −6px ※ | 192px | 112px |
| `popper` + 項目 24 件 | 0 | 0px | 192px | 672px（`max-height` 742px でスクロール） |

トリガの高さは 32px なので、**上流既定はトリガの 30/32 を隠していた**。
※ `center` の −6px は [DR-0090](DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md) を塞ぐ前の値
（トリガ 106.64px・リスト 144px のとき）。塞いだ後は両者 192px で一致するため差が消える。
**幅が偶然一致すると `align` の誤りが見えなくなる**ので、検体としては塞ぐ前の値を残す。

**🟦 予告した地雷は不発だった。**素材層は popper のとき Viewport に
`h-(--radix-select-trigger-height)` を当てる（[select.tsx L81](../../src/components/ui/select.tsx)）。
字面どおりならリスト高がトリガと同じ 32px に固定されるが、**実測では効いていない**——
Radix が Viewport に inline で `flex: 1 1 0%` を当てており、
**flex アイテムの主軸サイズは flex-basis が決めるので `height` が無効化される**
（実測: `viewportComputed = { display: block, height: 112px, flexBasis: 0%, flexGrow: 1 }`、
親 Content は `display: flex / flex-direction: column`。規則自体は存在する＝ `hasHeightRule: true`）。

## 影響

**観測から直接言えること**

- 製品層経由で `SelectContent` を使う 3 箇所——[IssueList.tsx L161](../../src/redmine/screens/IssueList.tsx)、
  [PeriodSelect.tsx L91](../../src/components/Selection/PeriodSelect.tsx)、
  `FilterBar.stories.tsx` 3 箇所——は**呼び出し側を 1 文字も変えずに**新しい既定を受け取る
- `align="center"` は item-aligned では無視されるため、**上流既定として書かれてから一度も作用していなかった**
  （popper に切り替えた瞬間に初めて効く設定だった）
- 素材層に「実在するが恒久的に無効な CSS 規則」が 1 本ある（上記 `h-`）

**🟥 推論（未検証）**

- 同じ規定は `DropdownMenu` / `Popover` / `Tooltip` にも掛かるはずだが、**これらは測っていない。**
  Radix の他部品は既定が popper 相当なので**既に満たしている可能性が高い**が、確認していない
- 「重ねない」を**規約文書に書くべき語**かどうかは判断していない（段取り 未決 #7・規約の起草時機）

## 関連

- 実測の記録: [docs/実行記録.md](../実行記録.md) §Select の位置決めと語彙クラス
- 併走する発見: [DR-0090](DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md)
