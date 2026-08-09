# DR 索引

> 1 ファイル = 1 決定 or 1 発見。形式の正本は [_template.md](_template.md)。
> `decision` = 決めたこと／`finding` = 分かったこと。**決定は不変に積む**（覆すときは新 DR で supersede）。

## 決定（decision）

| ID | タイトル | 手 | 状態 |
|---|---|---|---|
| [DR-0001](DR-0001-repo-role-and-deliverable.md) | 🟥 **superseded → [DR-0078](DR-0078-repo-becomes-a-ui-factory-for-a-core-design-system.md)** ~~本 repo の役割はワークフロー検証・成果物は「決定 + 移送可能なコード」~~ | — | superseded |
| [DR-0002](DR-0002-verify-three-layers-not-screens.md) | 🟥 **superseded → [DR-0078](DR-0078-repo-becomes-a-ui-factory-for-a-core-design-system.md)** ~~検証対象は画面ではなく 3 層（Tokens / Components / Patterns・Templates）~~（3 層が資産の主であることは DR-0078 が引き継ぐ） | — | superseded |
| [DR-0003](DR-0003-foundation-mirrors-poc.md) | 🟥 **superseded → [DR-0080](DR-0080-strict-pins-stay-for-reproducibility.md)** ~~土台は PoC と同一版・同一 lint の単体 Next.js アプリ~~（ピンと lint は残る・理由が変わる） | 手0 | superseded |
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
| [DR-0068](DR-0068-merge-through-pull-requests.md) | 手の完了は **GitHub の PR** でマージする（ローカルの `--no-ff` は使わない）。CLAUDE.md §git を書き換えた | — | decided |
| [DR-0070](DR-0070-product-layer-boundary-rule.md) | 🟥 **superseded → [DR-0077](DR-0077-abolish-the-two-occurrence-rule.md)** ⭐ **素材層と製品層の境界は「見た目の管轄権」＋判定手順で決める**（~~① 2 回以上出たか~~ ／ ① トークン語彙の有限集合で表せるか ② 誰の責務か）。6 周の逸脱が全件分類できた。**落ちたのは回数の段だけで分類結果は不変**。🔺 **ADR 昇格候補** | 手8c | superseded |
| [DR-0077](DR-0077-abolish-the-two-occurrence-rule.md) | 🆕 ⭐ **2 回ルールを廃止する** — 「同じ需要が 2 回証明されるまで作らない」を判断の条件にしない（ユーザー判断 2026-08-07）。**回数は記録する観測量としては数え続ける**が、「1 回目だから」は今後**理由にならない**。🟥 **この規律が判断を止めていた箇所は 6 件**（OBS-0013・未決 #14・指摘 11・指摘 3・AllVariants・予防的ラッパー）。★ **規律自身が例外を必要とした実例が 1 件**（DR-0076 が「2 回ルールを前倒しした」と明記）。🟥 **推論: 床（ばらつき）を測らずに済ませる代用品として働いていた可能性** → 手8f Q1 が実測する | — | decided |
| [DR-0072](DR-0072-no-passthrough-of-dependency-types.md) | ⭐ **依存パッケージの型は公開 API に素通ししない**——Omit で選別し自層の名前で出し直す（`ColumnDef` → `DataGridColumn`）。素通しはコード所有モデル（shadcn 型）でだけ成立する。🔺 **ADR 昇格候補** | 手8c | decided |
| [DR-0076](DR-0076-capture-the-run-not-just-the-output.md) | 🆕 ⭐ **生成の周は「成果物」と「過程」の両方を持ち帰り、数え上げを予測の照合で終えない** — 予測を登録した時点で数え方が予測のコピーになり、**予測の外は「0 件」ですらなく欄が無い**（「対象 0 件で緑」の測定版）。判断を動かした観測が **3 回とも装置の外**から来た。① ツールトレースを人が `artifacts/h<N>/` へ ② 成果物を 1 回通しで読む ③ 予測表に「予測していない箇所」の行。🟥 **手段は 1 例の証拠——効かなければ ① を捨てる** | 手8e | **8 周目**・手9・PoC |

