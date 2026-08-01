---
id: DR-0043
type: finding
title: '手5 の「変わらない箇所」は 15 件ではなく 1 件 — 6 件は差し替え先が無く、6 件は素材層を触らず解ける'
status: observed
date: 2026-07-26
step: 手5
related: [DR-0010, DR-0029, DR-0034, DR-0041, DR-0042, DR-0033]
poc_feedback: '🟥 OBS-0003 の前提を更新する。「箱を触らずテーマだけ変える」の不成立範囲は、DR-0010 が見積もったより 1 桁小さい'
---

# DR-0043: 事前特定 15 件の数え直し（未決 #18）

## 背景

[トークンマッピング §5](../トークンマッピング.md) は
**「手5 で変わらない箇所は 15 件が事前特定済み（生値 8 ＋ 部品を触らないと解けない 7）」**と記録し、
手5 の問いを **「それ以外に変わらない箇所が出るか」** の形にした。

その後 3 つのことが起きた。
[DR-0029](DR-0029-component-token-overridable-outside-layer.md)（レイヤ外からの向け替え）、
[DR-0034](DR-0034-touch-target-visual-32-hit-44.md)（当たり判定の分離）、
そして手3 D1=(c) で **製品層（既定値ラッパー）が実在するようになった**。
15 という数字が古くなっている疑いがあったので、1 件ずつ再判定した（未決 #18）。

## 発見

**15 件のうち、実際に「変わらない」のは 1 件。**
数字がずれていたのではなく、**「変わらない」という 1 つの箱に 3 種類の別物が入っていた。**

### 判定の 4 分類

| 判定 | 意味 |
|---|---|
| 🟦 **甲** | ① 層の変数を差し替えるだけで動く（継ぎ目が既にある） |
| 🟨 **乙** | 継ぎ目が無いが、**素材層を触らずに**外から接続できる。接続後は追従する |
| 🟥 **丙** | 素材層を触らないと動かない＝**本当の「変わらない箇所」** |
| ⬜ **対象外** | tmp-admin に**差し替え先の値が無い**。変わらないが、変える対象でもない |

### 生値 8 件（[DR-0010](DR-0010-shadcn-invents-values.md) の (C)）

| # | 箇所 | 継ぎ目 | tmp-admin の対応値 | 新判定 |
|---|---|---|---|---|
| 1 | `badge.tsx` `focus-visible:ring-[3px]` | 🟥 リテラル | ❌ 無し | ⬜ **対象外** |
| 2 | `button.tsx` size=sm `text-[0.8rem]` | 🟥 リテラル | ✅ `--text-label`(12px) 相当 | 🟨 **乙**（製品層 `Button` ラッパーが既に在る） |
| 3 | `checkbox.tsx` `rounded-[4px]` | 🟥 リテラル | ✅ `--radius-s`(8px) | 🟨 **乙**（className 受け口あり） |
| 4 | `dialog.tsx` `max-w-[calc(100%-2rem)]` | 🟥 リテラル | ❌ レイアウト機構でトークンではない | ⬜ **対象外**（[DR-0011](DR-0011-lint-rule-overdetects.md) の (D) に入るべきだった） |
| 5 | `dropdown-menu.tsx` `min-w-[96px]` | 🟥 リテラル | ❌ 無し | ⬜ **対象外** |
| 6 | `sidebar.tsx` `after:w-[2px]` | 🟥 リテラル | ❌ rail の掴み線。無し | ⬜ **対象外** |
| 7 | `tooltip.tsx` `translate-y-[calc(-50%_-_2px)]` | 🟥 リテラル | ❌ 矢印の幾何 | ⬜ **対象外** |
| 8 | `tooltip.tsx` `rounded-[2px]` | 🟥 リテラル | ❌ 矢印の装飾 | ⬜ **対象外** |

🟥 **8 件のうち 6 件は「差し替え先が無い」。**
「変わらない箇所」として数えていたが、**そもそも変える対象ではない**ので観測点にならない。
`no-arbitrary-value` が赤くしたから 15 に入っていただけで、**lint の赤とトークン差し替えの成否は別の話**だった。

🟨 **7・8（tooltip の矢印）は差し替え先が無いのと同時に、丙でもある。**
`TooltipPrimitive.Arrow` は `TooltipContent` の中に className 直書きで埋め込まれており、**外から props が届かない**（実測）。

### 部品を触らないと解けない 7 件

