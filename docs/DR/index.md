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
| [DR-0051](DR-0051-storybook-organized-by-layer-with-viewpoint-cards.md) | ⭐ **Storybook を層で並べ、実測値を観点カードとして story に載せる**（認識合わせの仕掛け） | 手5 | decided |
| [DR-0052](DR-0052-unreachable-spots-are-avoided-by-not-using-them.md) | ⭐ **差し替えが届かない箇所は「使わない」で回避する**（上書きを重ねない） | 手5 | decided ／ 🔺 **ADR 昇格候補** |
| [DR-0055](DR-0055-finding-impact-splits-observation-from-inference.md) | DR の §影響 を「観測から直接言えること」と「推論（未検証）」に分ける（[OBS-0007](../OBS/OBS-0007_発見に推論を混ぜると後続が数え間違える.md) 昇格・3 例で 2 回ルール成立） | — | decided |
| [DR-0056](DR-0056-preset-swap-is-its-own-step.md) | **preset 差し替えは独立した手（手8b）**。手7 の「作り直しの是非」とは別軸（[OBS-0006](../OBS/OBS-0006_preset差し替えは何の検証なのか.md) 昇格・未決 #6 を閉じた） | — | decided |
| [DR-0058](DR-0058-app-only-font-never-reached-the-design-system.md) | ⭐ **本体だけが持っていたフォントを外し ① Tokens 層の既定へ戻す**（手6 D8）。`--font-sans` の自己参照を `layout.tsx` だけが埋めていた＝Storybook もプレビューも移送先も追従できない | 手6 | decided |
| [DR-0061](DR-0061-field-width-vocabulary.md) | ⭐ **フィールド幅を semantic 語彙として足す**（`--container-field-*` / `w-field-*`・手7 D10=A）。素材層のラッパー化（B）は**手8 の数字が出てから** | 手7 | decided |

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
| [DR-0018](DR-0018-design-sync-takes-preview-html.md) | ~~⭐ `/design-sync` が受け取るのは**プレビュー HTML** — story も React も渡らない~~ 🟥 **superseded → [DR-0057](DR-0057-design-sync-uploads-compiled-code-not-just-html.md)** | — | **手6**・手2b |
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
| [DR-0038](DR-0038-arbitrary-value-rule-sees-three-contexts.md) | `no-arbitrary-value` が見る文脈は **className / cva / cn の 3 つだけ** | 手3 | **手3**・PoC |
| [DR-0039](DR-0039-pattern-layer-is-not-uniform.md) | ⭐ **③ Patterns 層は一様ではない** — 3 件のうち 1 件は component の足し算で書けた | 手4 | 思想への指摘・手5 |
| [DR-0040](DR-0040-frame-leaks-when-a-layer-is-added.md) | ⭐ **枠は層を足すたびに漏れる** — 新ディレクトリは lint の射程に自動では入らない | 手4 | **手5 以降**・PoC |
| [DR-0041](DR-0041-tailwind-v4-seams-differ-per-utility.md) | ⭐ **トークンの継ぎ目は utility ごとに違う** — `font-medium`/`backdrop-blur-xs` は `var()`、`shadow-*` はリテラル | 手5 | **手5**・PoC |
| [DR-0042](DR-0042-layer-external-override-reaches-properties.md) | ⭐ レイヤ外の上書きは**プロパティにも届く** — DR-0029 §4 の射程を訂正 | 手5 | **手5**・PoC |
| [DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md) | ⭐ **手5 の「変わらない箇所」は 15 件ではなく 1 件** — 6 件は差し替え先が無く、6 件は素材層を触らず解ける | 手5 | **手5**・手9 |
| [DR-0044](DR-0044-tailwind-resolves-tokens-at-build-time-too.md) | ⭐ **「var() を出さない」と「`@theme` が効かない」は別物** — 解決は実行時 / ビルド時 / しない の 3 種。影は `@theme` で動く | 手5 | **手5**・PoC |
| [DR-0045](DR-0045-opacity-modifiers-were-invisible-to-lint.md) | ⭐ **不透明度修飾 58 箇所が事前特定から漏れていた** — 出発点に lint の赤を使ったため。色は追うが不透明度は焼き込み | 手5 | **手5**・手9・PoC |
| [DR-0046](DR-0046-theme-swap-loses-to-source-order.md) | ⭐ **トークン差し替えは「`@theme` に書く」では効かない** — 罠が 2 つ、どちらもビルドは緑。`:root:root` で詳細度に勝つ | 手5 | **手5**・**手9**・PoC |
| [DR-0047](DR-0047-cost-of-forcing-the-swap-through.md) | ⭐ **「無理をして通す」代償を実測した** — 追従 +29 と引き換えに取り残し 7・語彙 +6・内部依存 +9 | 手5 | **OBS-0005**・手9 |
| [DR-0048](DR-0048-build-storybook-does-not-render.md) | ⭐ **`build-storybook` の緑は描画を保証しない** — story が実行時に落ちても exit 0 | 手5 | **未決 #14**・手9・PoC |
| [DR-0049](DR-0049-hit-area-reaches-44px-only-at-default-size.md) | ⭐ **当たり判定 44px は default サイズだけ** — 拡張量が一律なので 4 サイズ中 2 つが未達。DR-0034 の射程を訂正 | 手5 | **未決 #23 を閉じた**・手9 |
| [DR-0050](DR-0050-three-surfaces-collapsed-into-two.md) | ⭐ **「面は 3 層」が 2 層になっていた** — 部品単位では見えず、中身の詰まったテンプレートで初めて出た | 手5 | **手5**・手9・PoC |
| [DR-0053](DR-0053-viewpoints-must-be-answerable-by-eye.md) | ⭐ **観点は「誰が答えられるか」で分ける** — 目で答えられないものを比較ペアに入れると止まる。ラベルを 3 箇所間違えていた | 手5 | **手5**・PoC |
| [DR-0054](DR-0054-mock-specimens-cannot-reproduce-stacked-states.md) | ⭐ **模型の検体は「状態の重なり」を再現しない** — フォーカス ＋ `aria-invalid` は実物で測って決着（destructive がソース順で勝つ） | 手5 | **手5**・PoC |
| [DR-0057](DR-0057-design-sync-uploads-compiled-code-not-just-html.md) | ⭐ **`/design-sync` が上げるのはコンパイル済みの実コンポーネント** — プレビュー HTML は人間用のカード。Storybook は入力かつ基準器で、Playwright は「変換」ではなく「検証」に要る（[DR-0018](DR-0018-design-sync-takes-preview-html.md) を訂正） | 手6 | **手6**・手7・手9・PoC |
| [DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md) | ⭐ **受け手が独自の機械ゲートを自動生成していた** — `_adherence.oxlintrc.json` は `.d.ts` から導出されローカルに無い。強制されるのは `<button>` → `<Button>` の 1 本だけで、**`p-4` / `text-gray-600` は検出されない** | 手7 | **手7**・手8・PoC |
| [DR-0060](DR-0060-vocabulary-leaks-from-four-surfaces.md) | ⭐ **語彙の逸脱は 4 面から出る** — 素材層の `className` はその 1 つ。🟥 **px の直当ては起きていない**（生 px / hex / style は 2 周とも 0）。根因は「代替語彙の不在」 | 手7 | **手7**・手8・PoC |
| [DR-0062](DR-0062-shipped-vocabulary-needs-safelist.md) | ⭐ **出荷する語彙は safelist しないと CSS に載らない** — 「対象 0 件で緑」の**逆向き**（書けたのに届かない）。`@source inline()` で塞いだ | 手7 | **手7**・手9・PoC |
| [DR-0063](DR-0063-forbidding-without-an-alternative-fails.md) | ⭐ **禁止だけでは破られ、代替語彙を与えると守られた** — 3 周の実測。禁止文は 1 文字も変えていないのに逸脱が 5 → 2 → **1** に減った。減らし方は「部品を足す」「語彙を足す」の 2 つだけ | 手7 | **手8**・PoC |
| [DR-0064](DR-0064-design-project-receives-runtime-only.md) | ⭐ **デザインプロジェクトに複製されるのはランタイムだけ** — `components/**` も `guidelines/**` も届かない。header は**ファイルではなく system prompt** で効いている。🟥 日本語ファイル名は 401（agent 自身の報告・3/3） | 手7 | **手9**・PoC |

