---
id: DR-0020
type: decision
title: 'dark モードはトークン差し替えの対象外とし、.dark は shadcn 既定のまま残す'
status: decided
date: 2026-07-26
step: 手2
related: [DR-0005, DR-0019]
poc_feedback: null
---

# DR-0020: dark モードはトークン差し替えの対象外とする

## 背景

shadcn は `globals.css` に `:root`（light）と `.dark` の **2 ブロック**を生成し、`.dark` にも 31 変数すべての値を持つ。
一方 [DR-0005](DR-0005-token-ownership-and-two-stage.md) で値の出所と決めた `tmp-admin`（+ base `apple`）は **light の値しか持たない**。
手5 でトークンを流し込むとき `.dark` をどうするかを、手2 で決める必要があった（手順書 §2 D7）。

## 決定

**dark を対象外にする**（選択肢 B）。ユーザー決定 2026-07-26。

- `.dark` ブロックは **shadcn 既定のまま残す**（消さない）。
- トークンマッピング表4（非対象）に、**「手5 で dark だけ差し替わらない」を既知の事実として明記する。**

### 比較した 2 案

| 案                                       | 内容                                                             | 採否        |
| ---------------------------------------- | ------------------------------------------------------------------ | ----------- |
| **A** 含める                             | `.dark` の 31 変数に対応する tmp-admin 側の dark 値を作る            | ❌          |
| **B** 除外し `.dark` は shadcn 既定のまま | light だけ写す。dark の混在は既知の非対象として記録する               | ✅ **採用** |

### A を採らなかった理由

🟥 **値の発明が必要になり、[DR-0005](DR-0005-token-ownership-and-two-stage.md) 決定2「ゼロから決め直さない」に正面から反する。**

- `apple.md` は dark を **「任意」**と注記し、方向（`--color-bg:#000000` / `--color-accent:#0A84FF` 等）だけを示す。
- tmp-admin 側の固有資産——**ブランド濃紺の面**（`--sidebar-bg: #003a63`）・**状態 tint 群**（`--fill-success/warning/danger/neutral`）・
  `--color-accent: #005fa2` は、**dark 版が存在しない**。`status: approved` が保証しているのは light の同型再現であり、
  dark 値を作った時点で**その承認の外に出る。**
- 加えて `validated_screens` は light の管理画面で検証されたもので、dark は D4 の射程外。

### B の代償を受け入れる

手5 で「light は tmp-admin・dark は shadcn 既定」という**混在が残る**。
これは隠さず、**マッピング表4 に非対象として明記する**ことで扱う。
[DR-0010](DR-0010-shadcn-invents-values.md) により手5 の判定はもともと「**どこが変わらなかったか**を列挙する」形に変わっており、
dark はその列挙の 1 行になるだけで、判定方法そのものは壊れない。

## 根拠（実測）

- `src/app/globals.css` の `.dark` ブロック（94–126 行）に **31 変数**。`:root` と同数（`--radius` を除く）。
- `~/git/CC-Skills/.claude/skills/web-design-mock/references/apple/apple.md` §3 末尾の注記:
  「**ダークモード(任意)**: … 追加する場合は `@media (prefers-color-scheme: dark)` で … 等に上書きする」＝**値表は無い**。
- `~/git/CC-Skills/web-design-mock/_philosophies/aux-admin/aux-admin.md` §3 の `:root` デルタに **dark 用の宣言は 1 つも無い**（23 変数すべて light）。

## 影響

- 🟦 手2 のマッピング対象が `:root`（light）31 変数に閉じる＝**表1 の行数がそのまま手5 の作業量**になる。
- 🟨 手5 の結果に「dark は差し替え対象外だったので変わらない」が**必ず 1 行入る**。これは設計の穴ではなく**意図した非対象**であり、区別して記録する。
- 🟨 本 repo は dark の切り替え UI を持たない（`.dark` クラスを付ける導線が無い）ため、**手2b の Storybook でも dark は既定で表示しない**方針と整合する。
- 🟦 dark が必要になったときは、**tmp-admin の dark 派生を CC-Skills 側で蒸留してから**引き継ぐのが筋（本 repo で発明しない）。

## 関連

- 手順書: [docs/手順/手2_トークン層マッピング.md](../手順/手2_トークン層マッピング.md) §2 D7
- 実測の記録: [docs/実行記録.md](../実行記録.md) §手2
- 対になる決定: [DR-0019](DR-0019-semantic-spacing-typography-vocabulary.md)
