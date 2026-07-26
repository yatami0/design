---
id: DR-0036
type: decision
title: '`--card-spacing` を semantic 層へ向け替える — レイヤ外の 2 規則でバリアントごと保つ'
status: decided
date: 2026-07-26
step: 手3
related: [DR-0029, DR-0022, DR-0019, DR-0027]
poc_feedback: 'OBS-0003 の材料。案B（@theme inline + data-theme）に「レイヤ外からの上書き」を足せる'
---

# DR-0036: `--card-spacing` を semantic へ向け替える（手3 D8）

## 背景

[DR-0022](DR-0022-shadcn-has-component-tokens.md) は `--card-spacing` を
「**部品を触らずに semantic 層へ載る可能性がある唯一の接続点**」として手3 の未決 #12 に送った。
[DR-0029](DR-0029-component-token-overridable-outside-layer.md) で**技術的に可能であることが実測で確定した**ため、
残るのは「やるか」の判断だけだった。

## 決定

**A（向け替える）を採る。**バリアントを保つため **2 規則**書く。

```css
/* src/app/tokens.css の @theme の外 */
[data-slot='card'] {
  --card-spacing: var(--spacing-inset-md);
}
[data-slot='card'][data-size='sm'] {
  --card-spacing: var(--spacing-inset-sm);
}
```

- 🟥 **`src/components/ui/card.tsx` は 1 行も触らない。**
- 🟨 **手3 では Card 1 件に留める。**同じ手口を `--sidebar-*` に広げるかは**手5 で判断する**（未決 #18 と同時）。

## 根拠（実測）

2026-07-26。

### 1. 向け替えは成立する

`tokens.css` の `@theme` の外に 1 規則足して `pnpm build-storybook` し、生成 CSS 内の位置を測った:

| 宣言 | 位置 | カスケードレイヤ |
|---|---|---|
| shadcn `[--card-spacing:--spacing(4)]` | 26,278 | 🟨 `@layer utilities` の内側（7,533〜61,371） |
| shadcn `data-[size=sm]` 版 | 43,640 | 🟨 同上 |
| 自前の `[data-slot=card]` 上書き | **63,324** | 🟦 **レイヤの外** |

**レイヤに属さない宣言はレイヤ内の宣言に勝つ**ので、部品を触らずに向け替えられる。

### 2. 1 規則だけだとバリアントが潰れる

`data-[size=sm]` の 12px も上書きされてしまうことを実測で確認したため、**2 規則に分けた。**

### 3. やらない理由が無い

- コストは CSS 2 行。
- 素材層を触らないので [DR-0033](DR-0033-step5-criteria-differ-per-layer.md) の判定基準を壊さない。
- 🟥 **現状の参照方向は `--card-spacing → --spacing(4)` ＝ primitive を直接指しており、semantic を飛ばしている。**
  Material Design 3 の規約（component は system を指し reference を直接指さない）に照らして**参照方向として誤っている。**

## 影響

- 🟦 **未決 #12 が閉じた。**
- 🟦 **3 層トークンの「参照は下向き一方通行」が成立する最初の 1 件になる。**
  1 件も作らずに手5 へ行くと「どこも変わらなかった」で終わる可能性が高かった。
- 🟨 **Q7 の答えが手3 で先に出る。**手順書 §0 Q7（Card の見た目は実際に変わるか）は、
  この決定の実行（H3-08）そのもので観測される。

## 関連

- [デザイントークン設計.md](../デザイントークン設計.md) §3
- 手順書: [手3](../手順/手3_Components層と製品層の分離.md) §2 D8・§2.6-D8・§5 H3-08
