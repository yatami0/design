# DR 索引

> 1 ファイル = 1 決定 or 1 発見。形式の正本は [_template.md](_template.md)。
> `decision` = 決めたこと／`finding` = 分かったこと。**決定は不変に積む**（覆すときは新 DR で supersede）。

## 決定（decision）

| ID | タイトル | 手 | 状態 |
|---|---|---|---|
| [DR-0001](DR-0001-repo-role-and-deliverable.md) | 本 repo の役割はワークフロー検証・成果物は「決定 + 移送可能なコード」 | — | decided |
| [DR-0002](DR-0002-verify-three-layers-not-screens.md) | 検証対象は画面ではなく 3 層（Tokens / Components / Patterns・Templates） | — | decided |
| [DR-0003](DR-0003-foundation-mirrors-poc.md) | 土台は PoC と同一版・同一 lint の単体 Next.js アプリ | 手0 | decided |
| [DR-0004](DR-0004-document-system-and-git.md) | 証跡は 4 層に分ける（段取り / 手順書 / 実行記録 / DR）+ git 運用 | — | decided |
| [DR-0005](DR-0005-token-ownership-and-two-stage.md) | トークン語彙の正本は design 側・値は tmp-admin・投入は 2 段階 | — | decided |
| [DR-0006](DR-0006-shadcn-base-radix-preset-nova.md) | shadcn は base=radix / preset=nova | 手1 | decided |
| [DR-0007](DR-0007-shadcn-output-handling.md) | shadcn 出力は整形対象外にするが lint の赤は ignore しない | 手1 | decided |
| [DR-0017](DR-0017-storybook-as-catalog.md) | ⭐ UI カタログは Storybook を採用し**手2b として挿入**（階層は役割 9 カテゴリ） | 手2b | decided |

## 発見（finding）

| ID | タイトル | 手 | 効く先 |
|---|---|---|---|
| [DR-0008](DR-0008-poc-tailwind-not-wired.md) | PoC の Tailwind はアプリに配線されていない | 手0 | 手9・PoC |
| [DR-0009](DR-0009-nextjs-rewrites-tsconfig.md) | Next.js 16 は build 時に tsconfig.json を書き換える | 手0 | 手9・PoC |
| [DR-0010](DR-0010-shadcn-invents-values.md) | ⭐ shadcn 自身が任意値を発明している — **手5 の判定は二値にできない** | 手1 | **手5** |
| [DR-0011](DR-0011-lint-rule-overdetects.md) | no-arbitrary-value は「値の発明」と「構文上の指定」を区別しない | 手1 | PoC ADR-0019 |
| [DR-0012](DR-0012-shadcn-supplies-no-layout-no-spacing.md) | ⭐ shadcn は Layout プリミティブも spacing / typography トークンも供給しない | 手1 | **手2・手3** |
| [DR-0013](DR-0013-shadcn-holds-no-state-except-sidebar.md) | ⭐ shadcn は state を持たない — 例外は Sidebar 1 つ | 手1 | **手3** |
| [DR-0014](DR-0014-exact-optional-property-types-incompatible.md) | ⭐ `exactOptionalPropertyTypes` と shadcn は非互換 | 手1 | **手3**・手9 |
| [DR-0015](DR-0015-findings-against-component-philosophy.md) | 共通コンポーネント思想への指摘 3 点 | 手1 | ユーザー判断 |
| [DR-0016](DR-0016-shadcn-deps-are-caret-ranges.md) | shadcn が追加する依存は `^` レンジ | 手1 | 手5・手9 |
| [DR-0018](DR-0018-design-sync-takes-preview-html.md) | ⭐ `/design-sync` が受け取るのは**プレビュー HTML** — story も React も渡らない | — | **手6**・手2b |

⭐ = 後続の手の作業内容を直接変えるもの。

## PoC へ戻す候補（手9 でまとめて起票）

| DR | 行き先 | 内容 |
|---|---|---|
| DR-0008 | OBS 候補 | `@tailwindcss/postcss` が catalog に無い＝Tailwind 未配線の機械的証拠 |
| DR-0009 | 🟥 要確認 → OBS | `next build` 後に `git diff apps/redmine/tsconfig.json` を見る |
| DR-0010 | OBS-0003 の前提 | 「箱を触らずテーマだけ変える」は shadcn では部分的にしか成立しない |
| DR-0011 | ADR-0019 の材料 | off リストは「ルールごと off」ではなくセレクタを絞る形が使える可能性 |
| DR-0014 | 🟥 移送時に必ず出る | `exactOptionalPropertyTypes` の扱い（3 択） |
| DR-0016 | 🟥 移送時 | catalog に 7 パッケージを厳密ピンで追加 |
