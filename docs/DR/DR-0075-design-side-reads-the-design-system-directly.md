---
id: DR-0075
type: finding
title: 'デザイン側は複製に頼らずデザインシステムを直接読む — `.prompt.md` は届いていた（DR-0064 の「届くのはランタイムと header だけ」を覆す）'
status: observed
date: 2026-08-07
step: 手8e
related: [DR-0064, DR-0057, DR-0059, DR-0074, DR-0072]
poc_feedback: '🟥 architecture.md の材料。**「複製されない」と「読めない」は別。**移送先が何を受け取るかは、複製されたファイルの一覧だけでは決まらない'
---

# DR-0075: デザイン側は複製に頼らずデザインシステムを直接読む

## 背景

[DR-0064](DR-0064-design-project-receives-runtime-only.md) は 3 周ぶんの `list_files` から
「デザイン側に届くのは**ランタイム 3 ファイル ＋ system prompt の header** だけ」と結論し、
手8 以降の判断（**規約は header に畳み込むしかない**）はこれを前提にしていた。

7 周目（手8e）で、ユーザーが生成中のツールトレースを共有した。**前提が崩れた。**

## 発見

### 1. ★★ design agent はデザインシステムプロジェクトを直接 list / read している

7 周目の生成中に出たツールトレース（Claude Design の UI ログ・ユーザー共有）:

```
Listing files _ds
Listing files 3acbb737-85fe-4098-95f4-c99070168ba1   ← デザインシステム側の projectId
Reading AppShell.prompt.md
Reading DataGrid.prompt.md
Reading Select.prompt.md
Searching _ds_bundle.js
```

🟥 **`<Name>.prompt.md` はデザインプロジェクトに複製されていない**（下記 2）。
にもかかわらず 3 本読めている＝**デザインシステムプロジェクトそのものを読む経路がある。**

### 2. 🟦 複製されるファイルは今も 6 つのまま（DR-0064 の観測は生きている）

7 周目のデザインプロジェクト `89a4410e-3876-41ad-a7c0-452e190d095f` の `list_files`:

| 場所 | 中身 |
| --- | --- |
| ルート | `Redmine チケット一覧.dc.html` / `support.js` / `.thumbnail` |
| `_ds/design-ui-3acbb737-…/` | `README.md` / `_adherence.oxlintrc.json` / `_ds_bundle.js` / `_ds_bundle.css` / `_ds_manifest.json` / `styles.css`（**6**） |

**`components/**` も `guidelines/**` も、7 周目も複製されていない。**
→ **DR-0064 の「複製は 6 ファイル」は正しい。覆ったのは「だから届かない」という含意のほう。**

### 3. 読みに行ったのは、手8d で動かした 3 部品ちょうどだった

`AppShell` / `DataGrid` / `Select` の 3 本。手8d が API を変えた部品と**完全に一致**する。
🟦 生成物にはその 3 本の新 API が全部出ている——`SelectTrigger width="md"` ×2 ／
`columns[].kind: 'numeric'` ×2 ／ `columns[].emphasis: true` ×1。

### 4. ★ story → `.prompt.md` → agent の経路が実測で閉じた（[DR-0074](DR-0074-we-wrote-the-same-deviations-ourselves.md) の推論を確定させた）

DR-0074 は「**story は `.prompt.md` の実例源なので、禁止した書き方を実例として渡していた可能性**」を
🟥 推論として置き、7 周目での検証を宿題にしていた。**両端が実測で埋まった。**

- `ds-bundle/components/selection/Select/Select.prompt.md` の `## Examples` は
  **story のソースをコメントごとそのまま写している**（`{/* 🟦 以前はここが … */}` まで入っている）
- そのファイルを agent が読んでいる（上記 1）

→ 🟦 **`.prompt.md` の実例は story のソースそのもの**であり、**それは agent に届く。**

## 根拠（実測）

2026-08-07。7 周目の生成後、`DesignSync(list_files)` をデザインプロジェクトに実行:

```
89a4410e-3876-41ad-a7c0-452e190d095f
  → _ds/design-ui-3acbb737-…/ 配下 6 ファイル（components/ も guidelines/ も無い）
```

ツールトレースは **Claude Design の UI が表示したもの**（ユーザーがスクリーンショットで共有）。
🟥 **HTTP の観測ではない**——DR-0064 の 401 と同じ「相手側の表示を信じている」段階だが、
**「複製されていないファイルを読んだ」という事実は、こちら側の `list_files` と突き合わせて成立する。**

`.prompt.md` の中身は `ds-bundle/components/selection/Select/Select.prompt.md` L23-40 を直接確認。

## 影響

**観測から直接言えること**

1. ★★ **「複製されない」と「読めない」は別。**DR-0064 の §影響 1（届くのはランタイム 3 ファイル ＋ header だけ）は
   **観測ではなく推論**だった。それが「観測から直接言えること」の側に書かれていたため、
   手8 以降が**事実として前提にした**。→ [OBS-0007](../OBS/OBS-0007_発見に推論を混ぜると後続が数え間違える.md) の形の **2 例目**。
2. 🟦 **`<Name>.prompt.md` は agent への実効的な伝達経路である。**
   部品ごとの使い方を書く場所として機能する（＝ header 1 本に全部畳み込む必要は無い）。
3. 🟦 **story のソースはそのまま agent へ渡る。**story に書いた逸脱は実例として渡り、
   story を直せば実例も直る（[DR-0074](DR-0074-we-wrote-the-same-deviations-ourselves.md)）。
4. 🟥 **`.d.ts` を経由しない口が実在する。**手8e H8E-06 で
   「`SelectTrigger.width` は `.d.ts` に載らないので受け手は知りようがない」と書いたのは**誤り**だった。
   `.prompt.md` 経由で知れる。**ただし [DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md) の
   lint 規則生成は `.d.ts` からなので、「agent が知れる」と「lint が見張れる」は別のまま。**

**🟥 推論（未検証）**

- **何をきっかけに読みに行くのかは分かっていない。**3 部品ちょうどだったのが
  ① README の部品一覧から選んだ ② 依頼文の要件（表・フィルタ・骨格）から選んだ
  ③ 毎回全部を読む設計で、たまたま 3 部品しか要らなかった、のどれかは決められない。
  **1 周では区別できない**——次の周のトレースを取れば分かる。
- **`guidelines/**` も同じ経路で読める可能性が高い**（同じプロジェクトの中にある）が、
  **今回読んだ形跡は無い。**「読めるが読まれなかった」のか「読めない」のかは未確定。
  🟥 日本語ファイル名の問題（DR-0064 §4）も未解消のまま。
- 生成が速かった（ユーザー所感）のは**全部を読まず 3 本に絞ったから**と考えられるが、測っていない。

## 関連

- 前提: [DR-0064](DR-0064-design-project-receives-runtime-only.md)（**この DR が覆した**）／ [DR-0057](DR-0057-design-sync-uploads-compiled-code-not-just-html.md)（何が上がるか）
- 経路の片端: [DR-0074](DR-0074-we-wrote-the-same-deviations-ourselves.md)（story が実例源）／ [DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md)（lint は `.d.ts` から）
- 実測の記録: [実行記録.md](../実行記録.md) §手8e
