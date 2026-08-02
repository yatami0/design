---
id: DR-0064
type: finding
title: 'デザインプロジェクトに複製されるのはランタイムだけ — guidelines も README も届かない。あわせて日本語ファイル名は 401 になる'
status: observed
date: 2026-08-02
step: 手7
related: [DR-0057, DR-0059, DR-0060]
poc_feedback: '🟥 architecture.md の材料。**日本語ファイル名を成果物のパスに使わない。**あわせて「移送先が実際に受け取るもの」を出荷物の一覧と混同しない'
---

# DR-0064: デザインプロジェクトに複製されるのはランタイムだけ

> 🟨 **手8 H8-09（2026-08-02）が §3 の数を更新した。**
> 「header の guidelines 参照は宛先が無い」は正しいが、**宛先の無い参照は 1 件ではなく 4 件だった**——
> `<Name>.prompt.md`（2 箇所）／ `<Name>.d.ts` ／ `guidelines/docs/共通コンポーネント思想.md`。
> 🟦 **4 件とも削り、届くもの（`styles.css` / `_ds_bundle.css` / `_ds_bundle.js`）だけを残す形に書き換えた。**
> 🟥 **効き目は未測定**（測るには 4 周目の同期と生成が要る）。→ [手8](../手順/手8_出力は機械ゲートを通るか.md) Q6。

## 背景

デザインシステム側には 165 ファイルを上げている（部品 30 × 4 ＋ プレビュー ＋ guidelines 7 ほか）。
**そのうち何がデザインプロジェクト（design agent が実際に作業する場所）へ複製されるか**を、
3 周ぶんの `list_files` で確かめた。

## 発見

### 1. 🟥 複製されるのは 3〜6 ファイルだけ

| 周 | デザインプロジェクトの `_ds/design-ui-<DS の id>/` の中身 |
| --- | --- |
| 1 周目 | `README.md` / `_adherence.oxlintrc.json` / `_ds_bundle.js` / `_ds_bundle.css` / `_ds_manifest.json` / `styles.css`（**6**） |
| 2 周目 | 同上（**6**） |
| 3 周目 | 🟥 **`_ds_bundle.js` / `_ds_bundle.css` / `styles.css` の 3 つだけ** |

🟥 **`components/**` は 3 周とも 1 つも来ていない。**
`.d.ts` も `.prompt.md` も**プレビューカードも**、デザイン側には来ない。
🟥 **`guidelines/**` も 3 周とも来ていない。**

### 2. ★ それでも conventions header は効いている

3 周目の `_ds/` には **`README.md` すら無い**のに、agent は
`AppProviders` を最外に 1 回置き、`w-field-md` を使い、禁止語彙を書かなかった。

→ **conventions header はファイルとしてではなく、system prompt へ inline されて届いている**
（[DR-0057](DR-0057-design-sync-uploads-compiled-code-not-just-html.md) の skill 記述と一致）。
**`_ds/` の複製は「描画に要るものだけ」。**

### 3. 🟥 header の guidelines 参照は、agent から見て宛先が無い

conventions header にはこう書いてある:

> `guidelines/docs/共通コンポーネント思想.md` is the source for the role/facet classification above.

🟥 **このパスはデザインプロジェクトに存在しない。**
skill 自身が「**存在しないものを名指しする conventions ファイルは無いより悪い**」と書いている条件に当たる。

### 4. 🟥 日本語ファイル名は 401 になる（agent 自身の報告・3/3）

**3 周とも**、design agent がチャットでこう報告していた（ユーザー経由）:

> ファイル名を ASCII の `RedmineIssueList.dc.html` に変更しました（日本語ファイル名が原因でリソースが 401 になっていました）

- 🟦 実際、成果物のファイル名は 3 周とも ASCII（`RedmineIssueList.dc.html` / `redmine-issue-list.dc.html`）
- 🟥 **我々が上げた guidelines 6 本は全部日本語ファイル名**
  （`タッチターゲットとサイズ密度.md` ほか）。**仮に複製されても読めなかった可能性が高い。**

## 根拠（実測）

2026-08-02。3 つのデザインプロジェクトに `DesignSync(list_files)`:

```
1 周目 6fc6fc00-b78c-4753-ae54-17b110fc9295 → _ds/ 配下 6 ファイル
2 周目 8e79eedd-972c-41b9-923a-928b2846618b → _ds/ 配下 6 ファイル
3 周目 3cea8e25-8013-46c2-80cc-c8f508de76ab → _ds/ 配下 3 ファイル
```

401 の件は **agent 自身の報告**（ユーザー経由・3/3）。🟥 **HTTP レスポンスを我々が直接観測したわけではない。**

## 影響

**観測から直接言えること**

1. ★ **「上げたもの」と「agent が受け取るもの」は別。**165 ファイル上げても、
   デザイン側に届くのは**ランタイム 3 ファイル ＋ system prompt の header** だけ。
2. 🟥 **`guidelinesGlob` の 7 ファイルは design agent には届いていない。**
   デザインシステム側のプロジェクト（人が見る面）にはあるので**無駄ではない**が、
   **「agent に思想を読ませる経路」としては機能していない。**
3. 🟥 **conventions header の guidelines 参照は直すべき**——
   宛先が無い参照は、skill の基準では「無いより悪い」。
4. 🟨 **複製されるファイル数が周によって違う**（6 / 6 / 3）。
   **何をいつ複製するかは受け手側の裁量**で、こちらからは制御できない。

**🟥 推論（未検証）**

- 401 の原因が「日本語ファイル名」だと**断定はできない**（agent の自己申告のみ）。
  ただし **3/3 で同じ報告が出て、3 周とも ASCII 名に落ち着いている**のは一貫している。
- **guidelines を ASCII 名にすれば届く、とは言えない。**そもそも複製されていないので、
  **名前の問題以前**。届けたいなら **conventions header 本文に畳み込む**しかない可能性が高い。
- 3 周目で `README.md` と `_adherence.oxlintrc.json` が消えたのが**恒久的な仕様変更なのか、
  タイミングの問題なのか**は分からない。**次の同期で数え直す。**

## 関連

- 手順書: [手7](../手順/手7_ClaudeDesignに一覧を組ませる.md)
- 実測の記録: [実行記録.md](../実行記録.md) §H7-10
- 前提: [DR-0057](DR-0057-design-sync-uploads-compiled-code-not-just-html.md)（何が上がるか）／ [DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md)（受け手が作る lint）
