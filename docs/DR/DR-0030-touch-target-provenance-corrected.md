---
id: DR-0030
type: finding
title: '44px は「全コントロールの不可侵下限」ではない — DR-0023 の発見 2 を訂正する'
status: observed
date: 2026-07-26
step: 手3
related: [DR-0023, DR-0005, DR-0024]
poc_feedback: '🟥 ui.md の材料。DR-0023 で挙げた「44px を規約に置くか」の前提が変わる'
---

# DR-0030: タッチターゲット 44px の出どころと適用範囲

## 背景

[DR-0023](DR-0023-real-conflict-is-touch-target.md) は、tmp-admin の `--touch-min: 44px` を
「**公式 a11y 規定・不可侵の下限**」とし、shadcn nova の `h-8`(32px) がそれを**割っている**と記録して手3 に送った。
ユーザーが「**そもそも 44px と nova の高密度がなんで出てきているのかわからない。他にも選択肢があると思う**」と指摘したため、
両方の出どころを一次情報で辿った。

## 発見

### 1. 「不可侵」と書いているのは tmp-admin ではなく継承元の apple base

`~/git/CC-Skills/.claude/skills/web-design-mock/references/apple/apple.md`:

| 行 | 記述 |
|---|---|
| 63 | タッチターゲット / コントラスト ｜ 公式 a11y 規定(44pt, 4.5:1 / 3:1) ｜ **公式値・不可侵の下限** |
| 149 | `--touch-min: 44px;  /* 最小タッチターゲット 44×44pt */` |
| 193 | §4.5 アクセシビリティ **[公式・不可侵]** — タッチターゲット **44×44px 以上** |

`apple.md` は自分の値を「**公式**」と「**導出**」に分けており、44px は公式側。
つまり**根拠は「Apple がそう言っているから」**であって、計測でも WCAG からの導出でもない。

### 2. 🟥 tmp-admin が 44px を適用しているのは nav-item 1 箇所だけ

`~/git/CC-Skills/web-design-mock/_philosophies/aux-admin/aux-admin.md`:

- §4「base の グリッド/ブレークポイント/余白リズム/ **a11y(44px・4.5:1/3:1)** は apple.md §4 を**継承**」
- §4.2「**nav-item は min-height `--touch-min`**」

**`--touch-min` を名指しで適用している箇所はここだけ。**「すべてのコントロールが 44px 以上」という規定は**存在しない**。
→ **DR-0023 が「下限割れ」と書いたのは、本 repo が「継承」を「全コントロールへの下限」と読み替えた結果だった。**

### 3. 🟥 WCAG の適合ラインは 44px ではなく 24px

| 出所 | 値 | 適合レベル |
|---|---|---|
| **WCAG 2.2 SC 2.5.8** Target Size (Minimum) | **24×24 CSS px** ＋ 間隔ほか 5 つの例外 | **AA** |
| WCAG 2.1 SC 2.5.5 Target Size (Enhanced) | 44×44 CSS px | **AAA** |
| Apple HIG | 44×44 pt（**タップできる面積**であって見た目ではない） | 指針 |
| Material Design | 48×48 dp | 指針 |

**nova の既定 32px は WCAG の AA を満たしている。**満たしていないのは AAA と Apple の指針。
`xs`(24px) がちょうど AA の線上、`sm`(28px)・`lg`(36px) は AA 適合。

### 4. `h-8` の側には根拠が無い

`src/components/ui/button.tsx` の size variant（`xs` h-6=24 / `sm` h-7=28 / `default` h-8=32 / `lg` h-9=36）。
**なぜその値かの記述はどこにも無い。**プリセットの意匠としてそう書かれているだけ。

### 5. 🟦 選択肢は 2 つでも 3 つでもなく、少なくとも 7 つある

Apple 自身が「**タップできる面積であって見た目ではない**」と定義している以上、**見た目と当たり判定は分離できる**。