| [DR-0078](DR-0078-repo-becomes-a-ui-factory-for-a-core-design-system.md) | 🆕 ⭐ **repo の役割は「UI 工場」— 目的は自分用コアデザインシステム（スーパーセット）、Redmine 5 画面は題材**（ユーザー判断 2026-08-07）。レイアウトもコアに含める。PoC への移送は廃止。**PoC 前提の現役 DR は 22 件だが、決定の本体まで崩れるのは 0001〜0003 の 3 件だけ** | 工程0 | decided |
| [DR-0079](DR-0079-ship-via-git-dependency-and-claude-design.md) | 🆕 **出荷口は git 依存 ＋ Claude Design の 2 経路**。`/design-sync` は検証装置から**工場の出荷経路**へ（未決 #2 の答え）。npm publish は使い回し先が 1 つ出てから | 工程0 | decided |
| [DR-0080](DR-0080-strict-pins-stay-for-reproducibility.md) | 🆕 **厳密ピンは残す — 理由を「PoC と同一版」から「工場の再現性・観測の 1 変数化」へ書き換える**。lint 構成も工場自身の規約として引き取る。DR-0014 の借金は返済期限を失ったが残る | 工程0 | decided |
| [DR-0081](DR-0081-poc-feedback-redirected-to-factory-conventions.md) | 🆕 **`poc_feedback` は「工場の規約へ戻す候補」に読み替える**。フィールド名と既存 77 件（非 null 64 件）は書き換えず、規約起草時の材料リストとして読む。規約文書の起草はまだしない | 工程0 | decided |
| [DR-0087](DR-0087-fetching-belongs-to-the-subject-layer.md) | 🆕 ⭐ **取得は題材の層（`src/redmine`）だけが持ち、コアは題材を知らない** — 着手前の実測で**この repo に `fetch` が 0 件**だった＝ MSW を入れるとは「無かった層を新設する」こと。**規約ではなく lint 2 本で守る**（`fetch` 直書き禁止 ＋ コアから題材への import 禁止・**両方とも赤テストで発火を確認**）。[DR-0081](DR-0081-poc-feedback-redirected-to-factory-conventions.md)（工場の規約へ戻す候補）の**最初の実例**。★ 判定規則の候補が見えた——**コアは語彙、題材は対応表** | 工程2 | decided |
| [DR-0088](DR-0088-core-subject-boundary-is-decided-by-two-questions.md) | 🆕 ⭐ **コア / 題材の判定は 2 問で行う**——① 他所（Redmine を知らない repo）で意味が通るか → 通らないなら題材 ② 有限の語で言えるか → 言えるなら語彙・言えないならコアは**器だけ**。候補「コアは語彙、題材は対応表」は**前半しか裁けなかった**（固有物 11 件中、対応表の形は 5 件。残り 6 件は「本文」で、裁いたのは ①）。**語彙は固定ではない**——`all` が題材の需要で 1 語昇格した | 工程3 | decided |
| [DR-0089](DR-0089-overlays-do-not-cover-their-anchor.md) | 🆕 ⭐ **オーバーレイはアンカーに重ねない**（`position="popper"` ／ `align="start"` を製品層で固定し、**prop にしない**）。上流既定の `item-aligned` は**トリガ 32px のうち 30px を隠していた**。🟦 幅を揃える語彙は**作らずに済んだ**——popper の `min-w-(--radix-select-trigger-width)` が要求を満たす（DR-0088 の問い② に「語彙を作らない」で答えた例） | — | decided |

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
| [DR-0063](DR-0063-forbidding-without-an-alternative-fails.md) | ⭐ **禁止だけでは破られ、代替語彙を与えると守られた** — 3 周の実測。禁止文は 1 文字も変えていないのに逸脱が 5 → 2 → **1** に減った。減らし方は「部品を足す」「語彙を足す」の 2 つだけ | 手7 | **手8**・PoC ／ 🔺 **ADR 昇格候補**（🟨 導出される規則が候補・下記） |
| [DR-0064](DR-0064-design-project-receives-runtime-only.md) | 🟥 **superseded → [DR-0075](DR-0075-design-side-reads-the-design-system-directly.md)** ⭐ **デザインプロジェクトに複製されるのはランタイムだけ** — `components/**` も `guidelines/**` も**複製されない**（ここは生きている）。🟥 **「だから届かない」は誤りだった。**header は**ファイルではなく system prompt** で効いている。🟥 日本語ファイル名は 401（agent 自身の報告・3/3） | 手7 | **手9**・PoC |
| [DR-0065](DR-0065-claude-design-uses-the-registered-components.md) | ⭐★ **Claude Design は登録した部品を「使う」** — 明示なしの 1 周目から `<div>` `<button>` `<table>` 0 件。**足せば足すだけ使う**（種類 10 → 17 → 18）。**段取り §5 の分岐は「使う」側に決した** | 手7 | **手8**・**手9**・PoC |
| [DR-0066](DR-0066-neither-side-lints-the-generated-output.md) | ⭐★ **生成物は境界のどちら側でも検査されていない** — 我々は 6 本中 **0 本**。受け手は `no-restricted-syntax` が oxlint に無く**設定ごと parse 不能**。56 セレクタが走ったと仮定しても**当たる 5 件は全部偽陽性**（`.d.ts` からの props 抽出が継承分を落としている）。「食い違い」ではなく「**どちらも見ていない**」 | 手8 | **手9**・PoC ／ 🔺 **ADR 昇格候補**（🟨 同上） |
| [DR-0067](DR-0067-inherited-asset-was-not-inheritable.md) | ⭐ **「引き継ぐ」と書いた資産が引き継げなかった** — CC-Skills の GitHub は `Initial commit` の README 1 枚。`validate.mjs` / `anti-slop.mjs` は**存在しない**。本 repo は「🟦 流用できる」と判定しただけで**中身を一度も写していなかった** | 手8 | **段取り §7 の訂正**・PoC |
| [DR-0069](DR-0069-adding-prohibitions-to-the-header-degraded-the-output.md) | ⭐★ **規約ヘッダに禁止を足したら、禁止した箇所以外が壊れた** — 禁止 3・語彙 0 を 842 バイト足したら、`<style>` と `tabular-nums` は消えた一方で **`Container` / `Section` / `DataGrid` が消え、表を素材層で手組みし始めた**。🟥 **予測表だけ見れば「成功」だった**——壊れたのは予測していない場所で、2 周ともユーザーの目視でしか見つからなかった。🟦 **戻したら 6 周目で全部戻り、因果が確定した**（`class=` もヘッダ由来だった） | 手8 | **手9**・PoC ／ 🔺 **ADR 昇格候補**（🟨 finding） |
| [DR-0071](DR-0071-closed-product-layer-is-viable.md) | ⭐ **className を閉じた製品層は成立する**（Polaris・React Spectrum が 7 年以上運用）——ただし**閉じた 2 本とも部品の外に出口を対で持つ**（トークン props の Box／UNSAFE_ 接頭辞＋許可リスト）。逃げ道を開けた側の管理コストも実測あり（Primer は sx を v38 で完全廃止）。**S2 の style macro は許可リストを型で機械化**＝指摘 11 の実装例が実在する | 手8c | DR-0032 の外部裏取り・**手9**・PoC |
| [DR-0074](DR-0074-we-wrote-the-same-deviations-ourselves.md) | 🆕 ⭐ **規約から外れていたのは受け手だけではない**——`SelectTrigger` を閉じた瞬間に `tsc` が我々の story の **`className="w-48"`**（r1 の逸脱と同一）を型エラーで出した。一覧の書式クラス（`font-mono` / `tabular-nums`）も画面と story 3 本にあった。🟥 **`w-48` は lint・typecheck・storybook・手7 の棚卸しの 4 つを通り抜けていた**。🟥 **推論: story は `.prompt.md` の実例源なので、禁止した書き方を実例として渡していた可能性**（7 周目に grep で検証） | 手8d | **7 周目**・PoC |
| [DR-0073](DR-0073-context-replay-not-payload-burned-the-limit.md) | 🆕 **使用制限を焼いたのはコンテキストの再読** — 97 往復 × 平均 278k で入力 **49.2M**。同区間のツール実行結果は**全部で 36,586 文字**（比で 4,700 倍）。セッションを跨ぐ再開で初期コストが 28k → **190k**、長コンテキストのモデルでは **auto-compact が 353k まで発火しない**。subagent は 5 本中 2 本が完走しても**通知不着**（5.1M が捨てられた） | — | **OBS-0012**・PoC |
| [DR-0075](DR-0075-design-side-reads-the-design-system-directly.md) | 🆕 ⭐★ **デザイン側は複製に頼らずデザインシステムを直接読む** — 7 周目のツールトレースで、agent が**デザインシステムの projectId を直接 list し `AppShell` / `DataGrid` / `Select` の `.prompt.md` を読んで**いた（**手8d で動かした 3 部品ちょうど**）。複製は今も 6 ファイルのままなので、**「複製されない」と「読めない」は別**。🟥 **DR-0064 の §影響 1・2 は観測ではなく推論だった**（[OBS-0007](../OBS/OBS-0007_発見に推論を混ぜると後続が数え間違える.md) の形の 2 例目）。🟦 あわせて **story → `.prompt.md` → agent の経路が閉じ**、DR-0074 の推論が確定した | 手8e | **手9**・**8 周目**・PoC |
| [DR-0082](DR-0082-vite-build-prints-type-errors-but-exits-zero.md) | 🆕 ⭐ **`vite build` は型エラーを赤い字でログに出しながら exit 0 で通る** — dts の診断は「解決不能」（K2）では落ち「型の不整合」（K1）では落ちない。**工程1 以降、型を止めるゲートは `tsc --noEmit` の 1 本だけ**。「対象 0 件で緑」とは別種——**ログに赤が在っても終了コードが 0** | 工程1 | 全ゲート運用 |
| [DR-0083](DR-0083-lib-build-silently-strips-use-client.md) | 🆕 **lib ビルドは `'use client'` を警告 0 で剥がす** — ソース 4 ファイルに在るが `dist/design.mjs` には 0 件。**D4「残す」はソースの話でしかなく出荷物には効いていない**。git 依存（DR-0079）で Next の利用者に dist を向けると Client 境界が失われた状態で届く | 工程1 | 出荷（git 依存） |
| [DR-0084](DR-0084-comments-in-config-files-leak-into-shipped-css.md) | 🆕 **設定ファイルのコメントに書いたクラス名が配布 CSS に湧く** — `eslint.config.mjs` の禁止規則の説明文（`text-gray-600` / `p-13`）が Tailwind の走査に拾われ、**src で 0 使用のクラスが CSS に生成されている**。docs 側の穴（DR-0021）と同じ形が `.mjs` にも。docs-only の `p-7` は出ない＝ `@source not` は移設後も効いている | 工程1 | 出荷 CSS の純度 |
| [DR-0085](DR-0085-three-independent-scopes-decide-what-ships.md) | 🆕 ⭐ **`dist` に何が入るかを決める規則は 3 本あり互いに独立** — ① JS = entry からの到達可能性 ② `.d.ts` = dts の `include`（ディレクトリ） ③ 静的ファイル = `publicDir` の丸ごとコピー。題材を足したら **`.d.ts` 8 件と `mockServiceWorker.js` が出荷物に混ざった**（JS は 0 バイト増）。**「出荷面は `src/index.ts` の 1 本」は誤り**。DR-0040 の裏形（漏れる先が検査ではなく出荷） | 工程2 | 出荷（git 依存・Claude Design） |
| [DR-0086](DR-0086-redmine-has-no-baseline-for-evm.md) | 🆕 ⭐★ **Redmine は EVM の計画も進捗の日次履歴も返さない** — PV は**ベースラインが無い**ので導出しかできず（期限を動かすと過去の PV も動く）、EV は **`include=journals` が単票専用**なので 60 件なら 60 リクエスト。AC だけが `spent_on` で素直に取れる。ほかに単価・稼働可能時間・非稼働日も無い。🟦 **ガントに必要なものは全部ある**＝ガントが重いのはデータではなく描画 | 工程2 | **工程7（EVM）**・工程5・工程6 |
| [DR-0090](DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md) | 🆕 ⭐★ **トークン語彙のクラスは tailwind-merge に認識されず、素材層の既定に負けていた** — `twMerge('w-fit w-field-md')` は**両方を残す**（対照: `w-full` / `w-48` / `w-[192px]` はいずれも畳む）ので CSS の出力順で `w-fit` が勝つ。**手8d で逸脱を根拠に作った `width` prop は 3 語とも一度も効いていなかった**（実測 sm 112 / md 114 / lg 105 px ＝ **sm > lg の逆転**）。🟥 **「対象 0 件で緑」の prop 版**——prop も型も lint も story も緑で、**作用だけが無い**。塞ぐと全 76 story で **11 件 → 0 件** | — | **語彙を足すたび**・出荷・工程4 以降 |
| [DR-0091](DR-0091-claude-design-is-a-fourth-shipping-entrance.md) | 🆕 ⭐ **Claude Design は 4 本目の出荷入口で、コア / 題材の境界は手書きの除外リストでしか閉じていない** — [DR-0085](DR-0085-three-independent-scopes-decide-what-ships.md) が数えた 3 本はすべて `dist` の話で、**`/design-sync` はどれにも掛からない**（判定軸は story の `title`）。題材 story が湧かなかったのは**自動ではなく `titleMap` に `null` を手で足した**結果——除外しなければ `[TITLE_UNMAPPED]` 扱いで、**既定で落ちるのではない**。[DR-0087](DR-0087-fetching-belongs-to-the-subject-layer.md) の lint 2 本は**この経路を 1 行も見ていない** | — | **工程4 以降（題材 story が増えるたび）**・出荷 |
| [DR-0092](DR-0092-the-core-holds-the-vessel-not-the-state.md) | 🆕 ⭐ **コアは器を持ち、状態は持たない** — 編集の状態管理（react-hook-form）と検証（zod）は**題材が持つ**。コアはラベル・必須の印・エラー文の置き場だけを持ち、エラーは**ただの文字列**で受ける。★ **ユーザー判断の理由「UI はできるだけ純粋に保つ」を一般則に上げた**——**出荷物に依存を 1 件足すことは、使い回し先全部がその依存を取ること**。足す前に器（依存 0）で済む形を探す。🟦 [DR-0088](DR-0088-core-subject-boundary-is-decided-by-two-questions.md) の 2 問がそのまま答えを指した（固有物 12 件に当て、裁けなかった 2 件を名指し）。🟥 **2 問だけでは決まらない例が 1 件出た**（保存の単位） | — | **工程6（素材源の判断）**・出荷 |
| [DR-0093](DR-0093-shadcn-radix-nova-is-not-a-single-primitive-source.md) | 🆕 ⭐ **shadcn の `radix-nova` style は radix 1 本ではない** — レジストリを 18 件引くと **`combobox` の `dependencies` は `["@base-ui/react"]`**（radix と同格の primitive 源）。**`style` 名は素材源を保証しない。**[段取り §2](../工場の段取り.md) が「2 つ目の素材源を入れる判断」を**工程6 の重い判断**として置いているのに、**`combobox` を足すだけで裏口から入る**（[DR-0085](DR-0085-three-independent-scopes-decide-what-ships.md) と同型）。🟦 在庫 29 件には混入 0（`@base-ui/*` は `package.json` に 0 件） | — | **工程6（素材源の判断）**・部品を足すたび |
| [DR-0094](DR-0094-the-bar-engine-ran-without-any-css.md) | 🆕 ⭐★ **完成バーの実行エンジンは CSS を 1 行も当てずに走っていた** — `vitest.config.ts` は `vite.config.ts` から `resolve.alias` **だけ**を引いており、`@tailwindcss/vite` を引いていなかった＝ `@import 'tailwindcss'` が展開されず **utility が 1 つも生成されない**。実測: `Switch/sm` の幅 **0**・`Avatar/sm` **16px**（文字幅）・thumb 背景 **透明**——**全部「素の HTML の値」**。🟥 **`waitFor` では直らない**（競合ではない）。★★ **冒頭コメントが「jsdom は CSS を計算しないので実ブラウザにする」と書いているのに、その理由そのものが動いていなかった。**🟦 部品1 の「critical 0」は無効にならない（名前系の rule は CSS に依存しない） | — | **バーを使うたび**・面④・a11y |

