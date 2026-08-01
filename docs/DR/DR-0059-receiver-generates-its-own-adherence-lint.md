---
id: DR-0059
type: finding
title: '受け手が独自の機械ゲートを自動生成していた — `_adherence.oxlintrc.json` は `.d.ts` から導出され、ローカルには存在しない'
status: observed
date: 2026-08-01
step: 手7
related: [DR-0057, DR-0032, DR-0038, DR-0019, DR-0028]
poc_feedback: '🟥 architecture.md / ui.md の材料。`.d.ts` の props 型が「相手側の lint 規則」に化けるので、公開 API の型は規約そのものとして扱う'
---

# DR-0059: 受け手が独自の機械ゲートを自動生成していた

## 背景

手7 の手順書を書く前に「**受け手側で何が観測できるか**」を確かめようとして、
`DesignSync` の読み取りメソッドを叩いた（手7 の実行を人に頼む前に、私が何を測れるかを確定させるため）。

## 発見

### 1. 🟥 リモートにあってローカルに無いファイルが 2 つある

`ds-bundle/` を上げただけのはずのプロジェクトに、**アップロードしていないファイルが 2 つ存在する。**

| パス | ローカル `ds-bundle/` | リモート |
| --- | --- | --- |
| `_ds_manifest.json` | **無い** | 🟦 有り（`@dsCard` からカード索引を組む。ツール仕様に「app の self-check がコンパイルする」と明記） |
| `_adherence.oxlintrc.json` | **無い** | 🟦 **有り**（下記） |

**つまり受け手は、受け取ったものを加工して自分用の装置を作っている。**

### 2. ★ `_adherence.oxlintrc.json` は **oxlint の設定**で、内容は我々の `.d.ts` から機械的に導出されている

props 名と union 値が**そのままセレクタに落ちている。**

```json
{ "selector": "JSXOpeningElement[name.name='Stack'] > JSXAttribute[name.name='gap'] > Literal[value!=/^(?:none|sm|md|lg)$/]",
  "message": "<Stack> gap must be one of 'none' | 'sm' | 'md' | 'lg'." }
```

- 14 部品ぶんの「宣言されている props」と「union 値」が **`no-restricted-syntax` の warn 規則**として並ぶ
- `no-restricted-imports` が **部品の内部 import を禁止**する（`index.js` からのみ。`**/index.js` は override で除外）
- **`--card-spacing` のような CSS 変数ではなく、`.d.ts` の型だけを見ている**

### 3. ★ `<button>` → `<Button>` の置換だけが強制されている

```json
"react/forbid-elements": ["warn", { "forbid": [
  { "element": "button", "message": "Use <Button> from the design system instead of <button>." }]}]
```

`x-omelette.components` の `replaces` を見ると、**この置換規則を持つのは `Button` だけ。**

| 部品 | `replaces` |
| --- | --- |
| `Button` | `["button"]` |
| 残り 13 件（`AppShell` / `Box` / `Container` / `DataGrid` / `EmptyState` / `Grid` / `Inline` / `ListDetail` / `Section` / `Sidebar` / `Spacer` / `Stack` / `StatusPill`） | **`[]`** |

### 4. 🟥 禁止しているのは**生値リテラル**であって、**Tailwind のクラス名ではない**

```json
{ "selector": "Literal[value=/#[0-9a-fA-F]{3,8}\\b/]", "message": "Raw hex color — …" }
{ "selector": "Literal[value=/\\b\\d+px\\b/]",         "message": "Raw px value — …" }
```

- `#3b82f6` や `"16px"` は捕まる
- 🟥 **`className="p-4"` / `className="text-gray-600"` は捕まらない。**`p-4` に `px` は含まれず、`text-gray-600` は hex でもない
- **conventions header が禁止した 2 種（数値の段・パレット色）は、受け手の機械ゲートでは検出されない**

### 5. 🟥 トークン一覧に、我々が禁止しているパレット色が載っている

`x-omelette.tokens`（約 150 語）に以下が**トークンとして**含まれる。

`--color-gray-600` / `--color-emerald-600` / `--color-emerald-50` / `--color-amber-600` / `--color-amber-50` / `--color-red-50` / `--color-neutral-100` / `--color-black`

うち emerald / amber / red / neutral は**我々が持ち込んだもの**——`src/app/tokens.css` 59〜65 行が
semantic 色を**パレット色への参照**として定義している（`--color-success: var(--color-emerald-600)` ほか 6 行）。

🟥 **`--color-gray-600` の出どころだけ未特定。**

