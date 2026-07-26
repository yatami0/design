---
id: DR-0041
type: finding
title: 'Tailwind v4 の「トークンの継ぎ目」は utility ごとに違う — var() を出すものと値を焼き込むものがある'
status: observed
date: 2026-07-26
step: 手5
related: [DR-0027, DR-0028, DR-0029, DR-0010]
poc_feedback: '🟥 OBS 候補。PoC も Tailwind v4。「トークンを差し替えれば追従する」は utility 単位で成否が割れる'
---

# DR-0041: 継ぎ目の有無は utility ごとに違う

## 背景

未決 #18（手5 の事前特定 15 件の数え直し）を解くために、
「shadcn の部品が直書きしているユーティリティは、① 層の変数を差し替えたときに追従するのか」を実測した。

[DR-0027](DR-0027-token-swap-not-detectable-by-css-diff.md) は「生成 CSS は全部 `var()` 参照なので diff が動かない」と記録している。
**これが全ユーティリティに当てはまるかは確かめていなかった。**

## 発見

**`var()` を出すユーティリティと、値をリテラルで焼き込むユーティリティが混在する。**
同じ「ユーティリティ直書き」でも、**追従するものとしないものに割れる。**

| ユーティリティ | 生成 CSS | 継ぎ目 |
|---|---|---|
| `font-medium` | `--tw-font-weight:var(--font-weight-medium);font-weight:var(--font-weight-medium)` | 🟦 **あり** |
| `backdrop-blur-xs` | `--tw-backdrop-blur:blur(var(--blur-xs))` | 🟦 **あり** |
| `rounded-lg` | `border-radius:var(--radius)` | 🟦 あり |
| `text-sm` | `font-size:var(--text-sm)` | 🟦 あり |
| `shadow-md` | `--tw-shadow:0 4px 6px -1px var(--tw-shadow-color,#0000001a), 0 2px 4px -2px var(--tw-shadow-color,#0000001a)` | 🟥 **無し（リテラル）** |
| `bg-black/10` | `background-color:color-mix(in oklab, var(--color-black) 10%, transparent)` | 🟨 **色は参照・不透明度は焼き込み** |
| `focus-visible:ring-[3px]` | `--tw-ring-shadow:… calc(3px + …) …` | 🟥 無し（任意値） |
| `rounded-[4px]` | `border-radius:4px` | 🟥 無し（任意値） |

### 効き方の 3 種

1. 🟦 **`@theme` の 1 行で全箇所が動く** — 参照先の変数を再定義するだけ。`--font-weight-medium` は
   `:root` に `500` として実在するので、ここを 600 へ向ければ **shadcn 部品の `font-medium` 15 箇所すべて**が動く。
2. 🟨 **一部だけ動く** — `bg-black/10` は色だけが `--color-black` 経由。**不透明度 10% は CSS に焼き込まれている**ので、
   tmp-admin の `--scrim: rgba(0,0,0,0.40)` へは向けられない。
3. 🟥 **動かない** — `shadow-*` は theme 変数（`--shadow-md`）を**参照しない**。ビルド時に `--tw-shadow` へ展開される。

## 根拠（実測）

2026-07-26。`pnpm build-storybook` の出力 `storybook-static/assets/iframe-*.css`（ハッシュ付き 1 本）を grep
（判定は Storybook 側に固定＝[DR-0026](DR-0026-two-css-pipelines-differ.md)）。

```bash
grep -o "\.shadow-md{[^}]*}"   storybook-static/assets/iframe-*.css
grep -o "\.font-medium{[^}]*}" storybook-static/assets/iframe-*.css
grep -o "\.bg-black\\\\/10{[^}]*}" storybook-static/assets/iframe-*.css
```

`:root` 側に変数が実在することも確認した（＝再定義すれば効く）:

| 変数 | :root の値 |
|---|---|
| `--font-weight-medium` | `500` |
| `--blur-xs` | `4px` |
| `--color-black` | `#000` |
| `--radius` | `.625rem` |

部品側の件数（`src/components/ui/` を grep）: `font-medium` **15** ／ `backdrop-blur-xs` **2** ／ `bg-black/10` **2** ／
名前つき `shadow-*` **7**（`shadow-none` 1 と `shadow-[0 …]` 1 は別）。

## 影響

- 🟦 **未決 #18 の「部品を触らないと解けない 7 件」のうち 2 件が解けた。**
  blur（V1「blur を使わない」）は `--blur-xs` を、weight 500（V3「600 ⇔ 400」）は `--font-weight-medium` を
  `@theme` で向け替えるだけで動く。**合計 17 箇所が ① 層だけで追従する。**→ [DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md)
- 🟥 **影は逆に確定した。**「ユーティリティ直書きだが theme 変数を参照しているかもしれない」という望みは断たれた。
- 🟥 **手5 の判定手順に「継ぎ目の有無を先に測る」段が要る。**
  [DR-0027](DR-0027-token-swap-not-detectable-by-css-diff.md) の 3 段（静的分類 → 実効値計算 → 目視）は
  **「参照の形」を分類すると書いているが、参照しているかどうか自体を確かめる段が無い。**
  ソースの `font-medium` を見ても継ぎ目の有無は分からない。**生成 CSS を見ないと分からない。**
- 🟨 **「対象 0 件で緑」（[OBS-0003](../OBS/OBS-0003_対象0件で緑が5回出た.md)）と同型の罠。**
  `@theme` に `--shadow-md: …` と書いてもビルドは緑で通るが、**何も変わらない**。
  書いたのに効かないことを機械は教えない。

## 関連

- [トークンマッピング.md](../トークンマッピング.md) §5
- [DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md) — 本発見を使った数え直し
