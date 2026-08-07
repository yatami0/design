# design-sync NOTES（手6）

このリポジトリを `/design-sync` で同期するときの申し送り。
台帳側の正本は `docs/実行記録.md §手6` と `docs/手順/手6_ClaudeDesignへの同期.md`。

## リポジトリ固有の事情（次回も効く）

- **[GENERAL] この repo は Next.js アプリであってライブラリ package ではない。**
  `build: next build` は `dist/` を出さず、`exports` も無い。converter はビルド済み `dist/` を要求するので、
  そのままでは `[NO_DIST]` で止まる。**3 段そろって初めて部品が見つかる。**
  - ① `cfg.entry = "src/index.ts"`（TS ソースを直接 entry に渡す）。
    converter の bundler は tsconfig の `paths` を解決するプラグインを持つので `@/` のまま通る。
  - ② `pnpm build:types`（`tsconfig.dts.json` → `dist/types`）で宣言を出し、`package.json` の `types` をそこへ向ける。
    **これが無いと `exported PascalCase symbols: 0` になり、緑のまま部品 0 件で完走する。**
  - ③ `tools/dts-alias.mjs` で `.d.ts` 内の `@/` を相対指定子へ書き換える。
    **`tsc` は `paths` を出力に書き戻さず、converter 側の ts-morph には `paths` が無い。**
    → `build:types` に組み込み済み。書き換え漏れがあれば `exit 1`。

- ~~**同期範囲は手6 D2 で決めた「① Tokens ＋ 製品層 ＋ ③ ＋ ④」＝ 14 部品。**~~
  🆕 **手7 D5=A（2026-08-02）で素材層 16 件を足した。同期範囲は 30 部品。**
  ★ Review 6 件と ① Tokens は引き続き `cfg.titleMap` の `null` で除外している。
  🟥 **手3 D3=B（画面は製品層しか見ない）は、境界の向こうでは維持しないことにした。**
  1 周目の実測で **`Card` が無いために design agent がカード面を手組みした**ため（実行記録 §手7 Q4）。
  `src/index.ts` の import 元は**製品層の再輸出**であって `@/components/ui/**` ではない（窓口は 1 本のまま）。

### 2 周目（手7）で見張るもの — 事前に書いた予測と、同期を回した結果

| # | 予測 | 結果（2026-08-02） |
| --- | --- | --- |
| 1 | Overlay **5 件**で `[GRID_OVERFLOW]` が出る | 🟨 **外れ（過大）。出たのは `Dialog` と `Tooltip` の 2 件だけ。**`DropdownMenu` / `Popover` / `Sheet` は**閉じた状態の story しか無い**ので flag されない。**「Overlay だから」ではなく「開いた状態の story があるか」で決まる** |
| 2 | カードは 14 → 30 になる | 🟦 **的中**（`componentCount: 30` / `window.Design` 129 export のうち部品 30） |
| 3 | ★ `Box` + `bg-card rounded-md border` の手組みが消え `Card` が使われる | 🟦 **的中**（2 周目で `Card` + `CardContent` に置き換わった）。🟥 **代わりに `w-48` が 2 件出た**——素材層は `className` を受けるため |
| 4 | `_adherence.oxlintrc.json` の規則が 16 部品ぶん増える | ⬜ **未読**（コンテキスト節約のため再取得していない）。`_ds_manifest.json` は 30 部品・30 カードに更新済み |
| 5 | `buildCmd` に `pnpm build:types` を入れたことで risk #1 が塞がる | 🟥 **外れ。`buildCmd` は converter が実行しない**（下記）。**risk #1 は塞がっていない**——手で回すしかない |

- **`① Tokens` の story は部品ではないので `titleMap: null` で除外した。**
  トークン自体は `_ds_bundle.css`（Storybook から採取したコンパイル済み CSS）経由で
  `styles.css` の `@import` closure に載るので design agent には届く。**`tokens/` は空のまま**が正常。

- **`Sidebar` / `AppShell` / `Dialog` / `Tooltip` は `cardMode: "single"`**（`[GRID_OVERFLOW]`＝fixed/portal がセル外に出るため）。
  🟨 **Overlay 全部ではない。**`DropdownMenu` / `Popover` / `Sheet` は**閉じた状態の story しか無い**ので flag されない。