⭐ = 後続の手の作業内容を直接変えるもの。／ 🔺 = **ADR 昇格候補**（一度決めると戻しにくい・外から見える規約に影響する）。**起案はまだしない**（判定と起案を分ける）。

> 🆕 **2026-08-02 の判定で候補が 4 → 6 件になった。**ただし**性質が 2 種類に割れた。**
>
> | 種別 | 候補 | 起案でやること |
> | --- | --- | --- |
> | **decision がそのまま候補** | DR-0032 / DR-0033 / DR-0034 / DR-0052 ／ 🆕 **DR-0070**（層境界の判定規則）／ 🆕 **DR-0072**（依存の型の扱い）＝手8c で +2 | **決定文がすでにあるので、MADR の形へ移すだけ** |
> | 🟨 **finding から規則を導く必要がある** | **DR-0063**（禁止と代替の対）／ **DR-0066**（規約と検査の射程はセット）／ 🆕 **DR-0069**（禁止を足す代償） | 🟥 **起案の前に「決定」を 1 本書く工程が要る。**finding は「こうだった」であって「こうする」ではない |
>
> 🟥 **この 2 種類を混ぜて起案すると、後者は根拠だけあって決定文が無い ADR になる。**

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
> 🟥 **DR-0066 は [DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md) を 2 点訂正する**（① 受け手の lint は「飾り」ではなく**設定ごと parse 不能** ② §影響 3 の「型の質が規則の質を決める」は原因の取り違えで、**型は正しく抽出が浅かった**）。**観測部は維持。**
> 🟨 **手8 H8-09 は [DR-0064](DR-0064-design-project-receives-runtime-only.md) §3 の数を更新する**（宛先の無い参照は **1 件ではなく 4 件**だった。4 件とも削って書き換え済み・効き目は未測定）。

