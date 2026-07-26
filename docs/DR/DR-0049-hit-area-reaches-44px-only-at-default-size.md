---
id: DR-0049
type: finding
title: '当たり判定 44px は default サイズでしか成立していない — 4 サイズ中 2 つが未達'
status: observed
date: 2026-07-27
step: 手5
related: [DR-0034, DR-0030, DR-0024]
poc_feedback: '🟥 ui.md の材料。a11y 規約を「当たり判定」に対して書くなら、**サイズごとに**成立を確かめる必要がある'
---

# DR-0049: 拡張量が固定なので、当たり判定 44px は 1 サイズしか満たさない（Q7 の答え）

## 背景

[DR-0034](DR-0034-touch-target-visual-32-hit-44.md)（手3 D7 = B+D+F）は
**見た目 32px ／ 当たり判定 44px** で解くと決め、根拠に「**32 + 6×2 = 44px**」を挙げた。

🟥 **この計算は静的に確定していたが、ブラウザでの実測は 4 回持ち越されていた**（未決 #23）。
`addon-a11y` の axe-core は 24px（AA）しか見ないので機械では測れず、
`@media (pointer: coarse)` 限定なので**普通に開いても 32px のまま見える**。

手5 で Playwright を計測器として入れ、`hasTouch: true` の文脈で実測した。

## 発見

### 🟦 機構そのものは成立している

| 観測 | 結果 |
| --- | --- |
| `matchMedia('(pointer: coarse)').matches` | **true**（分岐が効いている） |
| `::after` の `position` | `absolute` |
| `::after` の `inset` | **-6px**（`--spacing-hit-expand`） |

### 🟥 しかし拡張量が**全サイズ一律**なので、届くのは 2 サイズだけ

`Button` の製品層ラッパーは `pointer-coarse:after:-inset-(--spacing-hit-expand)` を
**variant に関係なく一律**で当てている。当たり判定は「見た目 + 12px」にしかならない。

| size | 見た目 | 当たり判定 | 44px 到達 |
| --- | --- | --- | --- |
| `xs` (h-6) | 24px | **36px** | 🟥 **未達** |
| `sm` (h-7) | 28px | **40px** | 🟥 **未達** |
| `default` (h-8) | 32px | **44px** | 🟦 到達 |
| `lg` (h-9) | 36px | 48px | 🟦 到達 |

**DR-0034 の「32 + 6×2 = 44px」は `default` サイズについてだけ正しい。**
その 1 サイズの計算を、4 サイズある部品の設計として一般化していた。

## 根拠（実測）

2026-07-27。`tools/visual-probe.mjs`。
Playwright の `browser.newContext({ hasTouch: true, isMobile: true, viewport: 390×844 })` で
`pointer: coarse` を成立させ、`Action/Button — Sizes` の 4 検体すべてについて
`getBoundingClientRect().height` と `getComputedStyle(el, '::after').inset` を読み、
**見た目 + |inset| × 2** を計算した。生データは `tmp/visual-probe/q7.json`。

## 影響

- 🟦 **未決 #23 が閉じた。**4 回持ち越した唯一の未計測項目に答えが出た。
- 🟥 **[DR-0034](DR-0034-touch-target-visual-32-hit-44.md) の射程を訂正する。**
  決定（見た目と当たり判定を分ける）は**維持**。訂正するのは「44px が成立している」という部分で、
  **成立しているのは `default` と `lg` だけ。**（DR-0034 の本文は書き換えない＝[DR-0004](DR-0004-document-system-and-git.md)。
  [DR-0030](DR-0030-touch-target-provenance-corrected.md) が DR-0023 の発見 2 だけを訂正したのと同じ扱い）
- 🟨 **ただし「これは問題か」は別の判断。**[DR-0030](DR-0030-touch-target-provenance-corrected.md) が確定させたとおり:
  - WCAG の適合ラインは **24×24px（AA）**。**4 サイズとも満たしている**
  - 44px は **AAA**（SC 2.5.5）で、tmp-admin が名指しで適用しているのは **nav-item 1 箇所だけ**
  - その nav-item は `min-height: 44px` が**実測で成立している**（[DR-0048](DR-0048-build-storybook-does-not-render.md) の再測定）
  → 🟥 **「44px を全ボタンに要求するか」は決めていない。**要求しないなら本件は問題ではない。
- 🟨 **直すなら 2 通り**（どちらも未決）:
  - **A** 拡張量をサイズごとに変える（`xs` は 10px、`sm` は 8px…）＝ **ラッパーが値の表を持つ**
  - **B** `xs` / `sm` をタッチ環境で使わない規約にする＝ **部品ではなく使い方の規約**
- 🟦 **静的計算が外れた 2 例目。**1 例目は [DR-0044](DR-0044-tailwind-resolves-tokens-at-build-time-too.md)（`@theme` が効く／効かない）。
  **どちらも「1 ケースで確かめて全体に一般化した」**のが原因。

## 関連

- `tools/visual-probe.mjs` — Q7 の測定部
- [タッチターゲットとサイズ密度.md](../タッチターゲットとサイズ密度.md)
- [実行記録.md](../実行記録.md) §手5 H5-07
