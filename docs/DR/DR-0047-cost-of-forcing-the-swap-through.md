---
id: DR-0047
type: finding
title: '「無理をして通す」代償を実測した — 追従 +29 箇所と引き換えに、取り残し 7・語彙 +6・内部依存 +9'
status: observed
date: 2026-07-26
step: 手5
related: [DR-0042, DR-0043, DR-0044, DR-0045, DR-0046]
poc_feedback: '🟥 OBS-0003 の材料。テーマ 2 層構造（案B）に「レイヤ外上書き」を入れるなら、この 3 つの代償を明記する'
---

# DR-0047: 無理をして通したときの代償（手5 2 周目 / Q2 の答え）

## 背景

手5 §2 D1=D は「**1 周目「素直」→ 2 周目「無理」の 2 段で測る**」と決めた。
1 周目は変数の向け替えと `@theme` だけで通し、2 周目にレイヤ外上書きと語彙追加を重ねた。
本 DR は **2 周目の増分と代償**を記録する（＝手5 Q2 の答え、[OBS-0005](../OBS/OBS-0005_どこまで無理をして通すかの判断軸.md) の材料）。

## 発見

### 1. 🟥 「無理」には 2 段階あった

2 周目に入って初めて分かったのは、**無理の質が対象によって違う**こと。

| 対象 | 迂回先 | やること | 性質 |
| --- | --- | --- | --- |
| 意味色 18・サイドバー 8 | shadcn 自身の変数（`--primary` 等） | `:root:root` に書く | 🟨 **構造に乗る**（shadcn のテーマ機構をそのまま使う） |
| **角丸の段 7** | **無い** | `.rounded-md { … }` をレイヤ外で潰す | 🟥 **構造を無視する**（ユーティリティの所有権を奪う） |

角丸に迂回先が無いのは、**段が変数ではなく計算式だから**。
`@theme inline { --radius-md: calc(var(--radius) * 0.8) }` はユーティリティへインライン展開されるので、
段ごとの「元変数」が存在しない。`@theme` での再定義も効かない
（[DR-0046](DR-0046-theme-swap-loses-to-source-order.md) の一般形：
shadcn の `@theme inline` が握る **`--color-*` 31 + `--radius-*` 7 = 38 キー**は、
先に `@import` した `@theme` からは上書きできない）。

### 2. 追従の増分は **+29 箇所**

| 対象 | 1 周目 | 2 周目 | 増分 |
| --- | --- | --- | --- |
| 角丸（素材層・variant なし） | 比率派生のみ（apple の非線形 5 段とは基数の 1 段しか一致しない） | **27 箇所**が一致 | **+27** |
| スクリム | `bg-black/10`（10%・[DR-0045](DR-0045-opacity-modifiers-were-invisible-to-lint.md) の「丁」） | **2 箇所**が `--color-scrim`(40%) に | **+2** |

### 3. 🟥 代償は 3 つとも実数で出た

| 代償 | 1 周目 | 2 周目 | 中身 |
| --- | --- | --- | --- |
| ① **取り残された variant** | 0 | **7 箇所**（うちずれたのは **2**） | 下記 |
| ② **足した語彙** | `--radius` 1 個 | **+6 個** | `--radius-apple-{s,m,l,xl,pill}` 5 ＋ `--color-scrim` 1 |
| ③ **shadcn 内部への依存** | 2 | **+9** | `data-slot` 名 2 ＋ **ユーティリティクラス名 7** |

**代償① の正体は「上書きは兄弟クラスに届かない」。**
レイヤ外の `.rounded-lg` は `in-data-[slot=button-group]:rounded-lg` とは**別のクラス**なので当たらない。
variant 側は比率派生のまま取り残される。

| variant 付きクラス | 実効値 | 狙い | |
| --- | --- | --- | --- |
| `group-data-[variant=floating]:rounded-lg` | 12.0px | 12px | ✅ **偶然**一致 |
| `in-data-[slot=button-group]:rounded-lg` | 12.0px | 12px | ✅ **偶然**一致 |
| `**:data-[slot=kbd]:rounded-sm` | **7.2px** | 8px | 🟥 ずれた |
| `md:peer-data-[variant=inset]:rounded-xl` | **16.8px** | 18px | 🟥 ずれた |

