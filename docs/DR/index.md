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
| [DR-0019](DR-0019-semantic-spacing-typography-vocabulary.md) | semantic な spacing / typography は**用途名で自前定義**する（Tailwind 既定を semantic とみなさない） | 手2 | decided |
| [DR-0020](DR-0020-dark-mode-out-of-scope.md) | dark モードはトークン差し替えの**対象外**とする | 手2 | decided |
| [DR-0024](DR-0024-storybook-render-only-and-gate.md) | Storybook は**描画のみ（+ a11y）**で導入し `storybook build` を機械ゲートに追加する | 手2b | decided |
| [DR-0032](DR-0032-layout-primitives-take-props-not-classname.md) | ⭐ Layout プリミティブは **props で semantic 名だけ**受ける（`className` は Box のみ） | 手3 | decided ／ 🔺 **ADR 昇格候補** |
| [DR-0033](DR-0033-step5-criteria-differ-per-layer.md) | ⭐ 手5 の判定基準を**層ごとに変える**（「触ったか」→「何を書いたか」） | 手3 | decided ／ 🔺 **ADR 昇格候補** |
| [DR-0034](DR-0034-touch-target-visual-32-hit-44.md) | ⭐ タッチターゲットは**見た目 32px ／ 当たり判定 44px**（nav-item のみ見た目も 44px） | 手3 | decided ／ 🔺 **ADR 昇格候補** |
| [DR-0035](DR-0035-sidebar-stays-as-vendor.md) | Sidebar の状態は **shadcn のまま**使う（製品層は薄いラッパーのみ） | 手3 | decided |
| [DR-0036](DR-0036-card-spacing-points-to-semantic.md) | `--card-spacing` を **semantic 層へ向け替える**（レイヤ外の 2 規則） | 手3 | decided |
| [DR-0037](DR-0037-providers-belong-to-product-layer.md) | Provider は**製品層が持つ**（部品ではなく「動くための前提条件」だから） | 手3 | decided |

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
| [DR-0021](DR-0021-tailwind-scans-docs-markdown.md) | ⭐ Tailwind v4 は `docs/**.md` を走査し**文章中のクラス名を本番 CSS に生成する** | 手2 | **手5**・PoC |
| [DR-0022](DR-0022-shadcn-has-component-tokens.md) | ⭐ 思想の 3 層は**3 層とも実在する**（component token は有る）。欠けるのは spacing / typography だけ | 手2 | 手3・段取り訂正 |
| [DR-0023](DR-0023-real-conflict-is-touch-target.md) | ⭐ tmp-admin と nova の本当の衝突は accent ではなく**タッチターゲット 44px** | 手2 | **手3**・手9 |
| [DR-0025](DR-0025-storybook-init-is-not-selectable.md) | ⭐ `storybook init` は描画のみを選べず、eslint 設定を壊し、`.storybook/**` はゲート射程外だった | 手2b | **手9**・PoC |
| [DR-0026](DR-0026-two-css-pipelines-differ.md) | 本体と Storybook は同じトークンを**別形式で出力する**（oklch ↔ hex+lab） | 手2b | 手5・PoC |
| [DR-0027](DR-0027-token-swap-not-detectable-by-css-diff.md) | ⭐ トークン差し替えは**生成 CSS の diff では判定できない** — 手5 の判定方法が確定 | 手2b | **手5** |
| [DR-0028](DR-0028-token-frame-is-not-closed.md) | ⭐ **「定義した値しか使わせない」枠は閉じていない** — lint は角括弧しか見ず、閉じると素材層が死ぬ | 手3 | **手3 D4/D11**・手5・PoC |
| [DR-0029](DR-0029-component-token-overridable-outside-layer.md) | ⭐ component token は**カスケードレイヤの外から**部品を触らず向け替えられる | 手3 | **手3 D8**・**手5** |
| [DR-0030](DR-0030-touch-target-provenance-corrected.md) | ⭐ 44px は**全コントロールの不可侵下限ではない** — DR-0023 の発見 2 を訂正 | 手3 | **手3 D7**・手9 |
| [DR-0031](DR-0031-sidebar-red-is-not-state.md) | Sidebar の赤 17 件のうち 11 件は任意値 — **state を切り出しても減らない** | 手3 | **手3 D6/D10** |

