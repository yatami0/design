---
id: DR-0051
type: decision
title: 'Storybook を層で並べ、実測値を観点カードとして story に載せる（認識合わせの仕掛け）'
status: decided
date: 2026-07-27
step: 手5
related: [DR-0017, DR-0002, DR-0033, DR-0048, DR-0050]
poc_feedback: '🟥 architecture.md の材料。「UI カタログ = Storybook」だけでは足りず、カタログとレビューは別の並べ方が要る'
---

# DR-0051: 層で並べ、観点カードに実測値を載せる

## 背景

手5 の目視レビューで、ユーザーから 4 点の指摘があった（2026-07-27）。

1. `AppShell` にメインの中身が無い。**見た目の検証ならテンプレートを充実させたい**
2. **Storybook で確認するとき層で分かれていたほうが確認しやすい**
3. カタログ + レビューで必要なものは **Review に集約**し、**観点のテンプレートを整備**したい
4. 目的は **レビューでユーザーと Claude の認識をできるだけ合わせること**

4 が目的で、1〜3 が手段。**何が認識合わせを妨げているか**を調べてから設計した。

## 調査 — 認識合わせを妨げていたもの

| # | 障害 | 具体 |
| --- | --- | --- |
| 1 | **観点と検体が別の場所にある** | 観点＝HTML アーティファクト（Claude が作った）／ 検体＝Storybook。**別の画面を見ていた** |
| 2 | **実測値が Storybook に無い** | Claude は `getComputedStyle` で測ったが、ユーザーは画面を見るだけ。**同じ数字を見ていない** |
| 3 | **層で歩けない** | `title` が役割 9 カテゴリなので「素材だけ見る」「自作だけ見る」ができない。層は `tags` にしかなく、**tags は Storybook のサイドバーを分けない** |
| 4 | **観点の書式が揃っていない** | Review 6 本は手で書いた。次に足すとき同じ形にならない |
| 5 | **テンプレートが薄い** | `AppShell` に中身が無く、面の構成を判定できない → 実際に欠陥を見逃していた（[DR-0050](DR-0050-three-surfaces-collapsed-into-two.md)） |

## 決定

### 1. 🟦 `title` の第 1 階層を**層**にする（役割 9 カテゴリは第 2 階層に残す）

```
① Tokens/                     トークン一覧
② 素材層/<役割>/<部品>          vendor 16
② 製品層・ラッパー/<役割>/<部品>  wrapped 2
② 製品層・自作/<役割>/<部品>     own 10
③ Patterns/                   ③ 層
④ Templates/                  ④ 層
★ Review/                     判定軸カタログ
```

🟨 **[DR-0017](DR-0017-storybook-as-catalog.md)「階層は役割 9 カテゴリ」を否定しない。**
役割 9 カテゴリは**第 2 階層として残る**ので、思想の分類は変わらない。
変えたのは**ナビゲーションの並べ方**で、これは分類ではない。
Atomic Design を採らない（[DR-0002](DR-0002-verify-three-layers-not-screens.md)）も維持。

🟦 **手5 の Q6 の答えでもある。**「層タグで由来を切り分けられるか」に対して、
**タグだけでは足りず、階層に出す必要があった**というのが実測の結論。

### 2. 🟦 実測値を story の中へ入れる（**認識合わせの本体**）

`tools/visual-probe.mjs` が `src/stories/Review/_measured.json` を書き、
`<Viewpoint obs="X" />` がそれを読んで **観点の定義 / 期待 / Claude の実測**を表に出す。
その**すぐ下に現物**が置かれる。

```
┌─ 観点カード ────────────────────────┐
│ 観点 B ／ Q2 ／ ★ 重点               │
│ 角丸 — 27 箇所は届き、7 箇所が取り残された │
│ 🟥 目で確かめたいこと：…               │
│ ┌ Claude が Playwright で測った値 ──┐ │
│ │ 検体      期待    実測            │ │
│ │ 🟦 rounded-md  8px   8px         │ │
│ └──────────────────────────────┘ │
└────────────────────────────────┘
（この下に現物が並ぶ）
```

**人は現物を、機械は数字を、同じ画面で突き合わせる。**

### 3. 🟦 役割分担 — 機械の観測は Storybook に、人の判定はアーティファクトに

| | 置き場 | 中身 |
| --- | --- | --- |
| **機械の観測** | Storybook の観点カード | 期待 / 実測 / 一致（`_measured.json`） |
| **人の判定** | [HTML アーティファクト](https://claude.ai/code/artifact/6e100f82-a3fc-42e1-b050-28f2920ece3c) | 判定（問題なし / 気になる / 要検討）+ メモ + Markdown 出力 |

**両者は観点 ID（A〜J）で 1:1 に対応する。**観点の定義は `_spec.tsx` の `VIEWPOINTS` が正本。

### 4. 🟦 テンプレートを充実させる

`④ Templates/AppShell` に **4 パターン**（Default / CardSurfaces / Empty / LongNavigation）。
実データ（`issues` 6 件）を詰め、DataGrid・StatusPill・Card・EmptyState を実際に載せた。

🟦 **これが即座に効いた。**面 2 と面 3 が同じ白であることが**この story で初めて分かった**（[DR-0050](DR-0050-three-surfaces-collapsed-into-two.md)）。

### 5. 🟨 Review story の tag を `review` に変える

Review は部品ではないので、層タグ（`vendor` / `wrapped` / `own`）を流用していたのは誤りだった。

## 根拠（実測）

2026-07-27。

- **tags はサイドバーを分けない**——`storybook-static/index.json` で確認。階層は `title` のパスだけが作る
- **層は `tags` にしか無かった**——全 37 story の `title` / `tags` を突き合わせて確認（層は第 1 階層に 1 件も出ていなかった）
- **`_measured.json` は 31 検体 / 8 観点**（A 4・B 6・C 3・D 5・EF 3・H 3・I 3・J 4）
- ゲート 6 本ともベースラインと一致（`lint` は error 33 / warning 1）

## 影響

- 🟦 **カタログとレビューの棲み分けが定義された。**
  カタログ＝**部品ごと**（`② 素材層` `② 製品層・*`）／レビュー＝**トークン軸ごと**（`★ Review`）。
  手5 の問いは全部トークン軸なので、**レビューは Review に集約**される。
- 🟥 **`_measured.json` はコミットする。**`tmp/` は gitignore だが、
  **story がビルド時に読む**ので `src/` 側に置く必要がある。
  🟨 probe を回すたびに `measuredAt` が動くので **diff にノイズが出る**——これは
  「いつ測った値か」を画面に出すための代償として受け入れる。
- 🟨 **AllVariants 型（部品ごとの全 variant）は依然として保留**（2 回ルール）。
  `★ Review` がトークン軸 × 全部品なので、内容をほぼ含む。
- 🟥 **story ID が全部変わった。**`tools/visual-probe.mjs` の対象 ID も追随済み。
  外部から story を参照しているものがあれば壊れる（現時点では無い）。

## 関連

- `src/stories/Review/_spec.tsx` — 観点テンプレートの実体（`VIEWPOINTS` が観点の正本）
- `tools/visual-probe.mjs` — 実測値の出どころ
- [Storybookの設計と目視観点.md](../Storybookの設計と目視観点.md)
