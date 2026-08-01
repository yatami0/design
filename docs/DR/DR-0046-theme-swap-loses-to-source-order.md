---
id: DR-0046
type: finding
title: 'トークン差し替えは「@theme に書く」では効かない — 罠が 2 つあり、どちらもビルドは緑'
status: observed
date: 2026-07-26
step: 手5
related: [DR-0028, DR-0044, DR-0026, DR-0020]
poc_feedback: '🟥 移送時に必ず出る。PoC で shadcn を使うなら、テーマ差し替えの入り口はこの 2 つの罠を踏む'
---

# DR-0046: `@theme` に書いても効かない 2 つの罠（H5-06）

## 背景

手5 の 1 周目で、[トークンマッピング](../トークンマッピング.md) 表1 に従い tmp-admin の値を
`src/app/tmp-admin.css` へ書き、`globals.css` から `@import` した（手5 §2 D2=B）。

**書き方を 2 回間違えた。どちらもビルドは緑で、しかも「一部は効いている」ので成功に見えた。**

## 発見

### 罠 1: `@theme { --color-* }` は shadcn の `@theme inline` に負ける

`globals.css` の構造は 2 段構え:

```css
@import './tmp-admin.css';      /* ← 12 行目に置いた */
…
@theme inline {                 /* ← 26 行目 */
  --color-primary: var(--primary);
  --radius-lg: var(--radius);
}
:root {                         /* ← 70 行目 */
  --primary: oklch(0.205 0 0);
  --radius: 0.625rem;
}
```

`@theme { --color-primary: #… }` と書いても、**後ろの `@theme inline` が同じキーを
`var(--primary)` に再定義し直す**ので、値は出力に**一切現れない**。

| 観測 | 結果 |
| --- | --- |
| 生成 CSS 中の `003a63`（sidebar 色） | **0 件** |
| 生成 CSS 中の `005fa2`（ring 色） | **0 件** |
| `--radius` | `--radius:12px` と `--radius:.625rem` の**両方が出力され、後者が勝つ** |
| `pnpm build-storybook` | 🟦 **exit 0** |
| 同時に変わった変数 | **31 件**（Tailwind 既定と自前語彙は効いていた） |

🟥 **31 件が動いたので「効いている」と読めてしまう。**効かなかったのは
「shadcn が後から再定義するキー」＝**意味色 18 と `--radius`** だけだった。

### 罠 2: 「では `@import` を末尾へ」— **import ごと黙って捨てられる**

CSS の `@import` は**他の規則より前**に置かなければならない（`@charset` / `@layer` 文を除く）。
`globals.css` の末尾に移したところ、**Lightning CSS が import ごと破棄した**。

| 観測 | 末尾に置いた後 |
| --- | --- |
| `--blur-xs` | **4px**（0px に戻った） |
| `--font-weight-medium` | **500**（600 に戻った） |
| `--spacing-row` | `calc(var(--spacing) * 15)`（60px に戻った） |
| `pnpm build-storybook` | 🟦 **exit 0** |

🟥 **1 回目より悪化しているのに、ビルドは緑のまま。**警告も出ない。

### 効いた書き方: 位置は前・**詳細度**で勝つ

```css
/* tmp-admin.css — globals.css の上部から @import する */
:root:root {          /* (0,2,0) > shadcn の :root (0,1,0) */
  --primary: …;
  --radius: 12px;
}
@theme {              /* shadcn が再定義しないキーはこちらでよい */
  --blur-xs: 0px;
  --font-weight-medium: 600;
  --shadow-md: …;
}
```

**ソース順では勝てないので、詳細度で勝つ。**
`:root:root` は shadcn 自身のテーマ機構（`:root` の `--primary` 等）に乗るので、
`.dark` の構造も壊さない（[DR-0020](DR-0020-dark-mode-out-of-scope.md) で対象外とはいえ壊す必要は無い）。

結果、**実効カスタムプロパティ 98 件のうち 58 件が変わった。**

## 根拠（実測）

2026-07-26。判定は Storybook 側に固定（[DR-0026](DR-0026-two-css-pipelines-differ.md)）。
`storybook-static/assets/iframe-*.css` を Python で解析し、
**`:root:root`(0,2,0) > `:root`(0,1,0) の詳細度を解いて実効値を出した**（`.dark` は除外）。

| ビルド | 書き方 | 実効変数の変化 | ビルド |
| --- | --- | --- | --- |
| 1 回目 | `@theme` + import は上部 | 31 件（**意味色 18 と `--radius` は動かず**） | 🟦 exit 0 |
| 2 回目 | `@theme` + **import を末尾へ** | **0 件**（import ごと破棄） | 🟦 exit 0 |
| 3 回目 | **`:root:root`** + import は上部 | 🟦 **58 件** | 🟦 exit 0 |

3 回目の確認:

```
:root:root{--background:#fff;--foreground:#000;…--primary:#000;…--ring:#005fa2;--sidebar:#003a63;…--radius:12px}
--primary: #000  /  oklch(20.5% 0 0)  /  oklch(92.2% 0 0)   ← 詳細度で 1 つ目が勝つ
```

## 影響

- 🟥 **[OBS-0003](../OBS/OBS-0003_対象0件で緑が5回出た.md)「対象 0 件で緑」の 7・8 例目。**
  しかも**同じ手の中で 2 回**。6 例目（`--spacing: initial`）は H5-02 の赤テストで**意図的に**踏んだが、
  7・8 例目は**実作業で偶然踏んだ**。**赤テストで「機械は教えてくれない」と確認した直後に、まさにそれで 2 回転んだ。**
- 🟥 **手5 §2 に D7 を追記した**（実行中に §2 に無い選択肢が出たら追記してから進む規律の 3 例目）。
- 🟥 **手9（移送）に必ず出る。**PoC で shadcn を使ってテーマを差し替えるなら、
  **この 2 つの罠は構造的に踏む**（`globals.css` の 2 段構えは shadcn CLI が生成するもの）。
- 🟨 **「トークンを差し替えれば部品は追従する」という命題の前提が 1 つ増えた。**
  追従の可否以前に「**差し替えが届いているか**」を確かめる段が要る。
  [DR-0044](DR-0044-tailwind-resolves-tokens-at-build-time-too.md) が足した第 0 段（継ぎ目の有無）の**手前**に、
  さらに「**書いた値が出力に到達したか**」の確認が要る。
- 🟦 **検出方法は単純だった。**「投入した実値の文字列を生成 CSS に grep する」で 2 回とも即座に分かった。
  `grep -c "003a63"` が **0** なら届いていない。**ビルドの成否より速く確実。**

## 関連

- 手順書: [手5](../手順/手5_トークン差し替え実験.md) §2 D7・§5 H5-06
- [実行記録.md](../実行記録.md) §手5 H5-06
