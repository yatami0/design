---
id: DR-0093
type: finding
title: 'shadcn の radix-nova style は radix 1 本ではない — `combobox` は `@base-ui/react` を引き、2 つ目の素材源が裏口から入る'
status: observed
date: 2026-08-09
step: '-'
related: [DR-0085, DR-0092, DR-0010, DR-0078]
poc_feedback: '工場の規約: レジストリの `dependencies` を引く前に読む（style 名は素材源を保証しない）'
---

# DR-0093: shadcn の `radix-nova` style は radix 1 本ではない

## 背景

[部品2](../手順/部品2_9カテゴリの充足.md) の着手前実測で、役割 9 カテゴリの欠落を埋めるために
shadcn レジストリを **18 件**引いた。目的は「どれが依存 0 で入るか」を数えることだったが、
**素材源そのものが 1 本ではない**ことが副産物として出た。

[工場の段取り](../工場の段取り.md) §2 は「**shadcn 以来 2 つ目の素材源を入れる判断**」を
**工程6 の重い判断**として置いている。その前提が崩れる。

## 発見

- `components.json` の `style` は **`radix-nova`** で、名前は radix 由来を示唆する。
- しかし **`combobox` の `dependencies` は `["@base-ui/react"]`** ——
  radix と**同格の primitive 源**を引く。`registryDependencies` は `button` / `input-group`。
- **`style` 名は素材源を保証しない。**「radix-nova を選んだから素材源は radix 1 本」は偽。
- 🟦 **在庫の 24 件（＋ 本回の 5 件）には混入していない**——`package.json` に `@base-ui/*` は 0 件。
- 🟥 **入るときは静かに入る。**`shadcn add combobox` は依存を 1 件足すだけで、
  「2 つ目の primitive 源を入れた」とはどこにも表示されない。

## 根拠（実測）

`https://ui.shadcn.com/r/styles/radix-nova/<name>.json` を 18 件取得（2026-08-09）。

| 部品 | `dependencies` |
| --- | --- |
| `radio-group` / `switch` / `slider` / `progress` / `avatar` | `[]` |
| `spinner` / `kbd` / `native-select` / `toggle` / `toggle-group` / `button-group` / `item` / `input-group` | `[]` |
| 🟥 **`combobox`** | 🟥 **`["@base-ui/react"]`** |
| `sonner` | `["sonner","next-themes"]` |
| `chart` | `["recharts@3.8.0"]` |
| `date-picker` / `typography` | — **HTTP 404**（単体では存在しない） |

導入後の確認: `package.json` の `dependencies` は **12 件のまま**、`@base-ui/*` は **0 件**。

## 影響

**観測から直接言えること**

- **段取りが工程6 に置いた「2 つ目の素材源を入れる判断」は、`combobox` を足すだけで前倒しに発生する。**
  判断の重さと、それを引き起こす操作の軽さが釣り合っていない。
- [DR-0085](DR-0085-three-independent-scopes-decide-what-ships.md)（出荷を決める射程は 3 本ある）と同型の
  「**裏口**」——**意図した入口の外に、同じ結果を生む経路がある。**
- 本回で入れた 5 件（`radio-group` / `switch` / `slider` / `progress` / `avatar`）は
  **どれも `@base-ui/react` を引かない**ので、この発見に実害は出ていない。

**🟥 推論（未検証）**

- `radix-nova` 以外の style でも同じことが起きている可能性がある（他 style は引いていない）。
- 「レジストリを引いてから `add` する」を機械で強制しないと、次に誰かが `combobox` を
  足した日に静かに入る。**機械で守るかは [部品2 D2](../手順/部品2_9カテゴリの充足.md) の宿題として残っている**
  （本回では検査を置いていない——`@base-ui/*` が 0 件のうちは「対象 0 件で緑」になるため、
  **発火を確かめられる検体が無い**）。

## 関連

- 手順書: [docs/手順/部品2_9カテゴリの充足.md](../手順/部品2_9カテゴリの充足.md) §1.1・D2
- 実測の記録: [docs/実行記録.md](../実行記録.md) §部品2