| # | 案 | 見た目 | 当たり判定 | 素材層 |
|---|---|---|---|---|
| A | 見た目ごと 44px | 44 | 44 | 🟦 触らない（D1=(c) のラッパー） |
| B | 32px のまま受け入れる | 32 | 32 | 🟦 |
| C | 用途で使い分け | 混在 | 混在 | 🟦 |
| **D** 🆕 | **当たり判定だけ広げる**（`::after { inset: -6px }`） | **32** | **44** | 🟦 |
| **E** 🆕 | WCAG 2.5.8 の**間隔例外**を使う | 32 | 32 ＋ 間隔 | 🟦 |
| **F** 🆕 | `@media (pointer: coarse)` で分岐 | 環境依存 | 環境依存 | 🟦 |
| **G** 🆕 | 高さを semantic token 化（[DR-0029](DR-0029-component-token-overridable-outside-layer.md) の方式） | トークン次第 | トークン次第 | 🟦 |

### 6. 🟥 `addon-a11y` は 44px を見ていない

手2b D10 は「**未決 #11 を機械で測る手段が手に入る**」ことを根拠に `@storybook/addon-a11y` を残した。
axe-core が見るのは **WCAG 2.5.8 の 24px（AA）**であり、44px（AAA）は既定では検査しない。
→ **「a11y が緑だから 44px を満たしている」とは言えない。**残した判断自体は妥当だが、**根拠の一部が成り立たない。**

## 根拠（実測）

2026-07-26。

- `grep -n '44\|touch' apple.md` → L63 / L149 / L193
- `sed -n '150,175p' aux-admin.md` → §4 継承宣言 と §4.2 nav-item のみ
- `grep -nE 'size:|default:|sm:|lg:|xs:|icon' src/components/ui/button.tsx` → L23-34
- 一次情報: [WCAG 2.2 SC 2.5.8](https://wcag22aa.org/new-criteria/target-size/)／[WCAG 2.5.5（CSS-Tricks）](https://css-tricks.com/looking-at-wcag-2-5-5-for-better-target-sizes/)／
  [Designing better target sizes（Ahmad Shadeed）](https://ishadeed.com/article/target-size/)／[疑似要素による当たり判定拡張](https://51bits.com/expanded-hit-areas/)

### ⚠ 単位について

Apple の 44pt は **iOS の論理ポイント**で、Web には **44 CSS px** と写すのが通例。`apple.md` の翻訳は正しい。
（CSS の `pt` 単位として読むと 58.67px になるが、それは別の単位の話。）

## 影響

- 🟥 **[DR-0023](DR-0023-real-conflict-is-touch-target.md) の発見 2 を訂正する。**発見 1（accent は浅かった）と 3（符合点）は**維持**。
  訂正するのは「不可侵の下限を割っている」「トークンでは解けない・二択」という 2 点。
- 🟥 **未決 #11 の性格が変わる。**「哲学とプリセットのどちらを優先するか」という**思想の対立ではなくなった**。
  実際は「**見た目と当たり判定を分けるかどうか**」の実装選択で、D・F の組み合わせなら**どちらも捨てずに済む**。
- 🟨 **[トークンマッピング §5](../トークンマッピング.md) の「部品を触らないと解けない 7 件」に touch-min が含まれているが、
  D・F・G なら解ける。**手5 の事前特定 15 件は要再点検（[DR-0029](DR-0029-component-token-overridable-outside-layer.md) の影響と合わせて）。
- 🟦 **文脈が効く。**検証対象は Redmine の管理画面＝**マウス主体**（[DR-0002](DR-0002-verify-three-layers-not-screens.md)）なので、
  F（`pointer: coarse` 分岐）はほぼ無コスト。tmp-admin §4.4 が**テーブル行高 60px** を規定していることも、E（間隔例外）に有利。

## 関連

- [タッチターゲットとサイズ密度.md](../タッチターゲットとサイズ密度.md)
- 手順書: [手3](../手順/手3_Components層と製品層の分離.md) §2 D7・§5 H3-07
