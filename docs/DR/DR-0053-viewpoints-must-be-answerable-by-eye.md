---
id: DR-0053
type: finding
title: '観点には「目で答えられるもの」と「機械でしか答えられないもの」がある — 混ぜると止まる'
status: observed
date: 2026-07-27
step: 手5
related: [DR-0051, DR-0049, DR-0027, DR-0048]
poc_feedback: '🟥 OBS 候補。レビュー観点を設計するときは「誰が答えられるか」を先に決める'
---

# DR-0053: 観点は「誰が答えられるか」で分けないと止まる

## 背景

[DR-0051](DR-0051-storybook-organized-by-layer-with-viewpoint-cards.md) で観点 I を**比較ペア 4 つ**に組み替え、
「どれとどれを、どのプロパティで比べるか」を名指しした。
ユーザーがそれを見て**ペアごとに具体的な指摘**を返した（2026-07-27）。

## 発見

### 🟥 ペア 4 は「目では答えられない観点」だった

> 足した一点が多分この Storybook では実測できないんじゃないかな？多分当たり判定は変わってないと思う

**指摘は正しい。**`Button` の製品層ラッパーが足した唯一の 1 点は当たり判定の拡張で、
`@media (pointer: coarse)` 限定なので **デスクトップの Storybook では発火しない**（[DR-0049](DR-0049-hit-area-reaches-44px-only-at-default-size.md)）。
画面上は素材そのままに見える。

🟥 **私は note に「タッチ環境でしか出ないので画面上は見えない」と書いておきながら、
それを「見て比べる」ペアに入れていた。**観点として自己矛盾していた。

### 🟥 ペア 3 は「見た目の比較」ではなく「コードの読み方」の話だった

> ちゃんと理解できていない。カードの inset-md は左右の余白がないけどこれは合ってるの？
> 多分私の見る観点がちがうってことはわかるけど説明がわかってない

**2 つの別問題が重なっていた。**

1. **観点の性質**: ペア 3 で見せたかったのは「16px という値がどこから来たか説明できるか」で、
   これは**コードを読む話**であって目で見る話ではない。**視覚的比較の枠に入れたのが誤り。**
2. 🟥 **実装のバグ**: `card.tsx` の root は `py-(--card-spacing)` **だけ**で `px-` を持たない。
   横の余白は `CardContent` が `px-(--card-spacing)` として持つ。
   素の children を `<Card>` に直接入れると**左右の余白がゼロになる**（実測 `paddingLeft: 0px`）。
   **ユーザーの指摘は実装の誤りを正確に射抜いていた。**

### 🟥 ラベルを 3 箇所間違えていた

実物を測らず「たぶんこうだろう」で書いていた。

| # | 私が書いたラベル | 実測 | 影響 |
| --- | --- | --- | --- |
| 1 | Card は `rounded-lg` → 12px | **`rounded-xl` → 18px** | 比較の前提がずれる |
| 2 | Badge destructive は `bg-destructive/20` | **`bg-destructive/10`** | 🟥 **濃淡の向きが逆になる** |
| 3 | Card の padding は 16px | `paddingTop: 16px` / **`paddingLeft: 0px`** | 「余白が無い」の原因 |

**#2 が特に悪い。**私は「vendor(20%) のほうが濃い」と書いたが、実際は
**own(16%) のほうが濃い**——ユーザーの「OWN のほうが全体的に濃い赤な気がする」が正しかった。

## 根拠（実測）

2026-07-27。`tools/visual-probe.mjs` で**実物のコンポーネント**（素の `div` ではなく）を測った。

| 検体 | 実測 |
| --- | --- |
| `[data-slot="checkbox"]` の角丸 | `4px` |
| `[data-slot="card"]` の角丸 | **`18px`** |
| `[data-slot="badge"].bg-destructive\/10` の面 | `oklab(… / 0.1)` ＝ **10%** |
| `[data-slot="badge"].bg-fill-danger` の面 | `rgba(255, 59, 48, 0.16)` ＝ **16%** |
| `[data-slot="table-cell"]` の padding | `8px` / `8px` |
| `[data-slot="card"]` の padding | `paddingLeft: 0px` / `paddingTop: 16px` |

ソース側の確認: `badge.tsx:16` の destructive variant は `bg-destructive/10`。
`card.tsx:15` の root は `py-(--card-spacing)` のみで `px-` 無し。

## 影響

- 🟦 **観点を 2 種類に分ける必要がある。**
  `_spec.tsx` に `<MachineOnly>` を足し、**目では答えられない観点は比較ペアに入れない**ことにした。
  機械側が実測から結論まで出し、**人は「その読みに同意するか」だけを判断する。**
- 🟥 **[OBS-0007](../OBS/OBS-0007_発見に推論を混ぜると後続が数え間違える.md)「発見に推論を混ぜる」の 3 例目。**
  1 例目は [DR-0041](DR-0041-tailwind-v4-seams-differ-per-utility.md)（shadow の推論）、2 例目は [DR-0045](DR-0045-opacity-modifiers-were-invisible-to-lint.md)（lint を母集団にした）。
  今回は**レビュー用の観点カードのラベルを実測せずに書いた**。
  🟥 **認識合わせのために作った道具に、確かめていない値を載せていた。**
- 🟨 **`Card` の使い方が repo 内で誤っている箇所がある。**
  `④ Templates/AppShell — CardSurfaces` も素の children を `<Card>` に直接入れている。
  → **`CardContent` を通す必要がある**（本 DR では I story だけ直した）。
- 🟦 **ペア 1・2 は観点として機能した。**
  「チェックボックスだけ角が立って見える」「OWN のほうが濃い」はどちらも**目視で正しく取れている**。
  **視覚的比較の形式そのものは有効。**問題は中身の正確さと、非視覚的観点の混入だった。

## 関連

- `src/stories/Review/_spec.tsx` — `<Pair>`（目で答える）と `<MachineOnly>`（機械が答える）
- [DR-0051](DR-0051-storybook-organized-by-layer-with-viewpoint-cards.md) — 観点カードの設計
- [実行記録.md](../実行記録.md) §手5 H5-07
