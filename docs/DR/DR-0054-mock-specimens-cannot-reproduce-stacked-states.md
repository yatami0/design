---
id: DR-0054
type: finding
title: '模型の検体は「状態が重なったときの勝敗」を再現しない — フォーカスリングは実物で測って決着した'
status: observed
date: 2026-08-01
step: 手5
related: [DR-0053, DR-0045, DR-0051, DR-0046]
poc_feedback: '🟥 OBS 候補。レビュー用の検体は「単独の見た目」と「状態の重なり」で作り分ける'
---

# DR-0054: 模型の検体は状態の重なりを再現しない

## 背景

手5 の目視レビュー（観点 A）で、ユーザーが
**「エラー時のフォーカスリングもブランド色で表現されているように見える」**と述べた。

[OBS-0009](../OBS/OBS-0009_不透明度と状態面の概念を理解する.md) §1 は、これを 🟥 未確認として残していた。
CSS の順序上は `aria-invalid:ring-destructive/20` が `focus-visible:ring-ring/50` より後ろなので
**赤が勝つはず**だが、A story の検体は**素の `div` にリングクラスを 1 つ当てただけ**で、
実物の `Input` では測っていなかった。

## 発見

### 1. 🟦 予測は当たった。実物では destructive が勝つ

`aria-invalid` と `:focus-visible` が重なった `Input` のリングは **赤（destructive 20%）**で、
境界線も `rgb(255, 59, 48)`。**ブランド青は出ない。**

### 2. 🟦 勝敗を決めたのは詳細度ではなく**ソース順**

生成 CSS で両者は**同じカスタムプロパティ `--tw-ring-color` に書き込む**。

| セレクタ | 詳細度 | 生成 CSS 上の位置 |
| --- | --- | --- |
| `.focus-visible\:ring-ring\/50:focus-visible` | (0,2,0) | 先 |
| `.aria-invalid\:ring-destructive\/20[aria-invalid=true]` | (0,2,0) | **後** |

**詳細度が同値なので後勝ち。**

🟨 **含意: リングは 2 本出ない。**`ring-3` は `--tw-ring-color` 1 つで描くので、
**「フォーカスしている」と「エラーである」を同時に色で伝えられない。**
一方が他方を完全に置き換える。

### 3. 🟥 所見がずれた原因は検体の作りだった

素の `div` にクラスを 1 つ当てた検体は、**単独の見た目は再現するが、状態の重なりは再現しない。**

- `ring-ring/50` の検体（青）と `ring-destructive/40` の検体（赤）が**別々の行に並んでいる**だけで、
  「両方が当たったらどちらが出るか」はどこにも表示されていなかった
- 検体は `:focus-visible` を持たないので、**そもそもフォーカス状態が存在しない**

🟥 **[DR-0053](DR-0053-viewpoints-must-be-answerable-by-eye.md) と同型だが原因が違う。**
DR-0053 は「観点カードのラベルを実測せずに書いた」＝**値の誤り**。
今回は値もラベルも間違っていない——**検体が問いに答えられない作りだった**＝**器の誤り**。

### 4. 🟥 計測器の id 誤りは「要素が取れなかった」と区別がつかなかった

`④ Templates/AppShell` の `CardSurfaces` を測るとき、**export 名をそのまま小文字で繋げた** id を書いた。
Storybook は export 名を kebab に割るので、正しくは `--card-surfaces`。

**存在しない id を開いても計測器は止まらず、全検体が `null` になるだけ**だった。
観点カード上は「要素が取れなかった」＝ **実装が壊れているのと同じ表示**になる。

## 根拠（実測）

2026-08-01。`tools/visual-probe.mjs` に **`focus: true`** を足し、
`getComputedStyle` を読む前に `el.focus()` する形にして測った
（Chromium はテキスト入力を常に `:focus-visible` として扱う）。

| 検体 | 実測 |
| --- | --- |
| `Input`（通常・フォーカス時） | ring `oklab(0.475881 -0.0470812 -0.122347 / 0.5)` ＝ **ブランド青 50%** ／ border `rgba(60, 60, 67, 0.29)` |
| `Input aria-invalid`（フォーカス無し） | ring `oklab(0.654224 0.203716 0.111346 / 0.2)` ＝ **赤 20%** ／ border `rgb(255, 59, 48)` |
| **`Input aria-invalid` ＋ フォーカス** | ring **`oklab(0.654224 0.203716 0.111346 / 0.2)`（赤 20%・上と同一）** ／ border `rgb(255, 59, 48)` |

**フォーカスの有無でリングが変わらない**＝ `focus-visible` 側は完全に負けている。

生成 CSS（`storybook-static/assets/iframe-*.css`）から抜いた実物:

```css
.focus-visible\:ring-ring\/50:focus-visible      { --tw-ring-color: color-mix(in oklab, var(--ring) 50%, transparent) }
.aria-invalid\:ring-destructive\/20[aria-invalid=true] { --tw-ring-color: color-mix(in oklab, var(--destructive) 20%, transparent) }
```

**後者のほうがファイル内で後ろにある**（バイト位置は毎ビルド変わるので数字は根拠に書かない）。

id の件は**赤テストで確かめた**。誤った id に戻して回すと計測器が `exit 1` で止まる。

## 影響

- 🟦 **[OBS-0009](../OBS/OBS-0009_不透明度と状態面の概念を理解する.md) §1 のフォーカスリングの件は閉じた。**
  ただし OBS-0009 本体（不透明度と状態面の**概念**の学習）は `open` のまま——別の問いなので混ぜない
- 🟦 **観点 A の検体に実物の `Input` を 3 つ足した**（通常／`aria-invalid`／`aria-invalid` ＋フォーカス）。
  **模型の 2 群はそのまま残す**——単独の濃さを見比べる用途には有効だったため（DR-0053 の「ペア 1・2 は機能した」と同じ理屈）
- 🟨 **検体を作るときの判断が 1 つ増えた。**
  「単独の見た目」を見せるなら模型でよい。**「状態が重なったときどうなるか」を見せるなら実物でないと成立しない**
- 🟦 **計測器を 2 つ強くした。** ① `focus: true` で状態を当ててから測れる ② **story id の実在を `index.json` と突き合わせ、無ければ `exit 1`**
- 🟥 **shadcn の状態表現の設計上の限界が 1 つ見えた。**
  リングが 1 本しか無いので、**エラー中の入力欄はフォーカスしても見た目が変わらない。**
  「今どこにフォーカスしているか」がエラー行では失われる。🟥 **これを直すかは未判断**（素材層を触る話になる）

## 関連

- 手順書: [手5](../手順/手5_トークン差し替え実験.md) §0 Q3
- 実測の記録: [実行記録.md](../実行記録.md) §手5 H5-08
- [DR-0053](DR-0053-viewpoints-must-be-answerable-by-eye.md) — 同型の「認識合わせの道具が間違っていた」件（値の誤り／本 DR は器の誤り）
- [DR-0045](DR-0045-opacity-modifiers-were-invisible-to-lint.md) — 不透明度修飾 60 箇所
- `src/stories/Review/A-StateSurface.stories.tsx` — 群 4（実物の Input）
  （🆕 2026-08-09 に `状態面.stories.tsx` から改名。**日本語ファイル名だと `@storybook/addon-vitest` が
  story を 1 件も変換できない**——中身そのまま・名前だけ ASCII にした複製は通ると 1 変数で実測した。
  **title は日本語のまま。**部品1 D9）
- `tools/visual-probe.mjs` — `focus` オプションと id 実在チェック
