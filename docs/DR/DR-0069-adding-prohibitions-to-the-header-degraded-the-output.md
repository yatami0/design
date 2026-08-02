---
id: DR-0069
type: finding
title: '規約ヘッダに禁止を足したら、禁止した箇所以外が壊れた — 2 周連続で骨格部品が消え、ロールバックした'
status: observed
date: 2026-08-02
step: 手8
related: [DR-0063, DR-0064, DR-0065, DR-0066]
poc_feedback: '🟥 ui.md / architecture.md の材料。**生成 AI に渡す規約は「足す」ことが無料ではない。**禁止を 1 つ足すと、規約全体の従い方が変わりうる——足したら必ず 1 変数で測り直す'
---

# DR-0069: 規約ヘッダに禁止を足したら、禁止した箇所以外が壊れた

## 背景

手8 の H8-09 で、conventions header に **842 バイト**を足した。中身は**禁止 3 つと、新しい語彙 0**。

1. 「`.d.ts` も `.prompt.md` も `guidelines/` も**探しに行くな**」（[DR-0064](DR-0064-design-project-receives-runtime-only.md) の宛先無し参照への対処）
2. 「生成された索引は**無視しろ**」（README の自動生成部との矛盾への対処）
3. 「**生 CSS を書くな**」「**列挙外のクラスを使うな**」（手7 が手8 へ送った 2 件への対処）

その状態で 4 周目・5 周目を回した。**部品も語彙も依頼文も不変。動いたのはヘッダだけ。**

## 発見

### 1. ★ 禁止した 2 件は効いた

| 予測 | 4 周目 |
| --- | --- |
| `<style>` への生 CSS が消える | 🟦 **的中。**`<style>` ブロックごと 0（1 → 1 → 1 → **0**） |
| `tabular-nums` が消える | 🟦 **的中。**2 → 2 → 2 → **0** |

### 2. 🟥 同時に、禁止と無関係な箇所が壊れた

| 観測（markup を数えた） | 3 周目 | 4 周目 | 5 周目 |
| --- | --- | --- | --- |
| `Container`（最大幅・左右の余白） | 1 | 1 | 🟥 **0** |
| `Section`（見出しと縦の間隔） | 1 | 1 | 🟥 **0** |
| `DataGrid`（製品層の表） | 1 | 1 | 🟥 **0** |
| `Table` 系を**素材層で手組み** | 0 | 0 | 🟥 **17** |
| `Label` / `Stack`（フィールドのラベル） | 2 / 2 | 🟥 0 / 0 | 2 / 3 |
| `x-import` に `class=`（**効かない綴り**） | 0 | 🟥 2 | 🟥 5 |
| `<style>` への生 CSS | 1 | 🟦 0 | 🟥 **1**（戻った） |

🟥 **劣化は単調。**1 → 2 → 3 周目は単調に良くなっていた（[DR-0063](DR-0063-forbidding-without-an-alternative-fails.md)）のに、
ヘッダ編集後の 4 → 5 周目は単調に悪くなった。

🟥 **[DR-0065](DR-0065-claude-design-uses-the-registered-components.md)（Q1 =「使う」）が崩れ始めた。**
5 周目は `DataGrid`（製品層）を捨てて `Table` / `TableRow` / `TableCell`（素材層）で表を手組みした。

### 3. ★ `class=` は綴りが違うと黙って落ちる（ランタイムを読んで確定）

`support.js`（Claude Design のランタイム）の `collectProps`:

```js
if (kind !== "dom") {                                   // ← x-import（部品）
  if (key.includes("-") && …) key = kebabToCamel(key);  // class-name → className ✅
} else {                                                // ← 素の HTML 要素
  if (key === "class") key = "className";               // ← この行は dom のときだけ
}
```

- `class-name="w-field-md"` → ハイフンを含む → `className` に変換される 🟦
- `class="w-field-md"` → ハイフンを含まない → **`class` のまま props に渡り、React が捨てる** 🟥

→ **フィールド幅の語彙が一切当たらない。**これが「検索のところが崩れる」の実体。

🟨 **`onValueChange` / `onClick` は問題ない。**ランタイムに `encodeCamelAttrs`（camelCase 属性を
`sc-camel-…` に退避して復元する仕組み）があり、camelCase でも正しく動く。

