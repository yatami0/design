---
id: DR-0045
type: finding
title: '不透明度修飾 58 箇所が事前特定から丸ごと漏れていた — lint の赤を出発点にしたため'
status: observed
date: 2026-07-26
step: 手5
related: [DR-0043, DR-0010, DR-0011, DR-0028, DR-0044]
poc_feedback: '🟥 OBS 候補。PoC の任意値禁止 lint も `/NN` を見ない。「定義した値しか使わせない」枠の穴が 1 つ増える'
---

# DR-0045: 不透明度修飾 58 箇所は lint にも事前特定にも映っていなかった（H5-03 / Q3 の答え）

## 背景

[DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md) は「手5 で変わらない箇所」を **16 行**に整理し、
手5 の Q3 を「**この 16 行に無い場所で追従しないものが出るか**」と定義した。

H5-03（第 0 段）で、**素材層が使うデザイン値ユーティリティを全件棚卸し**して突き合わせた。

## 発見

### 1. 🟥 Q3 の答えは **yes**。58 箇所が漏れていた

素材層 18 部品が使うデザイン値ユーティリティのうち、**トークン差し替えで完全には追従しないもの**は
**ユニーク 38 種 / 延べ 85 箇所**。4 つに割れる。

| 分類 | 種 | 箇所 | DR-0043 に載っていたか |
| --- | --- | --- | --- |
| 🟥 **純粋な生値**（`ring-[3px]` `rounded-[4px]` ほか） | 8 | 8 | ✅ 載っていた（[DR-0010](DR-0010-shadcn-invents-values.md) の (C)） |
| 🟦 **任意値だが `var()` を含む**（`rounded-[min(var(--radius-md),10px)]` ほか） | 9 | 12 | ✅ 載っていた（DR-0010 の (A)(B)） |
| ⬜ **分数**（`left-1/2` `top-1/2` `w-3/4`） | 4 | 5 | ⬜ 構造。[DR-0011](DR-0011-lint-rule-overdetects.md) の (D) |
| 🟨 **不透明度修飾**（`bg-destructive/10` ほか） | **17** | **60** | 🟥 **`bg-black/10` の 2 箇所しか載っていない。残る 58 箇所は完全に不可視だった** |

### 2. 🟨 不透明度修飾は「追従はするが、狙った値にはならない」

```
.bg-destructive\/10{background-color:color-mix(in oklab, var(--destructive) 10%, transparent)}
```

**色は `var(--destructive)` を追う。不透明度 10% はクラス名側にあって焼き込まれる。**

これは甲（動く）でも丙（動かない）でもない**第 5 の状態**。

| | 甲 | 乙 | 丙 | 🆕 **丁** |
| --- | --- | --- | --- | --- |
| 追従するか | 🟦 する | 🟨 接続すればする | 🟥 しない | 🟨 **色だけする** |
| 狙った値になるか | 🟦 なる | 🟨 なる | 🟥 ならない | 🟥 **ならない** |

🟥 **機構そのものが食い違っている。**
shadcn は状態面を「**semantic 色 + 不透明度**」で作る（`destructive/10` `destructive/20` `destructive/30` の 3 段）。
tmp-admin V4 は「**専用の tint 色**」で作る（`--fill-danger` / `--fill-warning` / `--fill-success` / `--fill-neutral`）。
**`bg-destructive/10` を `--fill-danger` へ向ける経路が無い**——不透明度がクラス名に埋まっているため。

### 3. 🟥 なぜ漏れたか — **出発点が lint の赤だった**

[DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md) の 16 行は、
[DR-0010](DR-0010-shadcn-invents-values.md) が数えた**任意値 24 件（＝`pnpm lint` の赤）**を出発点にしている。

**`bg-destructive/10` は任意値ではない**（角括弧を含まない正当な Tailwind クラス）ので、
**`no-arbitrary-value` は赤くしない。したがって視界に入らなかった。**

🟥 **これは [DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md) が指摘した誤りの裏返し。**
あちらは「lint が赤くしたものを、そのままトークンで解くべきものとして数えた」（**過剰**）。
こちらは「lint が赤くしなかったものを、数えなかった」（**過少**）。
**根は同じ——出発点に lint を使った。lint の赤は「トークン化されていない値」の集合ではない。**

これは [DR-0028](DR-0028-token-frame-is-not-closed.md)（`p-13` / `w-99` は素通りする）が
「枠になっていない」と言ったことの**別の面**。`/NN` も素通りする。

