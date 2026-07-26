---
id: DR-0042
type: finding
title: 'レイヤ外からの上書きは変数だけでなくプロパティにも効く — DR-0029 が狭く書きすぎていた'
status: observed
date: 2026-07-26
step: 手5
related: [DR-0029, DR-0036, DR-0041]
poc_feedback: '🟥 OBS-0003 の材料を訂正する。テーマ 2 層構造（案B）の「レイヤ外からの上書き」は任意値にも届く'
---

# DR-0042: レイヤ外の上書きはプロパティにも届く（DR-0029 §4 の射程訂正）

## 背景

[DR-0029](DR-0029-component-token-overridable-outside-layer.md) は `--card-spacing` を題材に
「カスケードレイヤの外に書けば `@layer utilities` の中の宣言に勝つ」ことを実測した。
ただし §4 に **「効くのは『変数になっているが参照先が違う』ものだけ」** と書いている。

未決 #18 を解くにあたり、この但し書きが正しいなら**生値 8 件（[DR-0010](DR-0010-shadcn-invents-values.md) の (C)）は全部手が出ない**ことになる。
但し書きの根拠が書かれていなかったので、確かめた。

## 発見

**但し書きは成り立たない。カスケードレイヤの順序はプロパティの種類を区別しない。**

`src/app/tokens.css` の `@theme` の外に 1 規則足して再ビルドした。

```css
[data-slot='checkbox'] { border-radius: var(--radius-2xl); }
```

| 宣言 | 位置（文字目） | レイヤ内か |
|---|---|---|
| `@layer utilities{` の範囲 | 8,300 〜 63,607 | — |
| shadcn `.rounded-\[4px\]{border-radius:4px}` | 15,718 | 🟨 **内側** |
| 自前 `[data-slot=checkbox]{border-radius:var(--radius-2xl)}` | **65,670** | 🟦 **外側** |

**レイヤに属さない宣言はレイヤ内の宣言に勝つ**という規則は CSS の一般規則であって、
カスタムプロパティ限定ではない。**`rounded-[4px]` のような任意値にも届く。**

### 🟥 ただし「向け替え」と「上書き」は別物

DR-0029 が `--card-spacing` でやったことと、本件でやったことは**効き方が違う**。

| | 変数の向け替え（DR-0029） | プロパティの上書き（本件） |
|---|---|---|
| 何をするか | 部品が既に持つ継ぎ目の**参照先を変える** | 部品に継ぎ目が無いので**外が値を持つ** |
| 部品側の変異 | 🟦 **保たれる**（`data-[size=sm]` は別変数として残る） | 🟥 **潰れる**（`focus-visible:` / `data-[size=sm]` を平坦化する） |
| その後の追従 | 🟦 自動（参照先を差し替えれば動く） | 🟨 追従はするが、**外が shadcn の内部構造を知り続ける**必要がある |
| 壊れ方 | shadcn が変数名を変えたら**効かなくなる**（気づける） | shadcn が variant を足したら**黙って潰す**（気づけない） |

DR-0029 §4 の副作用（`[data-slot=card]` 1 規則が `data-[size=sm]` の 12px も潰す）は、
**変数向け替えの副作用ではなく、上書きの一般的性質**だった。

## 根拠（実測）

2026-07-26。

1. `src/app/tokens.css` の末尾（`@theme` の外）に上記 1 規則を追記
2. `pnpm build-storybook`（exit 0）
3. `storybook-static/assets/iframe-*.css`（ハッシュ付き 1 本）を Python で位置解析。
   `@layer utilities{` の開始から括弧の深さを数えて閉じ位置を特定し、両宣言の出現位置と比較
4. 🟦 **プローブは `git checkout src/app/tokens.css` で撤去し、`storybook-static` も削除。
   `git status --porcelain` が空であることを確認済み**

## 影響

- 🟥 **[DR-0029](DR-0029-component-token-overridable-outside-layer.md) §4 の但し書きを訂正する。**
  「効くのは変数になっているものだけ」は誤り。**任意値にも届く。**
  （DR-0029 の本文は書き換えない。決定は不変に積む＝[DR-0004](DR-0004-document-system-and-git.md)）
- 🟦 **未決 #18 で「部品を触らないと解けない」に入っていた 影・スクリムに手が届く。**
  `[data-slot='dialog-overlay']` は data-slot を持つ（実測）ので、レイヤ外から `box-shadow` / `background-color` を持てる。
  → [DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md)
- 🟥 **「届く」と「やるべき」は別。**上表のとおり上書きは変異を潰し、shadcn の内部構造への依存を増やす。
  **どこまで上書きで解くかは手5 の判断ポイント**（手順書 §2）であって、本 DR は可否だけを言う。
- 🟨 **手3 で決めた枠（[DR-0032](DR-0032-layout-primitives-take-props-not-classname.md)）に穴が開く可能性。**
  レイヤ外 CSS は lint の `no-restricted-syntax` 8 セレクタ（className / cva / cn を見る）の**射程外**。
  `tokens.css` に生値を書いても止まらない。→ 手5 で赤テストして確かめる。

## 関連

- [DR-0029](DR-0029-component-token-overridable-outside-layer.md) — 本 DR が射程を訂正する
- [デザイントークン設計.md](../デザイントークン設計.md) §3
