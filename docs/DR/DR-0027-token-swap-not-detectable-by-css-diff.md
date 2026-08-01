---
id: DR-0027
type: finding
title: 'トークン差し替えの影響は生成 CSS の diff では判定できない — 手5 の判定方法が確定した'
status: observed
date: 2026-07-26
step: 手2b
related: [DR-0010, DR-0017, DR-0026]
poc_feedback: 'OBS-0003（案A/案B）の判定方法そのもの'
---

# DR-0027: トークン差し替えは生成 CSS の diff では判定できない

## 背景

[DR-0010](DR-0010-shadcn-invents-values.md) により、手5 の判定は「変わったか / 変わらなかったか」の二値ではなく
**「どこが変わらなかったか」を列挙する形**になった（handoff 未決 #5）。
[DR-0017](DR-0017-storybook-as-catalog.md) は「列挙するには全部品を一望できる面が要る」として Storybook を手5 の判定装置に位置づけた。

**装置が本当に列挙できるかを、手5 より前に確かめる**のが手2b の合否条件（Q7）。
`--radius` を 1 変数だけ動かす予行演習を行った（手順書 §2 **D9**）。

## 発見

### 1. 🟥 CSS の diff は 1 行しか動かない

`--radius: 0.625rem` → `1.5rem` に変えて Storybook を再ビルドし、CSS を差分で比べた。

```
差分行数: 2（= :root の 1 行が書き換わっただけ）
<  … --radius:.625rem; …
>  … --radius:1.5rem;  …
```

**角丸を出力するルールはすべて `var()` 参照なので、CSS のテキストは動かない。**
つまり「トークンを差し替えたら CSS がどう変わったか」を diff で見ても、**何も分からない。**

### 2. ✅ 正しい判定は「静的分類 ＋ 実効値の計算」の 2 本立て

生成 CSS の宣言を**参照の形**で分類すると、追従するかどうかが機械的に決まる。

| 分類                        | 例                                        | 判定             |
| --------------------------- | ------------------------------------------- | ---------------- |
| `var(--token)`              | `border-radius:var(--radius)`               | 🟦 追従する      |
| `calc(var(--token) * n)`    | `border-radius:calc(var(--radius) * .6)`    | 🟦 追従する      |
| `min(var(--token), 生値)`   | `border-radius:min(var(--radius-md), 10px)` | 🟨 **頭打ちする** |
| 純粋な生値                  | `border-radius:4px`                         | 🟥 追従しない    |

`--radius` 10px → 24px での実効値:

| 対象                      | 式                          | 10px 時 | 24px 時   | 判定          |
| ------------------------- | ----------------------------- | ------- | --------- | ------------- |
| `rounded-sm` 〜 `4xl` 7 段 | `calc(var(--radius) * n)`     | 6〜26px | 14.4〜62.4px | 🟦 全段追従   |
| Button `xs` / `icon-xs`   | `min(var(--radius-md), 10px)` | 8px     | **10px**  | 🟨 頭打ち     |
| Button `sm` / Select `sm` | `min(var(--radius-md), 12px)` | 8px     | **12px**  | 🟨 頭打ち     |
| **Checkbox**              | `rounded-[4px]`               | 4px     | **4px**   | 🟥 変わらない |
| **Tooltip**               | `rounded-[2px]`               | 2px     | **2px**   | 🟥 変わらない |

**[DR-0010](DR-0010-shadcn-invents-values.md) が (C) 純粋な生値・(B) トークン+生値の混合として分類していたものが、そのまま現れた。**
事前に「変わらない」と特定していた箇所が、**実験で本当に変わらないことを確認できた**＝**装置は機能する。**

### 3. 🟨 (B) の「頭打ち」は差し替えの向きと大きさに依存する

`min(var(--radius-md), 10px)` は、`--radius` を**小さくする方向**なら追従し、**大きくする方向**では 10px で止まる。
つまり **(B) は「追従する / しない」の固定属性ではない**——差し替える値によって振る舞いが変わる。
[DR-0010](DR-0010-shadcn-invents-values.md) は (B) を「部分的に追従」と書いていたが、**より正確には「条件つき」**。

## 根拠（実測）

2026-07-26・手2b H2B-07。`src/app/globals.css` の `--radius` を一時的に書き換え → `pnpm build-storybook` → CSS を比較 → **`git checkout` で復元**（`git status` が空に戻ることを確認済み）。

分類は生成 CSS を直接走査して得た:

```bash
grep -oE 'border-radius:[^;}]*' storybook-static/assets/iframe-*.css | sort -u
```

## 影響

- ✅ **手5 の判定方法が確定した**（handoff 未決 #5 の答え）。手順は次の 3 段:
  1. `pnpm build-storybook` して生成 CSS の宣言を**参照の形で分類する**（`var()` / `calc()` / `min()` / 生値）
  2. 差し替え前後の**実効値を計算し**、変わらないものを列挙する
  3. Storybook で**目視して裏を取る**（分類が拾えない箇所——画像・SVG・インラインスタイル——のため）
- 🟦 **この方法は色にも余白にも使える。**角丸だけの性質ではない。
- 🟥 **[DR-0026](DR-0026-two-css-pipelines-differ.md) と合わせると、判定は Storybook 側の CSS に固定する必要がある。**
  本体は oklch を hex + lab に展開するので、同じ分類器が使えない。
- 🟨 **手5 の予行演習は済んだ**とみなしてよい。手5 は「`--radius` 1 変数」を「tmp-admin の全語彙」に広げるだけ。
- 🟨 (B) の条件つき性質により、**手5 では「差し替えた値の向き」も記録する必要がある**。

## 関連

- 手順書: [docs/手順/手2b_UIカタログStorybook.md](../手順/手2b_UIカタログStorybook.md) §5 H2B-07
- 実測の記録: [docs/実行記録.md](../実行記録.md) §手2b