⭐ = 後続の手の作業内容を直接変えるもの。／ 🔺 = **ADR 昇格候補**（一度決めると戻しにくい・外から見える規約に影響する）。**起案はまだしない**（判定と起案を分ける）。

> 🟥 **DR-0030 は [DR-0023](DR-0023-real-conflict-is-touch-target.md) の発見 2 を訂正する**（発見 1・3 は維持）。
> 🟨 **DR-0029 は [DR-0022](DR-0022-shadcn-has-component-tokens.md) の射程を拡張する**（「唯一の接続点」→「接続方式」）。

## PoC へ戻す候補（手9 でまとめて起票）

| DR | 行き先 | 内容 |
|---|---|---|
| DR-0008 | OBS 候補 | `@tailwindcss/postcss` が catalog に無い＝Tailwind 未配線の機械的証拠 |
| DR-0009 | 🟥 要確認 → OBS | `next build` 後に `git diff apps/redmine/tsconfig.json` を見る |
| DR-0010 | OBS-0003 の前提 | 「箱を触らずテーマだけ変える」は shadcn では部分的にしか成立しない |
| DR-0011 | ADR-0019 の材料 | off リストは「ルールごと off」ではなくセレクタを絞る形が使える可能性 |
| DR-0014 | 🟥 移送時に必ず出る | `exactOptionalPropertyTypes` の扱い（3 択） |
| DR-0016 | 🟥 移送時 | catalog に 7 パッケージを厳密ピンで追加 |
| DR-0021 | 🟥 OBS 候補 | PoC も Tailwind v4。**`docs/` に書いたクラス名が本番 CSS に入る**（PoC の docs は巨大） |
| DR-0022 | OBS-0003 の前提 | 「shadcn は semantic 1 層」は誤り。3 層とも実在するので案B の議論の土台が変わる |
| DR-0023 | 🟥 ui.md の材料 | a11y のタッチターゲット下限（44px）を規約に置くかどうか |
| DR-0025 | 🟥 移送時に必ず出る | `storybook init` は既定を選べない＝**init 後に削る工程**が要る。`.storybook/**` を tsconfig の `include` に足さないと「検査していないのに緑」 |
| DR-0026 | OBS 候補 | Storybook を入れると CSS パイプラインが 2 本になる。値は等価だが色の出力形式が違う |
| DR-0028 | 🟥 OBS 候補 | PoC も `no-arbitrary-value: error` を持つが、**`p-13` / `w-99` は素通りする**＝「任意値禁止」は枠になっていない |
| DR-0029 | OBS-0003 の材料 | テーマ 2 層構造（案B）に「**レイヤ外からの上書き**」という手が加わる。部品を触らずに component token を semantic へ載せられる |
| DR-0030 | 🟥 ui.md の材料 | a11y のタッチターゲットは **24px（AA）が適合ライン**で 44px は AAA。DR-0023 の前提が変わる |
| DR-0032 | 🟥 ui.md の材料 | **任意値禁止 lint だけでは枠が閉じない。**部品 API 側の規約（上位部品は className を受けない）が要る |
| DR-0033 | 🟥 OBS 候補 | 判定基準は層ごとに変える。**PoC でも `no-restricted-syntax` 2 セレクタの追加が要る** |
| DR-0034 | 🟥 ui.md の材料 | a11y のタッチターゲット規約は「見た目」ではなく**「当たり判定」に対して**書く |
| DR-0036 | OBS-0003 の材料 | 案B に「**レイヤ外からの上書き**」を足せる |
| DR-0037 | OBS 候補 | 役割分類に「部品でないもの（Provider / Context）」の置き場が無い問題は PoC にも波及する |
| DR-0024 | 🟥 catalog に追加 | storybook / @storybook/nextjs-vite / addon-a11y / addon-docs / eslint-plugin-storybook / vite の **6 件を厳密ピンで**（shadcn の 7 件と合わせて 13 件） |