⭐ = 後続の手の作業内容を直接変えるもの。／ 🔺 = **ADR 昇格候補**（一度決めると戻しにくい・外から見える規約に影響する）。**起案はまだしない**（判定と起案を分ける）。

> 🟥 **DR-0030 は [DR-0023](DR-0023-real-conflict-is-touch-target.md) の発見 2 を訂正する**（発見 1・3 は維持）。
> 🟨 **DR-0029 は [DR-0022](DR-0022-shadcn-has-component-tokens.md) の射程を拡張する**（「唯一の接続点」→「接続方式」）。
> 🟥 **DR-0042 は [DR-0029](DR-0029-component-token-overridable-outside-layer.md) §4 の但し書きを訂正する**（「効くのは変数だけ」→ 任意値にも届く）。
> 🟥 **DR-0043 は [トークンマッピング §5](../トークンマッピング.md) の「15 件」を 1 件へ更新する**（[DR-0010](DR-0010-shadcn-invents-values.md) の見立ては緩和方向に外れた）。
> 🟥 **DR-0044 は [DR-0041](DR-0041-tailwind-v4-seams-differ-per-utility.md) の「影響」節の推論を訂正する**（観測した CSS 出力の表は維持）。
> 　あわせて **[DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md) の内訳が動く**（影 7 箇所が 乙 → 甲。**丙 1 件という結論は変わらない**）。
> 🟥 **DR-0045 は [DR-0043](DR-0043-recount-of-fifteen-unchanged-spots.md) に第 5 の分類「丁（部分追従）」を足す**（17 種 60 箇所。**丙 1 件は変わらない**）。
> 🟥 **DR-0049 は [DR-0034](DR-0034-touch-target-visual-32-hit-44.md) の「44px が成立している」を訂正する**（決定＝見た目と当たり判定を分けることは維持。成立は `default` と `lg` のみ）。
> 🟥 **DR-0057 は [DR-0018](DR-0018-design-sync-takes-preview-html.md) を supersede する**（「story も React も渡らない」「フラグを載せる場所は無い」の 2 点が誤り。`group` と `thin` / `variantsIdentical` は維持）。**手6 の作業内容が書き換わった。**
> 🟥 **DR-0058 は [DR-0026](DR-0026-two-css-pipelines-differ.md) の「判定は Storybook 側に固定する」の前提を 1 点訂正する**（色空間は等価だったが**フォントは等価ではなかった**）。あわせて **手5 の観点 D タイポの判定がセリフ体の上で行われていた**ことになる。

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
| DR-0038 | 🟥 OBS 候補 | 任意値禁止は `cva` / `cn` / `className` を経由しない文字列を検査しない |
| DR-0039 | OBS 候補 | ③ 層に置く条件は「状態を持つ」or「複数カテゴリをまたぐ」。packages/ui の層構成に効く |
| DR-0040 | 🟥 OBS 候補 | ディレクトリ単位の規約は**層を足すたびに漏れる**。運用手順が要る |
| DR-0041 | 🟥 OBS 候補 | Tailwind v4 で「トークンを差し替えれば追従する」は **utility 単位で成否が割れる**。ソースを見ても分からず生成 CSS を見る必要がある |
| DR-0042 | 🟥 OBS-0003 の材料を訂正 | 案B の「レイヤ外からの上書き」は**任意値にも届く**。ただし変異を潰すので「向け替え」と「上書き」を区別して書く |
| DR-0043 | 🟥 OBS-0003 の前提を更新 | 「箱を触らずテーマだけ変える」の**不成立範囲は見積もりより 1 桁小さい**（15 → 1） |
| DR-0044 | 🟥 OBS-0003 の材料を訂正 | テーマ差し替えの可否は「**実行時に切り替わるか**」と「**ビルドし直せば変わるか**」を分けて論じる。`shadow-*` は後者だけ成立する |
| DR-0045 | 🟥 ADR-0019 / OBS 候補 | **任意値禁止 lint は `/NN` を見ない。**「トークン化されていない値」の集合は lint の赤では取れない（DR-0028 の穴に 1 つ追加） |
| DR-0046 | 🟥 **移送時に必ず出る** | shadcn の `globals.css` は `@theme inline` + `:root` の 2 段構え。テーマ差し替えは**詳細度で勝つ**必要があり、`@import` は末尾に置けない |
| DR-0047 | 🟥 OBS-0003 の材料 | 案B に「レイヤ外上書き」を入れるなら**代償 3 種を明記する**。特にユーティリティクラス名への依存は「shadcn を更新できない」形で返る |
| DR-0048 | 🟥 architecture.md の材料 | 「story を単一ソースにする」なら、**`build-storybook` の緑が何を保証しないか**を明示する |
| DR-0049 | 🟥 ui.md の材料 | a11y 規約を「当たり判定」に書くなら、**サイズごとに**成立を確かめる。固定拡張では小さい variant が届かない |
| DR-0050 | 🟥 OBS 候補 | **写し方の誤りは部品カタログでは検出できない。**面の構成はテンプレートでしか測れない |
| DR-0053 | 🟥 OBS 候補 | レビュー観点を設計するときは「**誰が答えられるか**」を先に決める。目視と機械を混ぜると止まる |
| DR-0054 | 🟥 OBS 候補 | レビュー用の検体は「**単独の見た目**」と「**状態の重なり**」で作り分ける。模型（素の div）は後者を再現しない。あわせて **shadcn のリングは 1 本しか出ない**＝エラー中の入力欄はフォーカスしても見た目が変わらない |
| DR-0055 | 🟥 候補 | PoC も DR / OBS 台帳を持つ。**finding に推論を混ぜる問題は同型で起きる**ので、§影響 の割り方をそのまま渡せる |
| DR-0056 | 🟥 要確認 | PoC が shadcn を採るなら、**preset の選定と差し替え可能性は同じ論点**になる |
| DR-0057 | 🟥 architecture.md の材料 | 「UI カタログ = Storybook」は好みの問題ではない。**Claude Design 連携の入力形式そのもの**。あわせて **packages/ui を「ライブラリとしてビルドできる形」にしておく**必要がある（converter がビルド済み `dist/` を要求する） |
| DR-0059 | 🟥 architecture.md / ui.md の材料 | **`.d.ts` の props 型が「相手側の lint 規則」に化ける。**公開 API の型は規約そのものとして扱う（型の鮮度 = 規則の正しさ）。あわせて **任意値禁止は境界の向こうでは効かない**ので、規約は散文でも書く |
| DR-0060 | 🟥 ui.md / architecture.md の材料 | **任意値禁止を掲げるなら、禁止した用途に代替語彙を必ず用意する。**用意しない禁止は破られる。あわせて **ReactNode / 関数を受ける props は枠の外**になる |
| DR-0061 | 🟥 ui.md の材料 | 「**ページ幅**」と「**コントロール幅**」は別の語彙。前者だけ定義すると後者が任意値で書かれる |
| DR-0062 | 🟥 architecture.md の材料 | **消費者が書く語彙**を持つ設計システムは、Tailwind の使用検出だけでは出荷できない（safelist が要る） |
| DR-0063 | 🟥 ui.md / ADR-0019 の材料 | **任意値禁止は「禁止と代替の対」で書く。**禁止だけの規約は破られることが実測で出た |
| DR-0064 | 🟥 architecture.md の材料 | **日本語ファイル名を成果物のパスに使わない。**あわせて「移送先が実際に受け取るもの」を出荷物の一覧と混同しない |
| DR-0052 | 🟥 ui.md / architecture.md の材料 | 「トークンで統一する」を掲げるなら、**届かない箇所の扱い**を規約として決めておく必要がある |
| DR-0051 | 🟥 architecture.md の材料 | 「UI カタログ = Storybook」だけでは足りない。**カタログ（部品軸）とレビュー（判定軸）は別の並べ方が要る** |
| DR-0024 | 🟥 catalog に追加 | storybook / @storybook/nextjs-vite / addon-a11y / addon-docs / eslint-plugin-storybook / vite の **6 件を厳密ピンで**（shadcn の 7 件と合わせて 13 件） |