- 🟥 **`Dialog` の `Open` story は storybook 側でも描画されない**（`sb-error: no storybook root content`）。
  → `cfg.overrides.Dialog.skip` に `②-素材層-overlay-dialog--open` を入れてある。**preview 側の問題ではない。**

- 🟥 **`Tooltip` の `Always Open` は「参照側が足りない」形の差が出る。**
  storybook のショットは `#storybook-root` だけを撮るので、**portal されたツールチップが枠外**に落ちて写らない。
  preview 側は正しく描いている。**ルーブリックの「gated な参照より preview が多く描くのは `close` ではない」に従い `match`。**
  次回も同じ形で出るので、シートだけ見て mismatch と読まないこと。

- 🟨 **`buildCmd` は converter が実行しない。**`lib/common.mjs` の設定キー一覧にあるだけで実行経路が無い。
  **`.design-sync/config.json` の `buildCmd` は「再同期の前に人が回すもの」の申し送り**として読むこと。
  今回は `pnpm i --frozen-lockfile && pnpm build:types` を手で回した。

- 🟨 **[GENERAL] `pnpm` 経由の実行は避ける。**（2026-08-02 更新）
  PATH の `pnpm` は Homebrew の **11.18.0** で、`pnpm <script>` が実行前に依存チェックを走らせ
  `ERR_PNPM_IGNORED_BUILDS`（`esbuild` / `sharp`）で **`exit 1`** になる。
  🟥 **副作用でプレースホルダの `pnpm-workspace.yaml` が生える**（`allowBuilds: set this to true or false`）。
  **生えたら消す**——`cspell` が `esbuild` を拾って repo 側に新しい赤が出る。
  🟦 **回避: `pnpm` を使わず直接叩く。**`buildCmd` の実体は下の 2 行で足りる:
  ```bash
  export PATH="$HOME/.local/share/mise/installs/node/24.18.1/bin:$PATH"   # mise は非対話シェルで効かない（node が 22.16 になる）
  ./node_modules/.bin/tsc -p tsconfig.dts.json && node tools/dts-alias.mjs
  ```

- 🟨 **`[REFERENCE_STALE?]` は config だけ変えた再ビルドでも出る。**
  参照 Storybook は `src/index.ts` を変えた後に建て直してあるので、この警告は空振り。
  **DS ソース（`src/**`）を触ったときだけ建て直す。**

- 🟨 **`AppShell` が毎回 `[SPOT_CHECK]` に出る**（3 回連続、`trigger: render_churn`）。
  ソースは変わっていないので grades は保持される。**シートを確認して記録済み grade と一致すればそのまま進んでよい。**

- **`guidelinesGlob` は明示指定。**既定の `docs/*.md` は工程記録（handoff・実行記録・段取り・思想への指摘）まで
  さらってしまい、design agent には雑音になる。**設計判断に効く 6 本だけ**に絞ってある。

- 🆕 **[GENERAL] Conductor の worktree はフレッシュ clone と同じ。**（2026-08-02）
  `.ds-sync/` `dist/types` `.design-sync/sb-reference` `.design-sync/.cache` は**全部 gitignore なので存在しない。**
  再同期の前に**この順で**揃える（`node` は上記の mise パスを通してから）:
  ```bash
  pnpm i --frozen-lockfile; rm -f pnpm-workspace.yaml   # 🆕 手8e: worktree には node_modules も無い。生える yaml は消す
  cp -r "<skill-base-dir>"/{package-build.mjs,package-validate.mjs,resync.mjs,lib,storybook,non-storybook} .ds-sync/
  echo '{"name":"ds-sync-deps","private":true}' > .ds-sync/package.json
  (cd .ds-sync && npm i esbuild ts-morph @types/react playwright && npx playwright install chromium)
  ./node_modules/.bin/tsc -p tsconfig.dts.json && node tools/dts-alias.mjs        # dist/types
  ./node_modules/.bin/storybook build -c .storybook -o "$(git rev-parse --show-toplevel)/.design-sync/sb-reference"
  ```
  🟦 **ドライバは `--node-modules ./node_modules --entry src/index.ts` で通る。**

## 警告のうち「想定内」のもの

- **`[TOKENS_MISSING]` 9 件は全部 `--radix-*`。**Radix が実行時にインラインスタイルで設定する変数なので、
  静的なスタイルシートに無いのが正常（validate 自身が「実行時に設定される変数は EXPECTED to be absent」と明記）。