| # | 箇所 | 数 | 継ぎ目（[DR-0041](DR-0041-tailwind-v4-seams-differ-per-utility.md)） | 新判定 |
|---|---|---|---|---|
| 9 | `--sidebar-width` **desktop** | 1 | 🟦 `SidebarProvider` が `...style` を**既定の後ろで**展開する（`sidebar.tsx:136`） | 🟨 **乙**（製品層から `style` を渡すだけ） |
| 9b | `--sidebar-width` **mobile** | 1 | 🟥 `SheetContent` にインライン style、**spread 無し**（`sidebar.tsx:189-194`） | 🟥 **丙** |
| 10 | `--font-sans` | 1 | — 供給元は `src/app/layout.tsx` の `next/font` | 🟨 **乙**（**アプリ層＝我々の持ち物**。素材層は無関係） |
| 11 | 影 `shadow-sm/md/lg` | 7 | 🟥 リテラル焼き込み（DR-0041） | 🟨 **乙**（[DR-0042](DR-0042-layer-external-override-reaches-properties.md) のレイヤ外上書きで届く。🟥 **所有権を外へ移す取引**） |
| 12 | スクリム `bg-black/10` | 2 | 🟨 色は `--color-black` 参照・**不透明度は焼き込み** | 🟨 **乙**（`[data-slot='dialog-overlay']` は data-slot を持つ。同上の取引） |
| 13 | blur `backdrop-blur-xs` | 2 | 🟦 **`blur(var(--blur-xs))`** | 🟦 **甲**（`@theme` 1 行。V1「blur を使わない」＝ `--blur-xs: 0`） |
| 14 | weight 500 `font-medium` | **15** | 🟦 **`var(--font-weight-medium)`** | 🟦 **甲**（`@theme` 1 行。V3「600 ⇔ 400」） |
| 15 | touch-min 44px | — | — | ✂ **削除**（[DR-0034](DR-0034-touch-target-visual-32-hit-44.md) で決着・実装済み） |

### 集計

| 判定 | 件数 | 効く箇所数 |
|---|---|---|
| 🟦 甲 ① 層だけで動く | **2** | **17**（blur 2 + weight 15） |
| 🟨 乙 素材層を触らず接続すれば動く | **6** | 13 |
| 🟥 **丙 素材層を触らないと動かない** | **1** | 1 |
| ⬜ 対象外（差し替え先が無い） | **6** | 6 |
| ✂ 削除済み | 1 | — |

15 件が 16 行になっているのは、**`--sidebar-width` が desktop / mobile で判定が割れた**ため。

## 根拠（実測）

2026-07-26。すべて `git status --porcelain` が空の状態から実施し、終了後も空であることを確認済み。

1. **生値 8 件が現在も素材層に在ること**を `grep` で確認（8 件とも変更なし）。
2. **継ぎ目の有無**は `pnpm build-storybook` の出力 CSS を grep（→ [DR-0041](DR-0041-tailwind-v4-seams-differ-per-utility.md)）。
3. **レイヤ外上書きが任意値に届くこと**はプローブで確認（→ [DR-0042](DR-0042-layer-external-override-reaches-properties.md)）。
4. **`...style` の展開順**は `src/components/ui/sidebar.tsx:132-138` を読んで確認。
   モバイル側（`:186-194`）には spread が無いことも同時に確認した。
5. **className の受け口**を部品ごとに確認 — `badge.tsx:43` ✅ ／ `checkbox.tsx:16-18` ✅ ／
   `sidebar.tsx:289-298`（Rail）✅ ／ `dialog.tsx:34-48`（`DialogOverlay` は data-slot と className を持つが
   **`DialogContent` が `<DialogOverlay />` を引数なしで描画する**ので props 経由では届かない）／
   `tooltip.tsx:51`（Arrow は className 直書き・受け口なし）🟥
6. **件数**: `font-medium` 15 ／ `backdrop-blur-xs` 2 ／ `bg-black/10` 2 ／ 名前つき `shadow-*` 7。

## 影響

- 🟥 **手5 の問いが立て直しになる。**
  「事前特定 15 件**以外に**変わらない箇所が出るか」は、**15 という母数が実測で 1 になった**ので
  そのままでは成立しない。観測点は 3 つに割るのが正確:

  | 観測点 | 問い |
  |---|---|
  | ① | 🟦 甲の **17 箇所**は本当に追従するか（`@theme` 2 行で 17 箇所が動くはず） |
  | ② | 🟨 乙の 6 件を接続したとき、**変異（`data-[size=sm]` / `focus-visible:`）を潰さずに済むか**（[DR-0042](DR-0042-layer-external-override-reaches-properties.md)） |
  | ③ | **この 16 行に無い場所**で追従しないものが出るか（元の問いはここだけに残る） |

- 🟥 **② が新しい論点。**乙のうち 影 7 箇所・スクリム 2 箇所は
  「継ぎ目を作る」のではなく「**外が値の所有権を取る**」形でしか解けない。
  **どこまで上書きで解くかは判断であって観測ではない**ので、手5 の手順書 §2 に判断ポイントとして置く。
- 🟦 **[DR-0010](DR-0010-shadcn-invents-values.md) の見立てが緩和される方向で外れた。**
  「箱を触らずテーマだけ変えるは部分的にしか成立しない」は正しいが、
  **不成立の範囲は見積もりより 1 桁小さい**（15 → 1）。DR-0010 の本文は書き換えない。
- 🟨 **分類の誤りが 1 件見つかった。**`dialog.tsx` の `max-w-[calc(100%-2rem)]` は
  値ではなくレイアウト機構なので、[DR-0011](DR-0011-lint-rule-overdetects.md) の (D)「値ではない」に入るべきだった。
  **lint が赤くしたものを、そのまま「トークンで解くべきもの」として数えていた。**

## 関連

- [トークンマッピング.md](../トークンマッピング.md) §5 — 本 DR が数字を更新する
- [DR-0041](DR-0041-tailwind-v4-seams-differ-per-utility.md) / [DR-0042](DR-0042-layer-external-override-reaches-properties.md) — 本 DR が使った 2 つの実測
- 手順書: [手5](../手順/手5_トークン差し替え実験.md) §2