### 4. 🟥 この劣化は境界のどちらの機械ゲートも検出していない

部品はすべて `Design.*` から呼ばれ、素の HTML 要素も 0、禁止語彙も 0。
それでも骨格が消え、幅が効かず、製品層が素材層に退行した。
🟥 **2 周とも、見つけたのは人の目だけ。**[DR-0066](DR-0066-neither-side-lints-the-generated-output.md) の実害が画面に出た初めての例。

## 根拠（実測）

2026-08-02。検体 5 本を markup の `x-import` 単位で数えた
（`artifacts/h7/*.dc.html` 3 本 ＋ `artifacts/h8/RedmineIssueList-r4.dc.html` / `-r5.dc.html`）。
ヘッダの差分は `git diff 5c36b88..HEAD -- .design-sync/conventions.md`（**+19 / -5 行・842 バイト**）。
ランタイムの変換規則は `support.js` の実物を読んだ（推測ではない）。

**ロールバック**: `git show 5c36b88:.design-sync/conventions.md` で手7 の状態に戻し（差分 0 行・6,832 バイト）、
ドライバを回して DS へ再アップロード。remote の README が手7 の内容に戻ったことを `get_file` で確認済み。

## 影響

**観測から直接言えること**

1. ★ **規約ヘッダは「足せば足すだけ良くなる」ものではない。**
   [DR-0063](DR-0063-forbidding-without-an-alternative-fails.md) は「**部品を足す**」「**語彙を足す**」で逸脱が 5 → 2 → 1 に減ったと結論したが、
   **今回足したのは禁止 3 つと語彙 0** で、**禁止した箇所は直り、それ以外が壊れた。**
   → **DR-0063 の「代替語彙を与えると守られる」は、「禁止だけを足すと別の場所が壊れる」と対になる。**
2. ★ **1 変数の実験でも、観測点を絞ると劣化を見落とす。**
   予測は「`<style>` が消えるか」「`tabular-nums` が消えるか」の 2 点だけを立てていた。
   **その 2 点は的中したので、予測表だけ見れば「成功」だった。**
   骨格が消えたのは**予測していなかった場所**で、ユーザーの目視でしか見つからなかった。
   → **禁止を足す実験では「禁止した箇所」だけでなく「触っていない箇所」も数える。**
3. 🟥 **DSL の綴り（`class-name`）はどこにも書かれていない。**
   ヘッダにも `.prompt.md` にも無く、ヘッダの例はすべて JSX（`className=`）。
   **書き手は JSX を読み、書く先はケバブの HTML DSL** という不一致が常にある。

**🟥 推論（未検証）**

- 🟥 **「ヘッダ編集が原因」はまだ確定していない。**n=2 で単調ではあるが、**対照（6 周目）を打っていない。**
  ロールバック後の 6 周目で骨格が戻れば確定する。**戻らなければ、原因はヘッダではない。**
- **なぜ禁止が無関係な箇所を壊すのかは分からない。**仮説は 2 つあり、どちらも未検証:
  ① 842 バイトの「見るな／無視しろ」を**唯一の実例（`One idiomatic build`）の直前**に挿したこと
  （消えた `Container` / `Section` はまさにその実例の中身）
  ② ヘッダが 6,832 → 7,674 バイトになったこと（skill の推奨は **2,000〜4,000**。**編集前から超過していた**）
- **`class=` の初出が 4 周目である**ことと、ヘッダ編集の関係は不明。
  🟨 1 周目は `onClick=`（camelCase）を書いており、**DSL の綴りは元から不安定**だった。

## 関連

- 手順書: [手8](../手順/手8_出力は機械ゲートを通るか.md) H8-09 / H8-10
- 実測の記録: [実行記録.md](../実行記録.md) §手8 H8-10
- 対になる発見: [DR-0063](DR-0063-forbidding-without-an-alternative-fails.md)（禁止と代替の対）
- 検出できなかった網: [DR-0066](DR-0066-neither-side-lints-the-generated-output.md)
- 発端: [DR-0064](DR-0064-design-project-receives-runtime-only.md)（宛先無し参照。**直そうとしてこうなった**）