### 4. 🟦 事前特定の**方法**そのものは正しかった（検算に成功した）

今回の棚卸しは **クラス名の形**（角括弧 / スラッシュ / 分数）で分類する別手法で行った。
その結果、**純粋な生値 8 種が DR-0010 の (C) 8 件と完全に一致した。**

| DR-0010 (C) | H5-03 の再導出 |
| --- | --- |
| `badge.tsx` `ring-[3px]` / `button.tsx` `text-[0.8rem]` / `checkbox.tsx` `rounded-[4px]` / `dialog.tsx` `max-w-[calc(100%-2rem)]` / `dropdown-menu.tsx` `min-w-[96px]` / `sidebar.tsx` `w-[2px]` / `tooltip.tsx` `translate-y-[…]`・`rounded-[2px]` | **同一の 8 件**（別手法・独立に導出） |

🟦 **穴は方法ではなく、分類の語彙にあった。**「不透明度修飾」という箱を持っていなかった。

## 根拠（実測）

2026-07-26。`git status --porcelain` が空の状態から実施。

- **棚卸し**: `src/components/ui/*.tsx` の全文字列リテラルからクラスを抽出し、
  variant 接頭辞（`hover:` `data-[…]:` `[&>svg]:` ほか。**`[ ]` の外の `:` だけを区切りとみなす**）を除去して分類。
  デザイン値を運ぶ接頭辞（`bg-` `text-` `rounded-` `shadow-` `p-` `ring-` ほか）に絞った。
  スクリプトはスクラッチパッドに置き、リポジトリには入れていない
- **生成 CSS の確認**（`storybook-static/assets/iframe-*.css`）:

  ```
  .bg-destructive\/10{background-color:var(--destructive)}                                   ← フォールバック
  .bg-destructive\/10{background-color:color-mix(in oklab, var(--destructive) 10%, transparent)}
  .bg-muted\/50{background-color:color-mix(in oklab, var(--muted) 50%, transparent)}
  .bg-black\/10{background-color:color-mix(in oklab, var(--color-black) 10%, transparent)}
  ```

  **どれも色は `var()` 参照・不透明度はリテラル。**
- **延べ数の分母**: デザイン値ユーティリティは延べ **752**。
  🟨 ただしこの数字は `w-full` / `h-svh` のような構造ユーティリティも含む**緩い上限**なので、率としては使わない。
  **精度があるのは「追従しない 85 箇所」の側**（1 件ずつ目で確認した）

## 影響

- 🟥 **[DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md) に第 5 の分類「丁」を足す。**
  甲 3 / 乙 5 / 丙 1 / 対象外 6 に加えて、**丁 17 種 60 箇所**（うち 2 箇所は既出のスクリム）。
  🟦 **「丙が 1 件」という結論は変わらない**（丁は「追従はする」ので丙ではない）。
- 🟥 **手5 の Q3 は yes で確定した。**事前特定に穴があった。**穴の原因は方法ではなく分類語彙。**
- 🟥 **未決 #13（意味色 success / warning と状態 tint 4 種）の位置づけが変わる。**
  手4 で `--color-fill-success/warning/danger/neutral` を足したが、
  **それは自作部品にしか効かない。**shadcn の素材層 18 部品は `destructive/NN` を使い続ける。
  → **状態面の見た目は、素材層と製品層で二本立てになる。**
- 🟥 **「定義した値しか使わせない」枠の穴が 1 つ増えた。**
  [DR-0028](DR-0028-token-frame-is-not-closed.md) の `p-13` / `w-99` に加えて **`/NN` も素通りする。**
  手3 で組んだ `no-restricted-syntax` 8 セレクタも**数値の段とパレット色しか見ていない**ので、
  製品層で `bg-primary/37` と書いても止まらない。→ **手5 で赤テストして確かめる。**
- 🟨 **`ring-foreground/10` 6 箇所は shadcn nova が「枠線の代わりに ring」を使う設計**で、
  tmp-admin の `--color-separator` / `--color-separator-opaque` と機構が違う。**丁の 2 例目。**

## 関連

- [DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md) — 本 DR が分類を 1 つ足す
- [DR-0028](DR-0028-token-frame-is-not-closed.md) — 枠の穴。本 DR が `/NN` を追加する
- [OBS-0007](../OBS/OBS-0007_発見に推論を混ぜると後続が数え間違える.md) — 「出発点に lint を使った」ことの帰結
- 手順書: [手5](../手順/手5_トークン差し替え実験.md) §5 H5-03
