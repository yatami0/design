---
id: DR-0023
type: finding
title: 'tmp-admin と shadcn nova の本当の衝突は accent ではなくタッチターゲット下限（44px）'
status: observed
date: 2026-07-26
step: 手2
related: [DR-0005, DR-0010, DR-0019]
poc_feedback: '🟥 a11y の下限をどう扱うかは PoC の ui.md 規約に関わる。手9 で起票'
---

# DR-0023: 本当の衝突は accent ではなくタッチターゲット下限

## 背景

[DR-0005](DR-0005-token-ownership-and-two-stage.md) は、tmp-admin の原則「**accent は塗りに使わない・ブランドは濃紺の面で出す**」（V2）と
shadcn 既定（`primary` の塗り CTA）が「**真逆**」であり、**この衝突の解き方自体が手2 の検証項目になる**と書いた。
手2 H2-03 で、8 つの原則すべてについて実測で突き合わせた（[トークンマッピング.md](../トークンマッピング.md) 表3）。

## 発見

### 1. accent の衝突は、想定より浅かった

**`preset=nova` の `--primary` はブランド色ではなく無彩色**（`oklch(0.205 0 0)` ＝ ほぼ黒）。
したがって「ブランド色で塗る」という状態は最初から発生していない。
`--primary` に tmp-admin の `--color-accent`（#005fa2）を**入れないという写し方の選択だけで、V2 の「色」の側は守れる。**

tmp-admin の accent の行き先は `--ring`（フォーカスリング）で、これは tmp-admin 4.5「**accent はフォーカスリングのみ**」と**完全に一致する**。

残るのは「**塗り CTA という形**」だけ。これは色ではなく `button.tsx` の `default` variant（`bg-primary` 4 箇所）の問題で、
**部品を触らないと消えない。**

### 2. より重い衝突は #7 — タッチターゲット

| | tmp-admin / apple | shadcn nova（実測） |
| --- | --- | --- |
| 規定 | `--touch-min: 44px`・**「公式 a11y 規定・不可侵の下限」**と明記 | `button` default `h-8`(**32px**) ／ `sm` `h-7`(28px) ／ `xs` `h-6`(24px) |
| 位置づけ | 哲学の下限 | preset の設計（compact / 高密度志向） |

**トークンでは解けない。**高さはユーティリティで直書きされており、値の置き場が無い。
そして両者は**どちらも意図的**——tmp-admin は a11y 由来の不可侵下限、nova は管理画面向けの高密度。**設計思想が正面からぶつかる。**

### 3. 符合していた点（衝突しなかったもの）

| tmp-admin の原則                   | shadcn nova の実測                                  | 結果        |
| ---------------------------------- | ----------------------------------------------------- | ----------- |
| V3: largetitle〜title2 を使わない | `text-2xl` 以上は **0 箇所**（最大 `text-base` 16px） | 🟦 符合     |
| V4: 状態は tint pill               | `destructive` variant が `bg-destructive/10`（tint）を既定に | 🟦 発想が一致 |
| V5: on-dark は `--sidebar-*` に隔離 | `--sidebar-*` 8 変数が既に存在                        | 🟦 ほぼ 1:1 |

## 根拠（実測）

2026-07-26。全 8 原則の突き合わせは [トークンマッピング.md](../トークンマッピング.md) 表3。

- `src/app/globals.css:65` — `--primary: oklch(0.205 0 0)`（彩度 0 ＝ 無彩色）
- `src/components/ui/button.tsx:22` — `default: "bg-primary text-primary-foreground hover:bg-primary/80"`
- 同 33-42 行 — `size` の `default: "h-8 …"` / `sm: "h-7 …"` / `xs: "h-6 …"` / `icon: "size-8"`
- `bg-primary` の総数 4 箇所・`focus-visible:ring-ring/50` は全部品共通

## 影響

- 🟦 **手2 の作業が 1 つ減った。**DR-0005 が「手2 の検証項目」とした accent 衝突は、**マッピングの写し先を選ぶだけで解ける**。
  値を決める必要も、部品を触る必要もない（色に関しては）。
- 🟥 **代わりに手3 へ 1 つ送る。**タッチターゲット 44px を守るか、nova の高密度を取るか。
  これは**トークンでも部品ラップでもなく、哲学とプリセットのどちらを優先するかの判断**なので、ユーザー判断が要る可能性が高い。
- 🟨 **手5 で「変わらない箇所」は、実験前に少なくとも 15 箇所が特定できた。**
  内訳: [DR-0010](DR-0010-shadcn-invents-values.md) の純粋な生値 **8 件** ＋ 本手で判明した「部品を触らないと解けない」**7 件**
  （`--sidebar-width` の TS 定数／`--font-sans` が `next/font` 供給／影／スクリム／blur／weight 500／touch-min）。
  → **手5 の観測点は「それ以外に変わらない箇所が出るか」に絞れる。**
- 🟨 shadcn の `--accent`（ホバー面）と tmp-admin の `--color-accent`（ブランド青）は**同じ語で逆の意味**。
  マッピングでは吸収できるが、**手6 で Claude Design に渡すときは辞書が無いと誤解される**（[DR-0018](DR-0018-design-sync-takes-preview-html.md) と同種の問題）。

## 関連

- [トークンマッピング.md](../トークンマッピング.md) 表3
- 実測の記録: [docs/実行記録.md](../実行記録.md) §手2