- **`[CSS_FROM_STORYBOOK]`。**この repo は CSS を dist に出さないので、converter が
  参照 Storybook のコンパイル済み CSS を採る。これが唯一の CSS 供給経路。
- **`[REFERENCE_STALE?]`。**描画に影響しない config 変更（`guidelinesGlob` 等）でも出る。
  **DS のソースを触ったときだけ**参照 Storybook を建て直すこと。

## ✅ 解決済み（前回の実行で直した）

- **フォントが本体と Storybook で食い違っていた。**`--font-sans` が `@theme inline` で自己参照しており、
  埋めていたのは `layout.tsx` の `next/font`（Geist）だけだった。Storybook もプレビューも移送先も
  `layout.tsx` を実行しないのでセリフ体に落ち、**compare は両側が同じフォールバックに落ちて「一致」に見えていた。**
  → 自己参照と本体の上書きを両方外し、Tailwind v4 の既定スタックへ戻した（[DR-0058]）。
  🟥 **`tmp-admin` は `--font-sans` を定義していない**——① 層の欠落そのものは未解決。

## 🟥 Re-sync risks（次の実行が見張るもの）

> 最終更新: 2026-08-07（**手8e の再同期。製品層 4 件の実装＋`Link` 新設で 31 部品**。下の「手8e の再同期」節が最新の実測）

| # | 見張るもの | なぜ |
| --- | --- | --- |
| 1 | 🟥 **`dist/types` の鮮度** | `pnpm build:types` を忘れると **古い型のまま緑で完走**する。🟥 **`buildCmd` に書いても converter は実行しない**（上記）ので、**人か agent が明示的に回す**。部品の props を変えたら必ず先に |
| 2 | 🟥 **`src/index.ts` の export 漏れ** | export していない hook / 型は design agent から使えないのに、Storybook では story 内で呼べてしまうので気づけない（手6 で `useListDetail` を 1 件検出） |
| 3 | 🟨 **フォント実体は同梱していない** | いまは system stack。Geist 等を DS のフォントにするなら ① Tokens 層に置き `cfg.extraFonts` で同梱する |
| 4 | 🟨 **`_ds_bundle.css` は参照 Storybook 由来**（`[CSS_FROM_STORYBOOK]`） | Storybook のビルド設定が変わると CSS の中身も変わる。**DS ソースを触ったら参照を建て直す** |
| 5 | 🟦 **grade は 31/31 全件 `match`**（🆕 手8e で更新） | `close` ゼロ・`mismatch` ゼロ。`bad` 0 / `thin` 0 / `variantsIdentical` 0。story cap には当たっていない（最大 4 story） |
| 6 | 🟨 **`.d.ts` の props に React の継承分が混ざる** | Layout 部品は `className` を受けない設計なので conventions header 側で打ち消してある |
| 7 | 🆕 🟥 **素材層 16 件は `export *` で出している** | 上流（shadcn）の API が変わると export 面がまるごと動く。**`window.Design` は 130 export（うち部品 31。🆕 手8e で `Link` が 1 件増えた）**。`.d.ts` から受け手の lint 規則が生成されるので、**型が動くと相手の規則も動く**（[DR-0059](../docs/DR/DR-0059-receiver-generates-its-own-adherence-lint.md)） |
| 8 | 🆕 🟨 **`Dialog.Open` の skip は「storybook 側が描けない」ことに依存** | story 側が直れば skip は不要になる。**skip を惰性で残さない** |
| 9 | 🆕 🟨 **`tokens/` は空のままが正常** | converter の `tokens/` は別パッケージ用。本 repo の値は `_ds_bundle.css` に焼き込まれる |
| 10 | 🆕 🟨 **`x-omelette.tokens` にパレット色が載る** | `src/app/tokens.css` が semantic 色を**パレット色への参照**で定義しているため（`--color-success: var(--color-emerald-600)` ほか）。**conventions header の「パレット色を書くな」と字面が食い違う**——手7 の観測対象 |
| 11 | 🆕 🟥 **出荷している `.d.ts` は型検査を通らない（26 件）** | `package-validate.mjs` の「all .d.ts parse cleanly」は **parse であって typecheck ではない。**実測: `tsc --strict --noEmit` を `ds-bundle/components/**/*.d.ts` にかけると **26 エラー**——`React.Ref`（型引数なし）**18 件**／`Cannot find name`: `CSSProperties` ×2・`ColumnDef`・`ListDetailState`・`NavItem`／`ComponentType<DataGridProps>`・`<ListDetailProps>`（総称型に型引数なし）2 件。🟥 **受け手はこの `.d.ts` から lint 規則を生成する**（[DR-0059](../docs/DR/DR-0059-receiver-generates-its-own-adherence-lint.md)）ので、**抽出が浅い原因の半分はここ**。再現: `docs/実行記録.md §手8 H8-10` |
| 12 | 🟨 **README の自動生成部と conventions header は矛盾している**（未解決） | 生成部（`## Where things are`）は `guidelines/` と `<Name>.prompt.md` を「読め」と書くが、**デザイン側には届かない**（[DR-0064](../docs/DR/DR-0064-design-project-receives-runtime-only.md)）。🟥 **header 側に打ち消しを置いたら別の場所が壊れたのでロールバックした**（[DR-0069](../docs/DR/DR-0069-adding-prohibitions-to-the-header-degraded-the-output.md)）。**矛盾は残したまま。次に触るときは 1 変数で測る** |
| 13 | 🆕 🟦 **`[TOKENS_MISSING]` が 9 → 1 に減った** | 前回は `--radix-*` 9 件。今回は「1 missing, below threshold」で **tag そのものが出ない。**原因未特定（sb CSS の採取結果が変わった可能性）。**増えたら見る** |
| 14 | 🆕 🟦 **`[REFERENCE_STALE?]` と `AppShell` の `[SPOT_CHECK]` は今回出なかった** | どちらも 3 回連続で出ていたもの。**参照 Storybook を同じセッションで建て直したため**と思われる。次回また出たら「建て直しのタイミング」が原因と確定できる |