### 6. `tokens/` は上がっていない（[NOTES](../../.design-sync/NOTES.md) の記述どおり）

リモートのトップに `tokens/` は無く、`styles.css` と `_ds_bundle.css` だけがある。

## 根拠（実測）

2026-08-01。手7 のブランチ `step/h7-design-agent-behavior`（`b7a97f3` から分岐）で実施。

```
DesignSync({method:'list_projects'})
  → 2 件。"Modernist"(37ffb46e…) と "design — UI検証"(3acbb737…)
     🟥 H6-01 の時点では [] だった（handoff §H6-01）。Modernist の由来は未確認
DesignSync({method:'list_files', projectId:'3acbb737-85fe-4098-95f4-c99070168ba1'})
  → 110 パス。うち _ds_manifest.json / _adherence.oxlintrc.json がローカルに無い
DesignSync({method:'get_file', path:'_adherence.oxlintrc.json'})
  → 全文取得（truncated: false）。上記の規則群
```

ローカル側は `ls ds-bundle/`（`_ds_manifest.json` / `_adherence.oxlintrc.json` とも**無い**）と
`grep -n "fill-\|--color-success\|--color-warning" src/app/tokens.css`（59〜65 行）で確認。

## 影響

**観測から直接言えること**

1. ★ **手7 の Q1（使うか作り直すか）には、受け手側にも強制装置がある。**
   ただし届くのは **`<button>` → `<Button>` の 1 本だけ**で、
   🟥 **Layout プリミティブは `<div>` で迂回されても検出されない**（`replaces: []`）。
   → **手7 の判定は「`window.Design.*` を使ったか」だけでなく「素の HTML 要素を何個書いたか」を数える必要がある。**
2. ★ **手7 の Q（禁止語彙を守るか）は、散文（conventions header）だけが担保している。**
   受け手の機械ゲートは className を見ないので、[手3 で入れた `no-restricted-syntax` 8 セレクタ](DR-0032-layout-primitives-take-props-not-classname.md)相当は**再現されていない。**
   これは [DR-0038](DR-0038-arbitrary-value-rule-sees-three-contexts.md)（任意値禁止は `cva` / `cn` を経由しない文字列を検査しない）と**同型の穴が境界の向こうにもある**ということ。
3. ★ **`.d.ts` の質が、受け手の機械ゲートの質をそのまま決める。**
   [NOTES の Re-sync risk #1](../../.design-sync/NOTES.md)（`dist/types` の鮮度）は、
   **カードの見た目だけでなく lint 規則の正しさに効く。**古い型を上げると**古い規則で相手を縛る。**
4. 🟥 **我々の禁止語彙とトークン一覧が食い違っている。**
   conventions header は「Tailwind のパレット色を書くな」と書いているのに、
   トークン一覧はパレット色 8 語を**トークンとして提示している。**
   [DR-0019](DR-0019-semantic-spacing-typography-vocabulary.md) で「値は書かず既定への参照」にした設計が、
   **参照先を語彙として露出させた。**
5. 🟦 **私（Claude）は受け手側の成果物を読める。**`list_files` / `get_file` が通った。
   → **手7 の観測を人の目視だけに頼らなくてよい。**ただし読めたのは**デザインシステム側**であって、
   🟥 **デザインを作る側のプロジェクトが読めるかは未確認。**

**🟥 推論（未検証）**

- **oxlint が実際に design agent の生成物に対して走っているかは確認していない。**
  観測したのは「設定ファイルが存在すること」だけ。走っていなければただの飾り。
- **すべて `warn` なので、違反しても生成が止まらない**可能性がある。`error` に上げる口があるかは未調査。
- **手8（出力は lint / validate.mjs を通るか）の一部が、受け手側で先に行われている**可能性がある。
  そうなら手8 の問いは「通るか」ではなく「**我々の lint と相手の lint はどこで食い違うか**」に変わる。
- `--color-gray-600` は shadcn か Storybook のビルド設定由来と思われるが**未特定。**

## 関連

- 手順書: [手7](../手順/手7_ClaudeDesignに一覧を組ませる.md)
- 実測の記録: [実行記録.md](../実行記録.md) §手7（H7-01）
- 前提: [DR-0057](DR-0057-design-sync-uploads-compiled-code-not-just-html.md)（何が上がるか）
- 同型の穴: [DR-0038](DR-0038-arbitrary-value-rule-sees-three-contexts.md)・[DR-0028](DR-0028-token-frame-is-not-closed.md)
