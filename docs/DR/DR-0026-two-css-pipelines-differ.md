---
id: DR-0026
type: finding
title: '本体（Next / lightningcss）と Storybook（Vite）は同じトークンを別の形式で出力する'
status: observed
date: 2026-07-26
step: 手2b
related: [DR-0017, DR-0021, DR-0027]
poc_feedback: 'OBS 候補。PoC でも Storybook を入れれば同じ二重パイプラインになる'
---

# DR-0026: 本体と Storybook は同じトークンを別形式で出力する

## 背景

[DR-0017](DR-0017-storybook-as-catalog.md) は Storybook 導入のリスクとして
「**本体の Next ビルドとは別系統のパイプラインが 1 本増える**＝『本体では通るが Storybook では壊れる』二重管理」を挙げ、
手2b の観測項目に入れていた（Q1）。両方をビルドして生成 CSS を突き合わせた。

## 発見

**壊れてはいない。値は等価。ただし出力形式が違う。**

| トークン                  | 本体（Next 16）                                                            | Storybook（Vite 8）      |
| ------------------------- | ---------------------------------------------------------------------------- | ------------------------ |
| `--primary`（light）      | `#171717` ＋ `@supports (color:lab(...))` 内で `lab(7.78201% -.0000149012 0)` | `oklch(20.5% 0 0)`       |
| `--primary`（dark）       | `#e5e5e5` ＋ `lab(90.952% 0 -.0000119209)`                                   | `oklch(92.2% 0 0)`       |
| `--radius`                | `.625rem`                                                                    | `.625rem`（一致）        |
| `--spacing-inset-lg`      | `calc(var(--spacing) * 6)`                                                   | 同左（一致）             |
| `--text-body`             | `var(--text-sm)`                                                             | 同左（一致）             |
| `@supports (color:lab(` の数 | **1**                                                                     | **0**                    |
| CSS サイズ                | 72,056 bytes                                                                 | 68,449 bytes             |

**本体は oklch を「hex フォールバック ＋ `@supports` で lab」に展開する**（Next 16 の CSS 最適化 = lightningcss）。
**Storybook は oklch のまま出す。**色は等価だが、**CSS のテキストとしては別物。**

### 一致した点

- 🟦 **手2 で入れた `@source not '../../docs'`（[DR-0021](DR-0021-tailwind-scans-docs-markdown.md)）は Vite 側でも効いた。**
  `docs/_probe.md` に `text-fuchsia-700` を書いてビルドしても、**両方の CSS で 0 件**。
  → handoff が手2 から持ち込んだ観測点（「Storybook と本体で生成されるクラス集合が食い違わないか」）は**食い違わない**が答え。
- 🟦 参照で書いたトークン（`calc(var(--spacing) * 6)` / `var(--text-sm)`）は**両者で完全に同一**。
  手2 の D5「値を書かず既定への参照で書く」が、二重パイプラインに対しても効いている。

## 根拠（実測）

2026-07-26。`pnpm build` と `pnpm build-storybook` の出力を直接 `grep` した。

```bash
grep -o -- '--primary:[^;]*' .next/static/chunks/*.css | sort -u
#   --primary:#171717 / #e5e5e5 / lab(7.78201% …) / lab(90.952% …)
grep -o -- '--primary:[^;]*' storybook-static/assets/iframe-*.css | sort -u
#   --primary:oklch(20.5% 0 0) / oklch(92.2% 0 0)
```

## 影響

- 🟥 **手5 の判定を「2 つの CSS の diff」でやってはいけない。**同じ設定でも文字列が違うので、
  差分の大半が**パイプラインの差**であってトークンの差ではない。判定は**片方に固定する**（→ 判定装置は Storybook なので Storybook 側）。
- 🟨 **色空間の扱いが違う＝古いブラウザでの見え方が違う。**本体はフォールバックを持ち、Storybook は持たない。
  「Storybook で見た色」と「本体で見た色」が**一部のブラウザで一致しない**可能性がある。
  今回の検証（モダンブラウザ前提）では問題にならないが、**カタログを見た目の正本として扱うなら前提の明示が要る**。
- 🟦 **色以外（余白・タイポ・角丸）は完全に一致する。**参照で書いたトークンは両パイプラインを素通りする。
- 🟨 PoC でも Storybook を入れれば同じ二重パイプラインになる。**「本体では通るが Storybook では壊れる」は起きなかった**が、
  **「同じに見えて中身が違う」は起きた**——`storybook build` をゲートに入れた（[DR-0024](DR-0024-storybook-render-only-and-gate.md)）のはこれを継続的に見るため。

## 関連

- 手順書: [docs/手順/手2b_UIカタログStorybook.md](../手順/手2b_UIカタログStorybook.md) §5 H2B-06
- 実測の記録: [docs/実行記録.md](../実行記録.md) §手2b