🟥 **一致した 2 件は基数を apple の `m`(12px) に合わせた副作用**で、`* 1.0` の段だけが結果的に合っただけ。
**基数を変えれば両方ずれる。**＝ この 2 件は「解けている」のではなく「今はたまたま合っている」。

🟦 **スクリムの代償① は 0。**`background-color` だけを上書きしたので、
`data-open:fade-in-0` 等のアニメーション（`--tw-enter-opacity` を使う）は無傷だった。
**「上書きは必ず variant を潰す」わけではない——潰すのは同じプロパティを持つ variant だけ。**
これは [DR-0042](DR-0042-layer-external-override-reaches-properties.md) が
「上書きは変異を潰す」と一般化して書いた点の**精密化**にあたる。

### 4. 🟨 書いた規則数と出力の規則数は一致しない

Lightning CSS が同値の宣言を統合した。

```
書いた:  .rounded-sm{…apple-s}  .rounded-md{…apple-s}  .rounded-xl{…apple-l}  .rounded-2xl{…apple-l}  （7 規則）
出力:    .rounded-sm,.rounded-md{…apple-s}   .rounded-xl,.rounded-2xl{…apple-l}   （5 規則）
```

**代償③ を「出力の規則数」で数えると過少になる。**依存の数は**書いた側**で数える。

## 根拠（実測）

2026-07-26。判定は Storybook 側に固定（[DR-0026](DR-0026-two-css-pipelines-differ.md)）。

- レイヤ外に落ちたことの確認（`@layer utilities` は 7,732〜62,960）:

  ```
  @ 15440 in-layer=True   .rounded-md{border-radius:calc(var(--radius) * .8)}
  @ 65782 in-layer=False  .rounded-sm,.rounded-md{border-radius:var(--radius-apple-s)}   ← 勝つ
  [data-slot=dialog-overlay],[data-slot=sheet-overlay]{background-color:var(--color-scrim)}
  ```

- 箇所数は `src/components/ui/*.tsx` からクラスを抽出し、
  **variant 接頭辞の有無で二分**して数えた（[DR-0045](DR-0045-opacity-modifiers-were-invisible-to-lint.md) と同じ手口）。
  角丸: variant なし **27** ／ variant 付き **7**。
- ゲート 6 本ともベースラインと一致（`lint` は error 33 / warning 1 でゼロ増）。**素材層の diff は 0 行**（Q4・5 回目）。

## 影響

- 🟦 **手5 Q2 の答えが出た。**「変異を潰さずに済むか」は **対象による**。
  同じプロパティを持つ variant があれば潰れ（角丸 7 箇所）、無ければ潰れない（スクリム）。
- 🟥 **[OBS-0005](../OBS/OBS-0005_どこまで無理をして通すかの判断軸.md) に判断材料が揃った。**
  **追従 +29 箇所 ⇔ 取り残し 7・語彙 +6・内部依存 +9。**
  🟥 **これが「割に合う」かどうかは本 DR では決めない**（判断軸が無いことが OBS-0005 の中身）。
- 🟨 **代償③ が一番重い、というのが Claude の見立て**（🟥 本人未確認）。
  ①は数えられるし②は自分の持ち物が増えるだけだが、
  ③は **shadcn 側が変わったときに黙って壊れる**——しかも
  [OBS-0003](../OBS/OBS-0003_対象0件で緑が5回出た.md) のとおり**機械は教えてくれない**。
- 🟥 **手9（移送）に効く。**PoC で同じことをやるなら、
  ユーティリティクラス名 7 個への依存は**「shadcn を更新できない」という形で返ってくる**。

## 関連

- 手順書: [手5](../手順/手5_トークン差し替え実験.md) §5-2
- [実行記録.md](../実行記録.md) §手5 H5-05b / H5-06b / H5-07b
- [OBS-0005](../OBS/OBS-0005_どこまで無理をして通すかの判断軸.md) — 本 DR がその材料