## 🆕 手8 の再同期（2026-08-02）— aux だけを動かした

**変えたのは `.design-sync/conventions.md` の 1 ファイルだけ。**`src/**` は 1 行も触っていない。

| 観測 | 結果 |
| --- | --- |
| ドライバの判定 | 🟦 `ok: true` / `anchor: ok` / `pendingGrade: []` / `canary: null` |
| 検証 | 🟦 **30 件すべて `verified-by-upload`（carried forward）。**`changed` / `added` / `removed` すべて 0 |
| アップロード | 🟦 `bundle: false` / `styling: false` / **`aux: true`**・`deletePaths: []` |
| render check | 🟦 **30/30 clean**（最終レポート用に `--render-sample 0` で全件回した） |
| 🟥 **conventions header の実在検証** | **ドリフト 0 件。**クラス 26 語・部品/Provider/hook 40 名・props と union 値・否定の主張（`Container` に `inset` が無い等）を**全件実測**。`window.Design` は vm で実際にロードして 129 export を列挙した（grep ではなく） |
| 15 | 🆕 🟥 **conventions header を触ったら、必ず「触っていない箇所」も数える** | 手8 で禁止 3・語彙 0 を 842 バイト足したら、**禁止した箇所は直り `Container` / `Section` / `DataGrid` が消えた**（[DR-0069](../docs/DR/DR-0069-adding-prohibitions-to-the-header-degraded-the-output.md)）。🟥 **ロールバック済み。**header は手7 の 6,832 バイトが最後に「効いていた」状態 |
| 16 | 🆕 🟥 **`x-import` に `class=` を書くと黙って落ちる** | ランタイム（`support.js` の `collectProps`）は `class → className` を **`kind === "dom"` のときだけ**行う。部品には **`class-name=`** が必要。🟥 **どこにも書かれていない**（header の例はすべて JSX の `className=`）。**足すなら禁止ではなく「書き方」として 1 変数で** |
| 17 | 🆕 🟥 **アンカーは `finalize_plan` の直前に取り直す** | ロールバック時、古い `remote-sync.json` のせいでドライバが **`upload.any: false`**（＝アップロード不要）と誤判定した。remote には前の版が載ったままだった。**`auxSha` を突き合わせれば分かる** |

## 🆕 手8e の再同期（2026-08-07）— 製品層 4 件の実装を渡した

**同期範囲は 30 → 31 部品**（`Link` 新設）。`cfg.componentSrcMap` に `Link` を 1 行足した以外、config は無変更。

