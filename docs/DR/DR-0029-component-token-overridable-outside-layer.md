---
id: DR-0029
type: finding
title: 'shadcn の component token は、部品を触らずカスケードレイヤの外から向け替えられる'
status: observed
date: 2026-07-26
step: 手3
related: [DR-0022, DR-0019, DR-0027]
poc_feedback: 'OBS-0003 の材料。テーマ 2 層構造（案B）に「レイヤ外からの上書き」という手が加わる'
---

# DR-0029: component token はレイヤの外から向け替えられる

## 背景

[DR-0022](DR-0022-shadcn-has-component-tokens.md) は `--card-spacing` を
「**Card だけは部品を触らずに semantic 層へ載る可能性がある唯一の接続点**」と記録し、手3 の未決 #12 に送った。
D8 を判断する前に、**そもそも可能なのか**を実測した。

## 発見

### 1. `--card-spacing` は部品の className の中で定義されている

`src/components/ui/card.tsx`:

```
[--card-spacing:--spacing(4)]                    ← ルート要素で定義
data-[size=sm]:[--card-spacing:--spacing(3)]     ← size=sm で切り替え
```

同ファイル内の **5 箇所**が参照する（`gap-` / `py-` / `px-` ×2 / `p-`）。
参照先は `--spacing(4)` ＝ **primitive を直接指しており、semantic 層を飛ばしている**。

### 2. レイヤの外に書けば勝つ

`src/app/tokens.css` の `@theme` の**外**に 1 規則足して再ビルドした。

```css
[data-slot='card'] { --card-spacing: var(--spacing-inset-lg); }
```

生成 CSS 内の位置を機械的に測った結果:

| 宣言 | 位置（文字目） | カスケードレイヤ |
|---|---|---|
| shadcn `[--card-spacing:--spacing(4)]` | 26,278 | 🟨 `@layer utilities` の内側（7,533〜61,371） |
| shadcn `data-[size=sm]` 版 | 43,640 | 🟨 同上 |
| **自前の `[data-slot=card]` 上書き** | **63,324** | 🟦 **レイヤの外** |

**レイヤに属さない宣言はレイヤ内の宣言に勝つ**ので、**`card.tsx` を 1 行も触らずに向け替えられる。**

### 3. 「唯一の接続点」ではなく「接続方式」だった

shadcn は**全部品に `data-slot="…"` を付けている**。したがって同じ手口は
`--sidebar-*`（8 変数）など **component token 全般に適用できる見込みがある**。

### 4. 🟨 副作用

上の 1 行は `data-[size=sm]` の 12px も潰す。**バリアントを保つには `[data-slot=card][data-size=sm]` を書き分ける**必要がある。

## 根拠（実測）

2026-07-26。`pnpm build-storybook` の出力 `storybook-static/assets/iframe-*.css` を Python で位置解析。

- `@layer utilities{` の開始 7,533 / 対応する閉じ括弧 61,371（括弧の深さを数えて特定）
- `--card-spacing:` の宣言は全部で 3 件。うち 2 件がレイヤ内（26,278 / 43,640）、1 件がレイヤ外（63,324）
- `grep -n 'card-spacing' src/components/ui/card.tsx` → 定義 1 + 参照 4 行（うち 1 行に 2 参照）
- 🟦 **プローブは撤去し `git status --short` が空であることを確認済み**

## 影響

- 🟦 **D8 は「できるか」ではなく「やるか」の判断になった。**技術的な障害は無い。
- 🟥 **手5 の観測点が広がる。**[DR-0027](DR-0027-token-swap-not-detectable-by-css-diff.md) が確定させた 3 段判定
  （静的分類 → 実効値計算 → 目視）に、**「レイヤ外から向け替えれば追従させられる箇所」という第 4 の分類が要る**。
  [トークンマッピング §5](../トークンマッピング.md) が「🟥 部品を触らないと解けない **7 件**」とした中に、
  **本方式で解けるものが混ざっている可能性がある**（要再点検）。
- 🟨 **ただし万能ではない。**値が CSS 変数になっていないもの（`h-8` のようなユーティリティ直書き、
  `--sidebar-width` の TS 定数、`next/font` 供給の `--font-sans`）には効かない。**効くのは「変数になっているが参照先が違う」ものだけ。**

## 関連

- [デザイントークン設計.md](../デザイントークン設計.md) §3
- 手順書: [手3](../手順/手3_Components層と製品層の分離.md) §2 D8・§5 H3-08