## 工場の規約へ戻す候補（旧: PoC へ戻す候補）

> 🆕 **2026-08-07（工程0）: 宛先を PoC から「工場の規約」へ読み替えた**（[DR-0081](DR-0081-poc-feedback-redirected-to-factory-conventions.md)）。
> 表の中身は書き換えない——「ui.md / architecture.md の材料」等の行き先表記は、**本 repo 自身が持つことになる規約文書**（未起草）の材料として読む。

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
| DR-0065 | 🟥 architecture.md の材料 | **往復ワークフローは成立する。**`packages/ui` は「Claude Design へ出して戻す」前提で設計してよい |
| DR-0066 | 🟥 architecture.md / ui.md の材料 | **「規約を書いた」と「規約が守られているか機械で見ている」は別。**生成 AI に渡す規約は、**検査する側の射程とセットで**設計する。あわせて **`.d.ts` からの props 抽出は継承分を落とす**ので、抽出結果を規則にするなら継承を展開する |
| DR-0067 | 🟥 architecture.md の材料 | **別リポジトリの資産に依存する計画を書くときは、依存する部分を自分の repo に写してから書く。**「流用できる」は所在の確認であって、可用性の確認ではない |
| DR-0069 | 🟥 ui.md / architecture.md の材料 | **生成 AI に渡す規約は「足す」ことが無料ではない。**禁止を 1 つ足すと規約全体の従い方が変わりうる。**足したら 1 変数で測り直し、禁止した箇所だけでなく触っていない箇所も数える** |
| DR-0070 | 🟥 ui.md / architecture.md の材料 | **層境界は「見た目の管轄権」＋判定手順で規則化できる。**packages/ui で部品を足すときの判定に流用できる（🆕 ~~2 回~~・語彙で表せるか・誰の責務か） |
| DR-0077 | 🟥 OBS 候補（運用） | **「同じことが 2 回起きるまで作らない」型の規律は、保留を積む装置としても働く。**採るなら「何回で動くか」ではなく「**何を根拠に動くか**」を書く。あわせて **1 回で動くなら、その 1 回が「効果」か「揺れ」かを区別する手段（床の測定）が要る** |
| DR-0071 | 🟥 ui.md の材料（指摘 11 §11.3 にも） | **「定義したものだけを使う」を機械で強制する実装は実在する**（Spectrum S2 の style macro＝branded type の許可リスト）。閉じるなら**部品の外の出口を対で用意する** |
| DR-0072 | 🟥 architecture.md の材料 | **公開 API に依存の型を素通ししない。**`.d.ts` が相手側の lint 規則に化ける（DR-0059）以上、型の口の選別は規約の一部 |
| DR-0074 | 🟥 ui.md の材料 | **規約の検査対象に自分のコードを含める。**「規約を書いた側」と「守る側」を分けて数えていると、自分の違反が最後まで赤にならない（`w-48` は 4 つの検査を通り抜けた）。**型で閉じると自分の棚卸しも同時に起きる** |
| DR-0073 | 🟥 OBS 候補（運用） | **長い調査セッションのコストは「何を取ったか」ではなく「何往復したか × 溜まった文脈」で決まる。**subagent の結果は通知に全文が乗るので、本体に入れる前に落とす経路を用意する。**投げた subagent が届くとは限らないが、不着でも消費は発生する** |
| DR-0076 | 🟥 architecture.md の材料 | **生成 AI を測るときは、出力だけでなく実行の過程も証跡に含める。**出力だけの証跡は「**いつからそうだったか**」に永久に答えられない。あわせて **予測を登録したら、予測していない箇所を数える行を様式に置く** |
| DR-0075 | 🟥 architecture.md の材料 | **「複製されない」と「読めない」は別。**移送先が何を受け取るかは、複製されたファイルの一覧だけでは決まらない。あわせて **`<Name>.prompt.md` は生成 AI への実効的な伝達経路**であり、その実例は **story のソースそのもの**（story の逸脱はそのまま渡る） |
| DR-0052 | 🟥 ui.md / architecture.md の材料 | 「トークンで統一する」を掲げるなら、**届かない箇所の扱い**を規約として決めておく必要がある |
| DR-0051 | 🟥 architecture.md の材料 | 「UI カタログ = Storybook」だけでは足りない。**カタログ（部品軸）とレビュー（判定軸）は別の並べ方が要る** |
| DR-0024 | 🟥 catalog に追加 | storybook / @storybook/nextjs-vite / addon-a11y / addon-docs / eslint-plugin-storybook / vite の **6 件を厳密ピンで**（shadcn の 7 件と合わせて 13 件） |
| DR-0085 | 🆕 🟥 工場の規約 | **「出荷面は `src/index.ts`」と書くだけでは足りない。**`dist` の入口は 3 本（JS の到達可能性・`.d.ts` の `include`・`publicDir` のコピー）あり、**2 本はディレクトリだけで決まる**。層を足すたびに 3 本とも確認する（差分で撮る） |
| DR-0086 | 🆕 🟥 工場の規約（器） | **モックは実 API が返せるものしか返さない。**返せないもの（ベースライン等）をモックで作ると、繋いだ日に画面が壊れる。**欠落は埋めずに名指しして記録する** |
| DR-0087 | 🆕 🟥 工場の規約（境界） | **コア / 題材の境界はディレクトリで引き、機械で守る**（`fetch` 直書き禁止 ＋ import 制限）。★ 判定規則の候補: **コアは語彙（有限集合）、題材は対応表** |
| DR-0088 | 🆕 🟥 工場の規約（境界） | **境界判定の 2 問**（① 他所で意味が通るか ② 有限の語で言えるか）。検算表ごと写す——**当たらなかった固有物（本文 6 件）の名指し**が規則の形を決めた |
| DR-0089 | 🆕 🟥 工場の規約（UI） | **オーバーレイはアンカーに重ねない。**位置決めは部品が決め、**画面に選択肢を出さない**（prop にしない） |
| DR-0090 | 🆕 🟥 工場の規約（語彙） | **語彙を足したら tailwind-merge にも教える。**教えないと「型は通るが作用しない prop」が静かに増える。🟥 **prop を作ったら効果を測る**——指定の有無ではなく実寸で |
| DR-0091 | 🆕 🟥 工場の規約（出荷） | **出荷入口を数えるときは Claude Design 経路を 4 本目として数える。**判定軸だけ違う（ディレクトリでも export でもなく story の `title`）。**境界は機械では守られていない**——除外リストへの追記を忘れると黙って湧く |
| DR-0092 | 🆕 🟥 工場の規約（出荷・依存） | **出荷物に依存を足す判断は「使い回し先全部がその依存を取る」と読み替えてから決める。**器（依存 0）で済む形を先に探す。**フォームの器と値の管理は別の層に置ける**（実装例つき・上流の shadcn `field` も rhf を import していない） |
| DR-0093 | 🆕 🟥 工場の規約（素材源） | **レジストリの `dependencies` は `add` する前に引いて読む。**style 名は素材源を保証しない（`radix-nova` の `combobox` は `@base-ui/react`）。**「重い判断」を軽い操作が引き起こす経路を数える** |
| DR-0094 | 🆕 🟥 工場の規約（測定器） | **設定を「本体から引く」ときは、引いた項目ではなく引かなかった項目を数える。**`resolve.alias` を引いて `plugins` を引かなかったことは、どこにも記録されない。★ **測定器を入れた理由を書いたなら、その理由が動いていることを 1 度測る** |
