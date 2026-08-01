---
id: DR-0018
type: finding
title: '/design-sync が受け取るのはプレビュー HTML — story も React コンポーネントも渡らない'
status: superseded
date: 2026-07-26
step: '-'
related: [DR-0017, DR-0002, DR-0057]
poc_feedback: null
---

# DR-0018: /design-sync が受け取るのはプレビュー HTML

> 🟥 **superseded — [DR-0057](DR-0057-design-sync-uploads-compiled-code-not-just-html.md)（2026-08-01）が訂正した。**
> 本 DR は `DesignSync` **ツール**の仕様だけを読んで書かれており、**`/design-sync` skill 本体を読んでいなかった。**
> 誤りは 2 点——① **React コンポーネントは渡る**（コンパイル済みバンドルとして。型と使い方リファレンスも渡る）
> ② **フラグを載せる場所はある**（`<Name>.prompt.md` と conventions header）。
> 正しいままなのは `group` に役割 9 カテゴリが使えること・`thin` / `variantsIdentical` の存在。
> **本文は記録として残す**（決定は不変に積む規律）。

## 背景

DR-0017（Storybook の採用）を検討する過程で、「Storybook の story がそのまま Claude Design に渡るなら 1 つで両方賄える」という可能性があった。`DesignSync` ツールの仕様を読んで確かめた。

## 発見

**渡らない。`/design-sync` がアップロードするのは「プレビュー HTML」であって、story でも React コンポーネントでもない。**

| 事実 | 出典（`DesignSync` ツール仕様） |
|---|---|
| `register_assets` の `path` は「**preview/spec file**」（例 `components/button/index.html`） | パラメータ説明 |
| カード索引は「各**プレビュー HTML の先頭行の `<!-- @dsCard group="…" -->` コメント**」から作られ、`_ds_manifest.json` にコンパイルされる | `register_assets` の説明 |
| `report_validate` は `.render-check.json` から `total` / `bad` / **`thin`** / **`variantsIdentical`** / `iterations` を集計する | `counts` パラメータ |
| 手順は `list/read → finalize_plan → write/delete` の順で固定。プラン外のパスへの書き込みは拒否される | `method` の説明 |

### ★ 役割カテゴリは渡る。フラグは渡らない。

`group` フィールドの説明が決定的:

> Free-form section label for the Design System pane (max 64 chars). **Use the source design system's own categorization if it has one** — e.g. Material has Buttons/Cards/Forms/etc., **a corporate kit might have Actions/Forms/Navigation**. Common foundational labels: "Type", "Colors", "Spacing", "Components", "Brand".

→ **思想の役割 9 カテゴリはそのまま `group` に載せられる。**
→ 一方、**フラグ（`stateful` / `behaviorHook` / `formBound` / `overlay` / `container`）を載せる場所は無い。**

### `thin` / `variantsIdentical` の含意

Claude Design 側が「**中身の薄いプレビュー**」「**バリアントが同じに見えるプレビュー**」を検出する仕組みを持っている。
`subtitle` の例が「Primary / secondary / ghost, 3 sizes」であることと合わせると、**1 部品 = 1 プレビュー HTML に複数バリアントを並べる**形が期待されている。

## 影響

1. 🟥 **Storybook は手6 を賄わない。**Claude Design へ渡すには**プレビュー HTML を作る工程が別途要る**。手6 の作業内容がこれで確定した。
2. 🟦 **手6 の観測点の答えが半分先に出た。**当初の問い「役割カテゴリとフラグは `/design-sync` で渡るか」は、
   **役割カテゴリ = 渡る（`group`）／フラグ = 渡らない**が既に判明。
   → 手6 の問いは「渡るか」ではなく、**「フラグが渡らないとき、Claude Design はどこまで正しく部品を選べるか」**に変わる。
   フラグの辞書は Claude Code 側（skill / rules）で持たせるしかない可能性が高い。
3. 🟦 **カタログの構造を 3 箇所で揃えられる**——[部品カタログ.md](../部品カタログ.md) の表 / Storybook の `title` 階層 / Claude Design の `group`。すべて役割 9 カテゴリ。
4. 手6 の準備として、プレビュー HTML は**バリアントを並べた形**で作る（`thin` / `variantsIdentical` で弾かれないため）。

## 関連

- [ClaudeDesignShadcnIntegration.md](../../ClaudeDesignShadcnIntegration.md)（先行調査。「ローカルの React コンポーネントを変換してアップロード」という記述があるが、**変換先が HTML である**ことまでは書かれていなかった）