| 観測 | 結果 |
| --- | --- |
| ドライバの判定 | 🟦 `ok: true` / `anchor: ok` / `learningsUnmerged: []` / `canary: null` |
| 検証の内訳 | **`unchanged` 26（verified-by-upload）／`changed` 4（`AppShell` `DataGrid` `ListDetail` `Select`）／`added` 1（`Link`）／`removed` 0** |
| 採点 | 🟦 **13 story すべて `match`**（`close` 0・`mismatch` 0・factual failure 0）。**シートは 5 件とも全 story を画像判定**した（sibling-trusted は使っていない） |
| render check | 🟦 **31/31 clean**（`bad` 0 / `thin` 0 / `variantsIdentical` 0 / `gridOverflow` 0）。**bundle と styling が動いたので full tier** |
| アップロード | `bundle: true` / `styling: true` / `aux: true`・**`deletePaths: []`**（削除は無い）。169 ファイル＋ `_ds_sync.json` |
| 🟥 **conventions header の実在検証** | **ドリフト 0 件。**手8d が動かした 6 箇所（`width="md"` の実例・`DataGridColumn` + `kind`/`emphasis`・document reset の宣言・`font-emphasis`・`StatusPill` が状態色を持つ・Composed に `Link`）を**全件実測して裏が取れた**。`window.Design` は vm で 130 export を列挙 |
| 出なかった警告 | `[GRID_OVERFLOW]` 0・`[SPOT_CHECK]` 0・`[REFERENCE_STALE?]` 0（**参照 Storybook を同じセッションで建て直したため**——risk #14 の読みが 2 回連続で当たった） |
| `[TOKENS_MISSING]` | 前回と同じく「1 missing, below threshold」で **tag が出ない**（risk #13 は据え置き） |

### ★ 手8d が登録した赤テストの打ち直し（代理検体 → 本物）

🟦 **器 A は本物でも成立した。**出荷している `ds-bundle/_ds_bundle.css` の **`@layer base` 先頭**に
`*,:after,:before,::backdrop{box-sizing:border-box;border:0 solid;margin:0;padding:0}` が実在する。
→ **conventions header の「document reset は配布 CSS が保証する」は嘘ではない。**`AppProviders` へ倒す必要は無かった。

🟦 **面④b の原因も同じファイルで確認した**——`a{color:inherit;text-decoration:inherit}`。
**同じ `<style>` の 2 行が正反対の原因**という手8c の読みが、代理ではなく**移送物そのもの**で裏づいた。

🟨 **検索するときの注意**: Preflight の綴りは `*,:after,:before,::backdrop`（**コロン 1 つ・`:after` が先**）。
`::after,::before` で grep すると**実在するのに「無い」と読める**。手8e で一度この読み違いをした。

### 🟥 `.d.ts` の解決不能は解けていない（risk #11 の更新）

`tsc --strict --noEmit` を `ds-bundle/components/**/*.d.ts`（31 ファイル）にかけると **27 エラー**（前回 26）。

| 内訳 | 前回 | 今回 |
| --- | --- | --- |
| `Generic type 'Ref' requires 1 type argument` | 18 | **20**（部品が 1 件増えたぶん） |
| `Cannot find name 'CSSProperties'` | 2 | 2 |
| `Cannot find name 'ColumnDef'` | 1 | **0**（🟦 [DR-0072](../docs/DR/DR-0072-no-passthrough-of-dependency-types.md) が効いた） |
| `Cannot find name 'DataGridColumn'` | – | **1**（🟥 **名前が替わっただけ**） |
| `NavItem` / `ListDetailState` | 各 1 | 各 1 |
| 総称型に型引数なし（`DataGridProps` / `ListDetailProps`） | 2 | 2 |

★ **依存の型を公開 API から消す目的（DR-0072）は達成された**が、**`.d.ts` の抽出が自層の型も出さない**ので
**受け手の lint 規則から見た解像度は変わっていない。**次に効かせたいなら converter の型抽出側の問題。

🆕 🟥 **`SelectTrigger` の `width` は `.d.ts` に載らない。**converter は**部品 1 件につき `.d.ts` 1 枚**しか出さず、
`Select.d.ts` に入るのは根（`SelectProps`）だけ。**複合部品のパーツ（`SelectTrigger` / `CardHeader` 等）の props はどこにも出ない。**
→ 手8d で `width` prop を作って `className` を閉じたのに、**受け手の `_adherence.oxlintrc.json` はそれを知りようがない。**
`Select.prompt.md` には実例として載っている（が、[DR-0064](../docs/DR/DR-0064-design-project-receives-runtime-only.md) によりデザイン側には届かない）。

