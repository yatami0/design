# 状態台帳（handoff）

> **この repo の「状態」はすべて本ファイルが正。**セッション開始時に必ず読み、終了時に更新する。
> 地図＝[UI検証の位置づけと段取り.md](UI検証の位置づけと段取り.md)／計画＝[docs/手順/](手順/)／実測＝[実行記録.md](実行記録.md)／決定と発見＝[docs/DR/](DR/index.md)／**まだ決まっていないもの＝[docs/OBS/](OBS/index.md)**

最終更新: 2026-08-07（🆕 **✅ 手8d を実装まで通した。**設計の 4 件をコードにし、**ゲート 6 本はベースラインと完全一致**。★ 器 A の赤テストは 4 項目とも期待どおり。🟥 **逸脱が消えたかは未測定**——それは 7 周目）

---

## 現在地

- ★★ 🆕 **手8c の設計が確定した**（2026-08-07・**PR #3 がマージされた** `9801b66`）。
  ユーザー指示「**設計そのものが終わったらマージします**」により、**マージ＝確定の印**。
  → **[製品層の部品設計.md](製品層の部品設計.md) は「確定した設計」として扱ってよい。**
- ★★ 🆕 **手8d を実装まで通した**（[手順書](手順/手8d_製品層の部品実装.md)・[実行記録 §手8d](実行記録.md)・2026-08-07）。
  §2 は **D1=A / D6=A / D8=全量**（ユーザー判断）＋ 残り 6 件は推奨どおりで決着。
  - ★ **H8D-01 の赤テストは 4 項目とも期待どおり**（① 検体 1 件 ② Preflight の指紋 1 件 ③ `*,:after,:before,::backdrop{…margin:0` 命中 ④ 対照 0 件）。
    → **器は A（配布 CSS の base レイヤ）で確定。`AppShell` は CSS 0 行・props 0 変更で「保証の名乗り」だけ。**
    🟥 **代理検体**（ローカル `storybook build` の CSS）なので**7 周目に本物の `_ds_bundle.css` で打ち直す**
  - 🟦 **副産物: 面④b の原因も配布側の CSS で確認できた**——同じファイルに `a{color:inherit;text-decoration:inherit}`。
    **同じ `<style>` の 2 行が正反対の原因**という設計の読みが実物で裏づいた
  - ★ **実装は 4 件**: `Select`（`SelectTrigger` だけラッパー・`width` prop）／`DataGrid`（`DataGridColumn`・`ColumnDef` は公開 API から消滅）／`AppShell`（保証の名乗り）／**`Link` 新設**。＋ header 6 箇所＋ story（Select `Widths`・Link 3 本）
  - 🟦 **ゲート 6 本はベースラインと完全一致**（lint は内訳まで同一・cspell は辞書を 1 語も足さず緑）。**新しい赤ゼロ**
  - 🟦 **閉じたことの赤テストも打った**——`className` と `cell` を書いた検体で `tsc` が 2 種類の赤を出し、消したら緑に戻った
  - ★★ 🟥 **我々自身のコードが、生成物と同じ逸脱を書いていた**（[DR-0074](DR/DR-0074-we-wrote-the-same-deviations-ourselves.md)）——
    story に **`<SelectTrigger className="w-48">`**（r1 の逸脱と 1 文字も違わない）、画面と story に `font-mono` / `tabular-nums`。
    🟦 **探しに行ったのではなく、部品を閉じた瞬間に `tsc` が見つけた。**🟥 **`w-48` は lint・typecheck・storybook・手7 の棚卸しの 4 つを通り抜けていた**
  - 🟨 **Q2 の答え: 設計はそのまま実装できた。**§2 への追記は 3 件（D10〜D12）だが、**props シグネチャの変更は 0 件**——追記はすべて「設計が書いていなかった粒度」（内部実装・棚の分類）
  - 🟥 **書式の管轄を部品へ移せたのは表の中だけ。**`page.tsx` L129 の**詳細シート**に 1 件残る（表の外なので受け皿が無い）。実測 1/6 周＝**規則①で不成立なので部品は作らない**。残すと明記して監視
  - 🟥 **思想への指摘 13 件目**——**層タグは部品単位でしか付けられないのに、昇格はパーツ単位で起きた**（`Select` は 10 パーツ中 1 つだけが昇格）。タグを `vendor` ＋ `wrapped` の 2 つにした
- ★★ **手8c が完了した**（2026-08-07・ブランチ `hand8-design-investigation`）。
  **「作る手」ではなく「何を作るべきかを決める手」**——部品のコードは 1 行も増えていない（`git diff` で確認済み）。
  - ★ **判定規則が立った**（[DR-0070](DR/DR-0070-product-layer-boundary-rule.md)）: 境界は「**見た目の管轄権**」。手順は ① 同じ場所から 2 回以上出たか → ② トークン語彙の有限集合で表せるか → ③ 誰の責務か。**6 周の逸脱が全件分類できた**
  - ★ **作る部品 4 件**（[製品層の部品設計.md](製品層の部品設計.md)・props シグネチャまで）: `Select` の `width` prop（6/6 周）／`DataGrid` の宣言的列オプション `DataGridColumn`（6/6 周・**`ColumnDef` を公開 API から消す** → [DR-0072](DR/DR-0072-no-passthrough-of-dependency-types.md)）／`AppShell` の document shell 責務（5/6 周）／`Link` 部品（4/6 周）。＋語彙整備 1（`font-emphasis` が語彙表に無い——**我々自身が AppShell で使っているのに**）＋header 教え文の対更新 1（**L53 が `className="w-field-md"` と教えていた**＝面①は逸脱ではなく指示に従った結果）
  - **作らない**: 素材層 15 件の予防的ラッパー（0/6 周で棄却）
  - ★ **DS 8 本の調査**（[二層構造の設計.md](二層構造の設計.md)・[製品層の抽象化の軸.md](製品層の抽象化の軸.md)・全出典 URL つき）: **className を閉じた製品層は成立する**（Polaris・Spectrum が 7 年超運用・[DR-0071](DR/DR-0071-closed-product-layer-is-viable.md)）——ただし両方とも**部品の外に出口を対で持つ**。**我々の Layout プリミティブ（DR-0032）は Polaris の Box と同型**＝外部の先例が取れた。**Spectrum S2 は許可リストを型で機械化**（指摘 11 の実装例が実在）
  - 🟨 **指摘 12 を起票**: 思想は分類表であって**合成の規則を持たない**（役割分類がコード構造を決める DS は 8 本中 0 本）
  - 🟥 検算は**机上**。設計が実際に逸脱を消すかは**実装後の 7 周目**で測る
- ★★ 🆕 **D9=B で「設計が終わった」の範囲を広げ直した**（2026-08-07・ユーザー指示「**設計そのものが終わったらマージします**」）。
  初版（逸脱駆動の増分 4 件）は**確定した設計ではない**と判定し、**§2.10 に D9/D10 を追記してから**4 項目を足した（実行記録 **H8C-09 / H8C-10**）:
  - 🟦 **① 全部品の API 方針表**（[製品層の部品設計 §2.5](製品層の部品設計.md)）——公開部品 **33 件**に判定規則を一巡。動くのは 4 件で、**残り 29 件も「維持」と明示的に決めた（未決 0 件）**
  - 🟥 **② 語彙の全量突き合わせ**（§7）——`tokens.css` **32 変数**。宣言済み 19／**宣言漏れ 1**（`--font-weight-emphasis`）／**方針を決めた 6**（semantic 色は `StatusPill` 経由のみ）／**宣言対象外 6**（内部配線）。header の "complete vocabulary" は**これまで一度も検算されていなかった**
  - ★★ **③ document shell の器を確定**（§3.3）——**器は「配布 CSS の base レイヤ」。CSS は 1 行も足さず、宣言だけ**。
    🟥 **調査中に前提が崩れた**: **Tailwind Preflight が既に `*{margin:0;padding:0}` を当てている**（`node_modules/tailwindcss/index.css` 実測）。
    **面④a は「責務の欠落」ではなく「保証の未宣言」**だった。🟦 逆に **④b は Preflight が `a{color:inherit}` で見た目を剥がした結果**——**同じ `<style>` の 2 行が正反対の原因**。
    🟥 **未検証の前提 1 件を赤テストとして次の手の先頭に置いた**（`_ds_bundle.css` に Preflight が載っているか。**外れたら器は `AppProviders` へ倒れる**）
  - 🟦 **④ 合成方針 5 条**（§8）——単一部品＋union props を正とする／上流 compound は畳み直さない／`asChild` は需要 0 回なので導入しない ほか。指摘 12 への**我々側の答え**
  - 🟨 **追加調査 D10 で列 API を 2 箇所直した**——`numeric: boolean` → **`kind: 'text' | 'numeric'`**（boolean 宣言の先例は 5 件中 0 件）／**`size` は削除**して部品の既定へ（列ごとの typography 指定の先例も 0 件）
- **手0〜手7 が完了し、すべて `main` へマージ済み。**
  ✅ **手7 のマージも済んだ**——`5c36b88`（**GitHub の PR #1** 経由。`step/h7-design-agent-behavior`・2026-08-02）。
  🟨 **手7 だけマージの打ち方が違う。**手5・手6 はローカルで `--no-ff`、手7 は PR。**次回どちらで揃えるかは未決**（下記「次にやること」§1）。
  🟨 **`main` は別 worktree（`~/conductor/repos/design`）が持っている**ので、作業側から `git switch main` は落ちる。
  ローカルでマージするなら `git -C ~/conductor/repos/design merge --no-ff <branch>` の形で打つ。
- 🆕 **環境が変わっている。**handoff の「環境の再現」節は **WSL2 前提**で書かれているが、
  現在は **macOS ＋ Conductor の worktree**（`~/conductor/workspaces/design/<name>`）。
  🟥 **`~/git/CC-Skills` がこの機械に存在しない**（`validate.mjs` / `anti-slop.mjs` の出どころ。手8 で要る）。
  🟦 GitHub に public で残っているので clone で解ける（`yatami0/CC-Skills`）。
- ★★ **手8 を進行させた**（2026-08-02）。ブランチ `step/h8-output-passes-gates`。**Q1〜Q5・Q7 に答えが出た。**
  🟥 **一番の収穫: 「食い違い」ではなく「どちらも見ていない」だった**（[DR-0066](DR/DR-0066-neither-side-lints-the-generated-output.md)）。
  - **我々の機械ゲート 6 本は生成物を 1 文字も見ていない**（赤テストで確定。「対象 0 件で緑」の **14 例目**・**これまでで最も広い**）
  - **受け手の `_adherence.oxlintrc.json` は oxlint で読み込めない**——`no-restricted-syntax` が未実装で、
    **1 ルールの不在で設定全体が parse エラー**。動く 2 本まで道連れになる
  - **56 セレクタが走ったと仮定しても、当たる 5 件は全部偽陽性**（`onClick` / `onValueChange`）。
    🟥 **`.d.ts` からの props 抽出が継承分を落としている**——型は正しく、抽出が浅い
  - **TSX へ翻訳して我々のゲートに通すと ESLint 0 件・typecheck 本物 2 件**（`React.createElement` ＋ 必須 `children`）
  - 🟥 **`tabular-nums` はどちらの網にも規則が無い**——[DR-0063](DR/DR-0063-forbidding-without-an-alternative-fails.md) が残した 1 語は**赤にならない**
- 🟥 **[DR-0067](DR/DR-0067-inherited-asset-was-not-inheritable.md): CC-Skills の GitHub は空だった**（`Initial commit` の README 1 枚）。
  `validate.mjs` / `anti-slop.mjs` は**存在しない**＝ Q4 は「測れない」。**段取り §7 の行を訂正済み。**
  🟦 `tmp-admin` の値は手5 で写してあるので無事——**判定だけして写さなかったものが失われた。**
- ★★ **Q1 の答えは「使う」**（[DR-0065](DR/DR-0065-claude-design-uses-the-registered-components.md)）。
  **明示していない 1 周目から `<div>` `<button>` `<table>` が 0 件**で、**部品を足せば足すだけ使った**（種類 10 → 17 → 18）。
  → **段取り §5 の分岐は「往復ワークフロー成立」側に決した。手9 は「部品をコードごと移送する」形で設計してよい。**
- 🟦 **Q2 も効いた**（未決 #10 の後半に答え）——**`AppProviders`** は 30 部品に入っておらず、
  3 周目は `README.md` すらデザイン側に複製されていないのに、**3 周とも最外に 1 回**正しく置かれた。
- 🟨 **Q3 は半分だが、動かし方が分かった**——禁止文を 1 文字も変えずに、
  「**部品を足す**」「**語彙を足す**」の 2 つだけで逸脱が **5 → 2 → 1** に減った（[DR-0063](DR/DR-0063-forbidding-without-an-alternative-fails.md)）。
- 🟥 **[DR-0064](DR/DR-0064-design-project-receives-runtime-only.md)**: デザイン側に届くのは**ランタイム 3 ファイル ＋ system prompt の header だけ。**
  `components/**` も `guidelines/**` も 3 周とも来ていない。
- ★ **手5 は Q1〜Q8 すべてに答えが出て、完了条件 10 件も検証済み**（[実行記録 §手5 の締め](実行記録.md)）。
- **決定 24 件・発見 41 件を [docs/DR/](DR/index.md) に切り出し済み**（DR-0001〜**0065**）。
  🆕 **[DR-0059](DR/DR-0059-receiver-generates-its-own-adherence-lint.md)（手7 の着手前実測）**——
  **受け手は `.d.ts` から独自の lint 設定 `_adherence.oxlintrc.json` を自動生成していた**（ローカルには無い）。
  強制されるのは **`<button>` → `<Button>` の 1 本だけ**で、🟥 **`p-4` / `text-gray-600` は検出されない。**
  🟥 **[DR-0018](DR/DR-0018-design-sync-takes-preview-html.md) を superseded にした**——[DR-0057](DR/DR-0057-design-sync-uploads-compiled-code-not-just-html.md) が訂正（**手6 の作業内容が書き換わった**）。
- 🟨 **OBS は 11 件で `open` 5 件**（[docs/OBS/](OBS/index.md)。`connected` 3 ／ `promoted` 2 ／ `closed` 1・2026-08-02 に実ファイルで数え直した）。
  内訳: `open` = **OBS-0004 / 0005 / 0008 / 0009 / 0010**。🟦 **[OBS-0011](OBS/OBS-0011_規約ヘッダの言語は決定ではなく既定値だった.md) は手7 Q6 が答えを出して `closed`**（英語の規約 → 日本語の UI が 3 周とも成立）。
  **棚卸しを初回実施し、2 件を DR へ昇格させた**（OBS-0006→DR-0056 / OBS-0007→DR-0055）。
  🟥 **`open` 5 件のうち [OBS-0009](OBS/OBS-0009_不透明度と状態面の概念を理解する.md) だけが他をブロックしている**（OBS-0004 の指摘 8 が学習待ち）。

### 手5 でここまでに分かったこと（次の手が前提にすること）

| | |
| --- | --- |
| ★ 「本当に変わらない」箇所 | 🟦 **1 件**だけ（`--sidebar-width` のモバイル）。当初 15 件と見積もっていた（[DR-0043](DR/DR-0043-recount-of-fifteen-unchanged-spots.md)） |
| 1 周目「素直」で動いた | 実効変数 **58 件** |
| 2 周目「無理」の増分と代償 | **+29 箇所** ⇔ 取り残し **7**・語彙 **+6**・shadcn 内部への依存 **+9**（[DR-0047](DR/DR-0047-cost-of-forcing-the-swap-through.md)） |
| 🟥 事前特定から漏れていた | **不透明度修飾 58 箇所**。出発点に lint の赤を使ったため（[DR-0045](DR/DR-0045-opacity-modifiers-were-invisible-to-lint.md)） |
| 🟥 差し替えの届け方 | `@theme` に書くだけでは効かない。**`:root:root` で詳細度に勝つ**必要がある（[DR-0046](DR/DR-0046-theme-swap-loses-to-source-order.md)） |
| 🟥 「対象 0 件で緑」 | **9 例目まで到達。手5 だけで 4 例**（[DR-0046](DR/DR-0046-theme-swap-loses-to-source-order.md) 2 件・[DR-0044](DR/DR-0044-tailwind-resolves-tokens-at-build-time-too.md)・[DR-0048](DR/DR-0048-build-storybook-does-not-render.md)） |
| 素材層の diff | 🟦 **0 行**（Q4・6 回連続） |

### 🆕 棚が「認識合わせの装置」になった（[DR-0051](DR/DR-0051-storybook-organized-by-layer-with-viewpoint-cards.md)）

- **story の第 1 階層が層になった**（`① Tokens` / `② 素材層` / `② 製品層・ラッパー` / `② 製品層・自作` / `③ Patterns` / `④ Templates` / `★ Review`）。役割 9 カテゴリは第 2 階層に残る
- **`<Viewpoint>` 観点カード**が「観点の定義 / 期待 / **Claude が Playwright で測った実測値**」を出し、その下に現物が並ぶ
- **Playwright を計測器として導入**（`tools/visual-probe.mjs`。🟥 ゲートではない）。`src/stories/Review/_measured.json` を書き出す
- **役割分担**: 機械の観測は Storybook の観点カード／人の判定は [HTML アーティファクト](https://claude.ai/code/artifact/6e100f82-a3fc-42e1-b050-28f2920ece3c)。観点 ID（A〜J）で 1:1

### ✅ 手5 の答え（Q1〜Q8）— 詳細は [実行記録 §手5 の締め](実行記録.md)

| # | 問い | 答え |
| --- | --- | --- |
| **Q1** | 甲 24 箇所は追従するか | 🟦 **yes**（ただし影は「ビルドし直せば変わる」型） |
| **Q2** | 変異を潰さずに接続できるか | 🟨 **半分。**素直で 58 変数。無理で +29 箇所だが代償 3 種 |
| **Q3** | 16 行に無い場所が出るか | 🟥 **yes。58 箇所**（不透明度修飾） |
| **Q4** | 素材層を触るか | 🟦 **0 行**（**6 回連続**） |
| **Q5** | 壊れたら赤くなるか | 🟥 **無い**（手5 だけで 4 例・通算 9 例目） |
| **Q6** | 層タグで切り分けられるか | 🟨 **タグは「絞る」には効き「歩く」には効かない**。→ 階層に出した（[DR-0051](DR/DR-0051-storybook-organized-by-layer-with-viewpoint-cards.md)） |
| **Q7** | 当たり判定は 44px か | 🟥 **4 サイズ中 2 つが未達**（[DR-0049](DR/DR-0049-hit-area-reaches-44px-only-at-default-size.md)） |
| **Q8** | ① 層にも思想への指摘が出るか | 🟥 **yes。8 件目**——[トークンは「値の作り方」を分類しない](共通コンポーネント思想への指摘.md) |

### 🟦 目視レビューは完了した（2026-07-27）

| 観点 | 判定 |
| --- | --- |
| **A** 状態面 | 🟨 「色は合っているのに濃さが違う」→ 概念の理解は [OBS-0009](OBS/OBS-0009_不透明度と状態面の概念を理解する.md) へ |
| **B** 角丸 | 🟨 7.2/8 は分からない・16.8/18 は少し違う →「**届かないものは使わない**」で決着（[DR-0052](DR/DR-0052-unreachable-spots-are-avoided-by-not-using-them.md)） |
| **C** 影 | 🟥 「見にくくて微妙。**sm と md はほぼ同じに見える**」= 予測が当たった |
| **D** weight | 🟦 うるさくない → **600 のまま**（ユーザー確認済み） |
| **E·F** | 🟦 背景はぼやけていない → V1 成立 |
| **I** 層の比較 | 🟦 ペア形式に組み替えて伝わった。**ペア 2・3 とも確認済み** |

🟦 **ユーザーの目視と機械の実測は全観点で一致した。**ずれたのは**私が書いたラベルだけ**（[DR-0053](DR/DR-0053-viewpoints-must-be-answerable-by-eye.md)）。

### 🆕 持ち越した宿題 3 件はすべて片付いた（2026-08-01）

| # | やったこと | 結果 |
| --- | --- | --- |
| 1 | フォーカスリングを**実物の `Input`** で測り直した | 🟦 **予測どおり destructive が勝った**（ブランド青は出ない）。勝敗は詳細度ではなく**ソース順**。所見がずれたのは**検体が模型だった**から（[DR-0054](DR/DR-0054-mock-specimens-cannot-reproduce-stacked-states.md)） |
| 2 | `CardSurfaces` を `CardContent` 経由に直した | 🟦 `paddingLeft: 0px` → **16px / 16px** |
| 3 | Q6・Q8 に答えた | 🟦 上表のとおり |

🟨 **副産物: 計測器を 2 つ強くした。**① `focus` オプション（状態を当ててから測る）
② 🟥 **story id の実在チェック**（誤った id は全検体 `null` になるだけで止まらなかった。赤テストで `exit 1` を確認済み）。

🟨 **運用の注意が 1 つ増えた。**観点カードは `_measured.json` を**ビルド時に取り込む**ので、
**probe → 再ビルドの 2 周**を回さないと新しい実測値が画面に出ない。

## 進捗ボード

| 手 | 内容 | 手順書 | 状態 |
|---|---|---|---|
| 手0 | 土台（Next.js + Tailwind v4 + PoC 同一版・同一 lint） | （無し。フォーマット確定前） | ✅ **done** |
| 手1 | shadcn デフォルト導入 + 役割 9 カテゴリ割り当て | [手1](手順/手1_shadcn導入と役割分類.md) | ✅ **done** |
| 手2 | ① Tokens 層（3 層トークン ↔ shadcn 語彙 ↔ tmp-admin のマッピング） | [手2](手順/手2_トークン層マッピング.md) | ✅ **done** |
| **手2b** | **UI カタログ（Storybook 10.5）**。階層は役割 9 カテゴリ＝**手5 の判定装置** | [手2b](手順/手2b_UIカタログStorybook.md) | ✅ **done** |
| 手3 | ② Components 層（**素材層と製品層の境界**・Layout 自作テンプレ・枠を閉じる） | [手3](手順/手3_Components層と製品層の分離.md) | ✅ **done** |
| 手4 | ③ Patterns / Templates 層 + ダミーデータで一覧を組む | [手4](手順/手4_PatternsTemplates層と一覧.md) | ✅ **done** |
| 手5 | ★ トークン差し替え実験 | [手5](手順/手5_トークン差し替え実験.md) | ✅ **done**（2026-08-01・`main` へマージ済み `e88311a`） |
| 手6 | **`/design-sync` で Claude Design へ同期**（公式 converter。Storybook が入力） → 3 層とフラグは境界を越えるか | [手6](手順/手6_ClaudeDesignへの同期.md) | ✅ **done**（2026-08-01・`main` へマージ済み `b7a97f3`） |
| 手7 | ★ Claude Design で一覧を組ませる → 使うか作り直すか | [手7](手順/手7_ClaudeDesignに一覧を組ませる.md) | ✅ **done**（2026-08-02・`main` へマージ済み `5c36b88`）。★ **Q1 = 「使う」** |
| 手8 | 🟥 **問いが書き換わった**——「出力は lint / validate.mjs を通るか」→ **受け手の lint と我々の lint はどこで食い違うか** | [手8](手順/手8_出力は機械ゲートを通るか.md) | ✅ **done**（2026-08-02）。★ 答えは「食い違い」ではなく「**どちらも見ていない**」 |
| **手8c** | **製品層に何を作るべきかの調査設計**（素材層を組み合わせるための抽象層）。部品は 1 つも実装しない | [手8c](手順/手8c_製品層に何を作るべきかの調査設計.md) | ✅ **done**（2026-08-07・**PR #3 マージ済み `9801b66`＝設計確定**）。★ 判定規則 [DR-0070](DR/DR-0070-product-layer-boundary-rule.md)・設計 [製品層の部品設計.md](製品層の部品設計.md) |
| **手8d** | 🆕 **製品層の部品を実装する**（設計を 4 件のコードに落とし、機械ゲートまで通す） | [手8d](手順/手8d_製品層の部品実装.md) | ✅ **done**（2026-08-07・[PR #4](https://github.com/yatami0/design/pull/4)）。★ 器 A 確定・新しい赤ゼロ・[DR-0074](DR/DR-0074-we-wrote-the-same-deviations-ourselves.md)。🟥 **マージは人** |
| **手8e** | 🆕 **7 周目**（再同期 → 生成）で検算を実測に変える。🟥 **`/design-sync` は人が打つ** | 未作成 | ⬜ **次の手**。予測は[実行記録 §手8d H8D-08](実行記録.md)に登録済み |
| **手8b** | 🆕 **preset 差し替え**（値では解けない「形」の衝突を、部品の作りを選び直して解けるか） | 未作成 | ⬜ 🟨 **「やらない」も結論**（[DR-0056](DR/DR-0056-preset-swap-is-its-own-step.md)） |
| 手9 | 移送手順（人が実行）+ PoC の docs へ DR/OBS で戻す | 未作成 | ⬜ |

## 機械ゲートのベースライン ★重要

**赤がベースライン**（DR-0007 により shadcn の赤を ignore していない）。
次セッションは**この数字と比較**して「新しい赤が出たか」を判定する。

**ゲートは 6 本になった**（手2b D4 で `build-storybook` を追加）。

```bash
pnpm typecheck && pnpm lint && pnpm build && pnpm format:check && pnpm spell && pnpm build-storybook
```

| ゲート | 手4 完了時 | 手5 完了時 | **手6 完了時（2026-08-01）** | 備考 |
|---|---|---|---|---|
| `pnpm typecheck` | 🟦 緑 | 🟦 緑 | 🟦 **緑** | 🟥 **借金で緑になった。**手3 D5=A で `exactOptionalPropertyTypes` を false にしただけ（DR-0014） |
| `pnpm lint` | 🟥 error 33 / warning 1 | 🟥 error 33 / warning 1 | 🟥 **error 33 ／ warning 1**（ゼロ増） | **error はゼロ増**（全部素材層）。warning は TanStack Table 由来。🟥 **手6 で一度 14,047 まで跳ねた**（下記） |
| `pnpm build` | 🟦 緑 | 🟦 緑 | 🟦 **緑** | typecheck と同一原因＝**同じ借金** |
| `pnpm format:check` | 🟦 緑 | 🟦 緑 | 🟦 **緑** | shadcn 出力と手6 の生成物は `.prettierignore`（DR-0007） |
| `pnpm spell` | 🟦 緑 | 🟦 緑 | 🟦 **緑** | 手6 で固有名詞 3 語（`Menlo` / `Consolas` / `Segoe`）＋ 生成識別子 `datadisplay` を追加 |
| `pnpm build-storybook` | 🟦 緑 | 🟦 緑 | 🟦 **緑** | story **37 本** → 🆕 **手8d で 41 本**（Select `Widths` ＋ Link 3）。🟥 **緑は描画を保証しない**（DR-0048） |

**手2〜手6 とも、最終的な新しい赤はゼロ。**🆕 **手8d も同じ**——error 33 / warning 1 で**内訳まで一致**
（`tailwindcss/no-arbitrary-value` 24 ／ `restrict-template-expressions` 4 ／ `no-confusing-void-expression` 4 ／ `set-state-in-effect` 1 ／ warning は `DataGrid` の `react-hooks/incompatible-library`）。
🟦 **cspell は辞書を 1 語も足さずに緑**（233 ファイル検査）。

> 🟥 **手6 で射程が漏れて lint が error 33 → 14,047 になった。**内訳は生成物だけ——
> `.design-sync/sb-reference` 12,739 ／ `ds-bundle` 1,307 ／ `.design-sync/.cache` 14 ／ `.ds-sync` 6。
> **ソースは 34 件のままだった**（`src/components` 31 + `src/hooks` 3）。
> → `eslint.config.mjs` / `.prettierignore` / `.gitignore` に生成物 4 集合を追加して復帰。
> **[DR-0040](DR/DR-0040-frame-leaks-when-a-layer-is-added.md)（層を足すたびに射程が漏れる）の 3 例目**（1 例目は手2b の `.storybook/**`、2 例目は手4 の ③ 層）。
> 🟦 `.design-sync/` は丸ごと外さず**生成物だけ**を外した（`previews/` と config/NOTES は検査対象に残す）。

> 🆕 **手6 で「対象 0 件で緑」が 2 例出た（通算 11・12 例目）。**どちらも converter が
> **`exit 0` で `✓ wrote ./ds-bundle` まで出しながら `components: 0`** だった
> （① `dist/types` が無い ② `.d.ts` の `@/` が解決できない）。**終了コードでは分からず、ログの数字で気づいた。**

> 🆕 **手7 の着手時に 13 例目が出た。**cspell の赤テストを `/tmp` のファイルで打ち、
> **`Files checked: 0` のまま緑**になった（repo 配下に置き直して `exit 1` を確認）。
> 🟨 **今回は「ゲート」ではなく「ゲートが効くことを確かめる赤テスト」自体が対象 0 件で緑になった**——
> **検証装置も検証しないと信用できない**という形は初めて。

> 🆕 **2026-08-07: `cspell` に新しい赤 4 件が「手に属さないコミット」から出ていた**（`a99be8c` の DR-0073 / OBS-0012）。
> **手8c の締めでゲートを回した後に足されたので、締めの緑とは無関係に赤が積まれていた**——
> 🟨 **ベースライン表は手の完了時ではなくゲートを回すたびに突き合わせる**（第 3 セッションの教訓の 2 例目）。
> → `takumi`（実在のパス片）と `tostring`（jq の組み込み）を辞書へ。**どちらも誤記ではなく実在の識別子**なので、`datadisplay` と同じ扱い。
>
> 🟨 **第 5 セッションで `pnpm spell` に新しい赤が 2 度出たが、どちらも辞書を触らず消した。**
> ① 私がコメントに書いた綴り（story id の打ち間違いを本文にそのまま書いた）② DR 本文の同じ綴り。
> **辞書に足すのは固有名詞だけ**——誤記の例示は**書き方を変えて消す**（第 4 セッションでビルド成果物のハッシュを消したのと同じ扱い）。

> 🟥 **緑をこれまで以上に信用しない。**手5 だけで「対象 0 件で緑」が **4 例**出た
> （[DR-0044](DR/DR-0044-tailwind-resolves-tokens-at-build-time-too.md)・[DR-0046](DR/DR-0046-theme-swap-loses-to-source-order.md) が 2 例・[DR-0048](DR/DR-0048-build-storybook-does-not-render.md)）。通算 **9 例目**。
> とくに **`build-storybook` は story が実行時に落ちても exit 0**（DR-0048）。**描画は検証していない。**

> 🟥 **手3 で緑が 2 本増えたが、これは前進ではなく借金。**`exactOptionalPropertyTypes` を false にしただけで、
> **手9 の移送時に必ず赤が復活する**（DR-0014）。次セッションはこの数字を「良くなった」と読まないこと。

> ⚠ **2026-07-26（第 3 セッション）に `pnpm spell` のベースラインが陳腐化していたことが分かった。**
> `trace` plugin を入れたコミット群（`22bd68b` ほか）が CLAUDE.md に `aisy` を持ち込み、**この表を更新しないまま赤になっていた**。
> `git stash -u` して HEAD 単体で回す**対照実験**で、**私の変更前から赤 2 件**であることを確認済み。
> → 辞書に `aisy` / `wcag` / `dtcg` / `shadeed` / `dodds` / `martinfowler` を追加し、**緑に戻した**（手2b で `largetitle` 等を足したのと同じ扱い）。
> 🟨 **教訓: 手に属さない作業（plugin 導入）でもゲートは動く。**ベースライン表は手の完了時だけでなく、**ゲートを回すたびに突き合わせる。**

内訳を取り直すコマンド:

```bash
./node_modules/.bin/eslint . -f json > /tmp/lint.json
node -e "const r=require('/tmp/lint.json');const m={};for(const f of r)for(const x of f.messages)m[x.ruleId]=(m[x.ruleId]||0)+1;console.log(m)"
```

## 環境の再現

> 🆕 **2026-08-02: 環境が変わっている。**以下の 2 節のうち**上が現行**、下（WSL2）は手5〜手7 当時の記述。

### 🆕 現行（macOS ＋ Conductor worktree・2026-08-02 実測）

```bash
cd ~/conductor/workspaces/design/<workspace 名>   # `main` は ~/conductor/repos/design が持つ
```

🟥 **`pnpm <script>` がそのままでは落ちる。**2 つ穴がある。

| 穴 | 症状 | 回避 |
| --- | --- | --- |
| **① pnpm 11 の依存チェック** | `pnpm typecheck` 等が実行前に `pnpm install` を走らせ、`ERR_PNPM_IGNORED_BUILDS`（`esbuild` / `sharp`）で `exit 1`。🟥 **副作用でプレースホルダの `pnpm-workspace.yaml` が生える**（`allowBuilds: set this to true or false`）。**生えたら消す**——`cspell` が `esbuild` を拾って**新しい赤**になる | `./node_modules/.bin/<tool>` を直接叩く |
| **② mise が非対話シェルで効かない** | `node -v` が **22.16.0**（`mise.toml` は 24）。`cspell` が `Unsupported NodeJS version (22.16.0); >=22.18.0 is required` で落ちる | `export PATH="$HOME/.local/share/mise/installs/node/24.18.1/bin:$PATH"` |

**ゲート 6 本を直接叩く形**（2026-08-02 にこの形で全本回してベースラインと一致を確認済み）:

```bash
export PATH="$HOME/.local/share/mise/installs/node/24.18.1/bin:$PATH"
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint .
./node_modules/.bin/next build
./node_modules/.bin/prettier --check .
./node_modules/.bin/cspell --no-progress --gitignore "**"
./node_modules/.bin/storybook build && rm -rf storybook-static
```

🟨 **`pnpm approve-builds` で ① を恒久的に塞げる見込みだが、まだやっていない**——
`pnpm-workspace.yaml` が repo に増えることになるので、**移送物が変わる**（手9 に効く）。**未決 #27。**

### WSL2（手5〜手7 当時の記述・そのまま残す）

```bash
cd ~/git/design
pnpm install          # node 24 / pnpm 10（mise.toml で node 24 を固定）
pnpm storybook        # UI カタログ → http://localhost:6006
pnpm dev              # 本体アプリ  → http://localhost:3000
```

**起動して何を見るか・トークン差し替えを手で試す手順は [README](../README.md#ローカルで起動する) にある。**

### 🆕 目視の計測器（手5・`tools/visual-probe.mjs`）

```bash
pnpm build-storybook
export LD_LIBRARY_PATH=$HOME/.local/lib/playwright-deps/usr/lib/x86_64-linux-gnu
node tools/visual-probe.mjs        # → tmp/visual-probe/*.png + src/stories/Review/_measured.json
```

🟥 **WSL2 では素の `playwright install chromium` だけでは動かない。**（`sudo` にパスワードが要るため）

| 不足するもの | 入れ方（root 不要） |
| --- | --- |
| `libnspr4` / `libnss3` / `libnssutil3` / `libasound2t64` | `apt-get download` → `dpkg-deb -x` で `~/.local/lib/playwright-deps` へ展開し `LD_LIBRARY_PATH` を通す（**永続化済み**） |
| 日本語フォント | `fonts-noto-cjk` を同じ手口で `~/.fonts` へ（**やらないと全部豆腐になり日本語の目視が成立しない**） |

- **トークン差し替えの切り戻し**: `src/app/globals.css` の `@import './tmp-admin.css'` と
  `@import './tmp-admin-override.css'` の **2 行をコメントアウト**（1 周目だけ見るなら override の 1 行）

依存は**すべて PoC の catalog と同一値で厳密ピン**（DR-0003）。`^` で入っているのは shadcn が追加した 7 件のみ（DR-0016）。
Storybook 関連 6 件（手2b）も**厳密ピン**。カタログは `pnpm storybook`（開発）／ `pnpm build-storybook`（ゲート）。

## 確定済みスコープ

| 項目 | 決定 | 出典 |
|---|---|---|
| 本 repo の役割 | ワークフロー検証。成果物は「決定 + 移送可能なコード」 | DR-0001 |
| 移送 | **境界を越える瞬間だけ人が実行する** | DR-0001 |
| 検証対象 | 画面ではなく 3 層。画面は部品を洗い出させる口実 | DR-0002 |
| 検証スコープ | チケット一覧 1 画面 | DR-0002 |
| 部品分類 | [共通コンポーネント思想](共通コンポーネント思想.md)（役割 9 カテゴリ）。Atomic Design は採らない | DR-0002 |
| トークン | 語彙の正本は design 側 → PoC へ逆輸入。値は CC-Skills の `tmp-admin` | DR-0005 |
| トークン投入 | **2 段階**（shadcn デフォルトで組み切ってから流し込む） | DR-0005 |
| shadcn | `base=radix` / `preset=nova` / CLI `4.15.0` 固定 / 部品 18 件 | DR-0006 |
| 赤の扱い | ignore もルール緩和もしない。**赤の内訳が成果物** | DR-0007 |
| UI カタログ | **Storybook 10.5**（`@storybook/nextjs-vite`）を手2b で導入。階層は役割 9 カテゴリ | DR-0017 |
| Storybook の範囲 | **描画のみ**（+ `addon-a11y`）。`storybook build` を機械ゲートに追加 | DR-0024 |
| 手5 の判定方法 | **静的分類 + 実効値計算 + 目視**の 3 段。CSS の diff では判定できない | DR-0027 |
| Claude Design への受け渡し | **プレビュー HTML**（`@dsCard group="…"`）。story も React も渡らない | DR-0018 |
| semantic 語彙 | spacing / typography は**用途名で自前定義**（`--spacing-inset-*` 等・値は既定への参照） | DR-0019 |
| dark モード | **トークン差し替えの対象外**。`.dark` は shadcn 既定のまま残す | DR-0020 |

## 手2 の成果（次の手が前提にすること）

**[トークンマッピング.md](トークンマッピング.md) が手5 の実行手順そのもの。**表1 を上から順に実行するのが手5。

| 事実 | 数字 | 効く先 |
|---|---|---|
| 思想の 3 層は **3 層とも実在する** | primitive 419 / semantic 色 18 / **component 11** | DR-0022。段取り §3.5 #4 を訂正済み |
| 欠けているのは **semantic 層の spacing / typography だけ** | 各 0 件 | → `src/app/tokens.css` で自前定義済み（DR-0019） |
| tmp-admin を写したときの対応 | 1:1 **17** / 多:1 8 / 1:多 1 / 🟥 **無し 22** | 手5 の半分は「語彙の追加」 |
| ~~🟥 手5 で変わらない箇所は 15 件が事前特定済み~~ → 🟥 **実測で 1 件だった** | ~~生値 8 + 触れない 7~~ → 甲 2（17 箇所）/ 乙 6 / **丙 1** / 対象外 6 / 削除 1 | **[DR-0043](DR/DR-0043-recount-of-fifteen-unchanged-spots.md) が更新した**（未決 #18）。手5 の観測点は Q1〜Q3 に分割 |
| shadcn 部品の直書き | spacing **132 箇所** / text サイズ **43 箇所** | 自前 semantic 層は**自作 Layout テンプレにしか効かない** |
| 本当の衝突は accent ではなく **touch-min 44px** | button default `h-8`(32px) | **手3 の判断へ**（DR-0023） |

### 手2 で新設したもの

- `src/app/tokens.css` — 用途名の semantic spacing 9 / typography 6。**値は書かず既定への参照**（手5 で参照先を向け替える）
- `globals.css` に `@source not '../../docs'` — Tailwind が docs の md を走査してクラスを生成していたため（DR-0021）

## 手2b の成果（次の手が前提にすること）

**判定装置が立った。**`pnpm storybook` で役割 9 カテゴリの階層に 18 部品 + Foundations が並ぶ。

| 事実 | 数字・内容 | 効く先 |
|---|---|---|
| ★ **手5 の判定方法が確定** | CSS の diff では**1 行しか動かない**（全部 `var()` 参照）。正しくは **① 参照の形で静的分類 ② 実効値の計算 ③ 目視で裏取り** | **未決 #5 を閉じた**（DR-0027） |
| ★ **予行演習に成功** | `--radius` 10px → 24px で、事前特定していた Checkbox `rounded-[4px]` と Tooltip `rounded-[2px]` が**実際に変わらなかった** | **手5 を実行してよい状態** |
| 🟨 (B) 群は「条件つき」 | `min(var(--radius-md), 10px)` は**小さくする方向なら追従、大きくすると頭打ち** | 手5 では**差し替えの向きも記録する** |
| 部品を触っていない | `src/components/ui/**` は 1 行も変更なし | 手5 の前提は保たれている |
| 配線が要る部品は 2 件 | `Tooltip`（`TooltipProvider`）／`Sidebar`（`SidebarProvider`）。story 側の decorator で解決 | [部品カタログ 表2](部品カタログ.md) の指摘 1・3 が実装でも顕在化 |
| 🟨 CSS パイプラインが 2 本 | 本体は oklch を **hex + lab** に展開、Storybook は **oklch のまま**。値は等価 | 判定は **Storybook 側に固定する**（DR-0026） |
| 🟥 移送コスト | 依存 22 → **28**（+6 を厳密ピン）／`pnpm-lock.yaml` **+1,991 行** | 手9（DR-0024） |

### 手2b で新設したもの

- `.storybook/main.ts` / `preview.tsx` — addon は **a11y と docs の 2 つだけ**（D10）
- `src/stories/<役割カテゴリ>/*.stories.tsx` — **19 ファイル**（部品 18 + Foundations/Tokens）
- `tsconfig.json` の `include` に `.storybook/**` — 🟥 **足すまでゲートの射程外だった**（DR-0025）
- `eslint.config.mjs` に `eslint-plugin-storybook` を**正しく配線**（init は import だけ足していた）

## 手3 の成果（次の手が前提にすること）

**役割 9 カテゴリがコード上に実在するようになった。**`src/components/<役割カテゴリ>/` に 25 ファイル。

| 事実 | 数字・内容 | 効く先 |
|---|---|---|
| ★ **三層が揃った** | 素材 18（無変更）／製品 25（再輸出 16・ラッパー 2・自作 7）／棚 26 story | 手4 はここから import する |
| ★ **枠は props で閉じ、lint が補助する** | Layout は `className` を受けない。逃げ道は `Box` 1 つ。lint は 8 セレクタ（数値の段・パレット色 × className/cva/cn × Literal/Template） | [DR-0032](DR/DR-0032-layout-primitives-take-props-not-classname.md)・[DR-0033](DR/DR-0033-step5-criteria-differ-per-layer.md) |
| 🟦 **製品層とアプリ層の lint 赤は 0 件** | 残る 33 件は**全部素材層**。`page.tsx` は Layout プリミティブで書き直した | **手5 の判定基準がそのまま使える** |
| 🟦 **Box への逃げは 0 回** | 7 部品すべて semantic 語彙だけで組めた | Q1。**増え始めたら設計の穴** |
| 🟨 **語彙を 3 つ足した** | `--container-content` / `--container-wide` / `--spacing-gutter`。Container を書いて初めて不足が判明 | Q1。トークンマッピング 2.4 の予告どおり |
| 🟨 **欠落リストに無い部品が 1 つ要った** | `Inline`（横並び）。思想の Layout 6 件では横方向が組めない | **思想への指摘 6 件目** |
| 🟦 **`--card-spacing` が semantic 層に載った** | レイヤ外の 2 規則。`card.tsx` は無変更。バリアントも保持 | **手5 で同型の接続点を全件探す**（未決 #18） |
| 🟦 **当たり判定 44px が CSS に出た** | `@media (pointer:coarse)` で `inset:calc(var(--spacing-hit-expand) * -1)`。nav-item は `min-height:var(--spacing-touch-min)` | 🟥 **目視での裏取りは未実施**（axe は 24px しか測らない） |
| ★ **story の雛形に型が取れた** | 自作 7 件は同型でスクリプト生成できた。素材 18 件では取れなかった | **2 回目の需要が証明された**＝手9 の仕組み化候補 |
| 🟥 **借金を 1 つ作った** | `exactOptionalPropertyTypes: false`。typecheck と build が緑になったが**解決ではない** | **手9 で必ず赤が復活する** |

### 手3 で新設したもの

- `src/components/<役割 9 カテゴリ>/` — 再輸出 16 ／ ラッパー 2（Button・Sidebar）／ 自作 Layout 7
- `src/components/Layout/tokens.ts` — **props で取れる値の union（枠の実体）**
- `src/components/providers.tsx` — `AppProviders`（中身が増えるのは手4）
- `eslint.config.mjs` — `no-restricted-imports`（D3=B）＋ `no-restricted-syntax` 8 セレクタ（D4=B′）
- `src/app/tokens.css` — 語彙 15 → 21 ＋ `--card-spacing` の向け替え 2 規則
- story に**層タグ**（`vendor` 16 ／ `wrapped` 2 ／ `own` 7）— 手5 で由来を切り分けるため

## 手6 の成果（次の手が前提にすること）

**Claude Design プロジェクト `design — UI検証`**（`3acbb737-85fe-4098-95f4-c99070168ba1`）に
**14 部品**が入った。URL: <https://claude.ai/design/p/3acbb737-85fe-4098-95f4-c99070168ba1>

| 問い | 答え |
| --- | --- |
| **Q1** converter のライブラリビルド要求を満たせるか | 🟦 **満たせた。ただし 3 段必要**（`cfg.entry` ＋ `dist/types` ＋ `.d.ts` の `@/` 相対化）。②③ はどちらも**「対象 0 件で緑」**——通算 11・12 例目 |
| **Q2** Storybook は基準器として使えるか | 🟦 **使えた。14/14・全 20 story が `match`**（`close` も `skip` もゼロ・factual failure ゼロ） |
| **Q5** 役割 9 カテゴリは `group` に載るか | 🟦 **そのまま載った**（`action` / `datadisplay` / `layout` / `navigation` / `patterns` / `templates`）。[DR-0051](DR/DR-0051-storybook-organized-by-layer-with-viewpoint-cards.md) の棚の組み替えが境界の向こうで効いた |
| **Q6** 素材層を触るか | 🟦 **0 行（7 回連続）** |
| **Q7** `thin` / `variantsIdentical` に弾かれるか | 🟦 **ゼロ**（total 14 / bad 0 / thin 0 / variantsIdentical 0）。**story 1 本の Layout プリミティブも弾かれなかった**＝手順書の懸念は外れ |
| **Q3** tmp-admin の値は載るか | 🟦 **載った。赤テストで確定**——`#003a63` / `#005fa2` / `#009fe8` / `#34c759` / `#ff3b30` / `#ff9500` が `_ds_bundle.css` に計 10 箇所。🟥 **ただし `tokens/` は空**（converter の `tokens/` は別パッケージ用で、本 repo は CSS に焼き込まれる形） |
| **Q4** フラグ 5 種は書けるか | 🟦 **書けた**（conventions header）。🟥 **効くかどうかは手7** |
| **Q8** 思想への指摘 9 件目 | 🟥 **yes。9 件目**——[分類の軸が 3 本あるのに、渡し先の器は 1 本しか持てない](共通コンポーネント思想への指摘.md)。層と役割は `group` 1 本に潰れ、フラグは散文へ手で翻訳した |

🟥 **conventions header の validate 工程が実装の穴を 1 件掘り当てた**——
**`useListDetail` を `src/index.ts` から export しておらず、`ListDetail` が組み立て不能だった。**
Storybook では story 内で hook を直接呼べるので露見せず、**機械ゲート 6 本も通っていた。**

🟥 **ゲートの射程がまた漏れた（[DR-0040](DR/DR-0040-frame-leaks-when-a-layer-is-added.md) の 3 例目）。**
生成物を lint が拾って **error 33 → 14,047**（ソースは 34 のまま）。`eslint` / `prettier` / `gitignore` に 4 集合を追加。

✅ **手6 は完了した**（完了条件 10 件とも**チェックを付ける前に検証**）。

#### 手6 §2 の判断 D1〜D8（すべて決着済み・記録用）

手順書 → [手6_ClaudeDesignへの同期.md](手順/手6_ClaudeDesignへの同期.md)（ブランチ `step/h6-preview-html`）。

> 🟥 **初稿は捨てて書き直した。**「プレビュー HTML を自前で作る手」として設計していたが、
> **ユーザーの指摘（「公式コマンドがあったはず。Playwright は使わないはず」）を受けて一次情報を取ったら前提が崩れた**
> （[DR-0057](DR/DR-0057-design-sync-uploads-compiled-code-not-just-html.md)）。**手6 は「公式 converter を走らせる手」。**

| # | 論点 | 決定 | 実行してどうだったか |
| --- | --- | --- | --- |
| **D1** | ライブラリビルドが無い問題 | **D**（`--entry` を試す → 駄目なら足す） | 🟦 **`--entry` は通った**が、それだけでは部品 0 件。**宣言ビルド（`dist/types`）と `.d.ts` の `@/` 相対化まで必要**だった |
| **D2** | 何を同期するか | **B**（ユーザー判断） | 🟦 **14 部品**（① Tokens の story は部品でないので `titleMap: null`。トークン自体は CSS 経由で届く） |
| **D3** | どのトークンを載せるか | **A**（tmp-admin 適用後） | 🟦 `_ds_bundle.css`（参照 Storybook から採取）に載った |
| **D4** | フラグ 5 種（未決 #10） | **C**（`.prompt.md` と conventions header の両方） | 🟦 書けた。🟥 **効くかは手7** |
| **D5** | 1 周目のスコープ | **B**（製品層に絞る） | 🟦 14 部品・20 story で 1 周完了 |
| **D6** | skill の起動 | **A**（`/design-sync`） | 🟦 **人が打った。**Claude 側からは起動できない |
| **D7** | 登録先と外向き操作の承認 | ✅ **ユーザー判断**（Claude Design なら問題なし） | 🟦 公式 skill が first sync で必ず新規プロジェクトを作るので既存資産は無傷 |
| **D8** | 本体と Storybook のフォント差 | **D**（ユーザー判断） | 🟥 **合わせる先が逆だった**（[DR-0058](DR/DR-0058-app-only-font-never-reached-the-design-system.md)） |

#### H6-01 — 射程と認証（2026-08-01）

```
DesignSync({method: 'list_projects'}) → {"projects":[]}
```

| 確認点 | 結果 |
| --- | --- |
| 認証 | 🟦 **通った**（ユーザーが `/design-login` を実施） |
| 書き込み可能なプロジェクト | 🟦 **0 件** → **新規作成になる**（skill §1 の既定と一致） |

🟥 **代わりに起動経路の問題が確定した**——**`/design-sync` は Claude 側から起動できない。**
`/design` のサブコマンドとして登録された**人が打つスラッシュコマンド**で、skill 一覧には出ない。
しかも converter 本体（`package-build.mjs` / `compare.mjs`）は `<skill-base-dir>` から staging される想定なので、
**skill を起動しないとそのパスが手に入らない**＝手で写して走らせる案（D6=B）は事実上とれない。
→ 🟥 **手6 の実行は「ユーザーが `/design-sync` と打つ」から始まる。**

#### 環境の穴（2026-08-01 実測）

| 状態 | 内容 |
| --- | --- |
| 🟦 **塞がった** | **`trace` plugin が使えるようになった**（`trace:dr` / `trace:obs` / `trace:handoff` / `trace:commit` / `trace:adr`）。🟨 ただし **DR-0057 と手6 の手順書は plugin が無い間に書いた**ので、語彙は手で `.claude/trace.config.mjs` と突き合わせただけ——**機械検査は通していない** |
| 🟨 **残る** | **chromium バイナリが未導入**（`playwright` 1.58.0 は devDependency にあるがブラウザは別）。storybook shape では compare ループが必須なので、H6-06 の前に要る |

## 次にやること

✅ **手8c（設計）も 手8d（実装）も完了した**（2026-08-07）。
🆕 **次の一手は 7 周目＝手8e。🟥 ただし `/design-sync` は人が打つので、着手はユーザー操作から始まる。**

### 🟥 0. 手8d の後始末 → 7 周目へ（ユーザー操作 2 件）

| # | やること | 状態 |
| --- | --- | --- |
| 1 | **PR をマージする**——🟦 **PR は出した**（[#4](https://github.com/yatami0/design/pull/4)・ブランチ `malabo`）。[DR-0068](DR/DR-0068-merge-through-pull-requests.md) により**マージは人** | 🟥 **マージ待ち** |
| 2 | **`/design-sync` を打つ**（人が起動。Claude 側からは起動できない・手6 D6 の実測）→ 私が `DesignSync` で持ち帰り、**7 周目の生成と検算**を回す | 🟥 **未実行** |
| 3 | 🟥 **7 周目でまず打つ赤テスト 2 本**: ① 本物の `_ds_bundle.css` に Preflight が載っているか（器 A の最終確認。**外れたら器は B へ倒れる**）② `<Name>.prompt.md` に `w-48` / `font-mono` が**実例として**載っていたか（[DR-0074](DR/DR-0074-we-wrote-the-same-deviations-ourselves.md) の推論の検証） | 7 周目の先頭 |
| 4 | **予測は登録済み**（[実行記録 §手8d H8D-08](実行記録.md)）——面①③④ は消える／🟥 **header を 6 箇所動かしたので予測していない所が壊れうる**（DR-0069 の形） | 7 周目 |
| 5 | 🟨 あわせて **手8b の動機を測り直す**（製品層で包む範囲が広がったので「やらない」の目が上がった） | 7 周目の後 |
| 3 | **D3=C・D8=B の事後承認**——手8c の調査範囲を推奨（B/A）より広げた判断は、ユーザーの「詳細な調査から設計が重要です」（2026-08-07）を根拠にした。**異議があれば言ってほしい**（結果は変わらないが、判断の形として記録に残す） | 🟨 事後報告 |
| 4 | 🟨 実装後の **7 周目**（再同期 → 生成）で検算を実測に変える。あわせて **手8b の動機を測り直す**（D7 §2.7——製品層で包む範囲が広がったので「やらない」の目が上がった） | 実装後 |

### ~~1. 手8 の残り 2 件を片付けて締める~~ ✅ 完了（2026-08-02）

**§2 の D1〜D13 は全件決着済み**（D1〜D8 はユーザー判断、D9〜D13 は実行中に §2 へ追記してから決めた）。

| # | 残り | 誰がやるか |
| --- | --- | --- |
| ~~Q6~~ | ✅ **答えが出た**（6 周目の対照で確定）。**conventions header は効く。ただし「効く」と「壊す」が同時に起きる**——禁止した 2 件は消え、禁止していない骨格 3 部品と DSL の綴りが壊れ、**戻すと両方戻った**（[DR-0069](DR/DR-0069-adding-prohibitions-to-the-header-degraded-the-output.md)） | ✅ 完了 |
| ~~Q8~~ | ✅ **起票した**（[指摘 11](共通コンポーネント思想への指摘.md)）——**思想は「定義したものだけを使う」（許可リスト）で語るが、機械の網は両側とも禁止リストしか持てない。**🟥 **これだけは思想の文言を直しても解けない**（検査の形を変えないと閉じない）。🟨 **一覧表が指摘 10 を取りこぼしていたので、あわせて揃えた** | ✅ 完了 |

🟨 **完了条件はほぼ埋まっている。**残るのは Q6 の実測と、実行記録へのチェック。

#### 🟥 4 周目の打ち方（残り 3 手・人が実行する）

| # | やること |
| --- | --- |
| ~~1~~ | ~~`/design-sync`~~ → ✅ **完了**（2026-08-02）。**予測どおり `ds-bundle` の部品側は同一バイト**で、動いたのは aux（README＝ヘッダ）だけだった |
| 2 | claude.ai/design で**新しいデザインプロジェクト**を作り、参照 DS に **`design — UI検証`** を選ぶ（🟥 `Modernist` と取り違えない） |
| 3 | **手7 H7-03 の依頼文をそのまま打つ**（手順書 [H8-10](手順/手8_出力は機械ゲートを通るか.md) に全文。🟥 **1 文字も変えない**） |
| 4 | projectId を渡してもらえれば、私が `DesignSync` で持ち帰って数える |

**打つ前の予測（登録済み）**: ① `<style>` の生 CSS が消える ② `tabular-nums` が消える
③ 部品の使い方は 3 周目と変わらない ④ 「探しに行く」挙動は**測れないので Q6 に数えない**。

🟥 **② が外れたら「許可リストは散文では閉じられない」が確定し、[指摘 11](共通コンポーネント思想への指摘.md) §11.3 の
「許可リストを機械化する検査」の必要性が 2 回目**になる（2 回ルールの判定へ）。

### 2. 🟨 マージの打ち方を揃えるか（🆕 未決 #26）

手5・手6 は**ローカルで `--no-ff`**、手7 は **GitHub の PR #1**。
[CLAUDE.md](../CLAUDE.md) は `--no-ff` マージと書いており、**PR は書かれていない。**
🟨 **どちらかに揃えるか、両方を認めて CLAUDE.md に追記するか。**

### 3. 🟨 [OBS-0010](OBS/OBS-0010_フォント修正で手5の目視判定をやり直すか.md)（数分で解ける・持ち越し 3 回目）

`pnpm storybook` で `★ Review/D タイポ` を開き直すだけ。

### 4. 🔺 ADR 起案の時機（未決 #20）

昇格候補 **4 件**（DR-0032 / DR-0033 / DR-0034 / DR-0052）。🟨 **手7 で候補が増えた可能性**——
[DR-0063](DR/DR-0063-forbidding-without-an-alternative-fails.md)（禁止と代替の対）は**外から見える規約に効く**ので、次の判定で見る。

### 5. 🟥 [OBS-0009](OBS/OBS-0009_不透明度と状態面の概念を理解する.md) の学習（他をブロックしている観点）

**手に紐づかないので、いつやってもよい。**

### 手7 が手8 へ渡したもの（手順書 §0・§1 に取り込み済み）

| 手7 が渡すもの | 手8 で効くこと |
| --- | --- |
| 🟥 **`tabular-nums`（`DataGrid.columns[].cell` 経由）が 3 周とも残った** | **赤の内訳として持っていく。**語彙では塞がらない面（[DR-0060](DR/DR-0060-vocabulary-leaks-from-four-surfaces.md) の ③） |
| 🟥 **`<style>` への生 CSS が 2 例目** | [2 回ルール](../CLAUDE.md)は成立済み。header に 1 文足すのが最小 |
| 🟥 **header の `guidelines/docs/…` 参照に宛先が無い**（[DR-0064](DR/DR-0064-design-project-receives-runtime-only.md)） | 参照を削るか、要点を header 本文へ畳む（手8 の H8-09） |
| 🟥 **成果物は JSX ではなく `.dc.html`**（`x-import` ＋ `DCLogic`） | **本 repo の ESLint はそのままでは読めない。**手8 の最初の障害はここ＝ **Q1** |
| 🟦 **受け手も lint を持っている**（[DR-0059](DR/DR-0059-receiver-generates-its-own-adherence-lint.md)） | 我々の lint と**どこで食い違うか**を数える＝ **Q2 と食い違い表** |
| 🟥 **借金が復活する**（`exactOptionalPropertyTypes: false`・DR-0014） | 手9 の移送時。**手8 の Q5 で先に見えるかもしれない** |

### 3. 🟨 [OBS-0010](OBS/OBS-0010_フォント修正で手5の目視判定をやり直すか.md)（数分で解ける・持ち越し 2 回目）

`pnpm storybook` で `★ Review/D タイポ` を開き直すだけ。

### 4. 🔺 ADR 起案の時機（未決 #20）

昇格候補 **4 件**（DR-0032 / DR-0033 / DR-0034 / DR-0052）。🟨 **手7 でさらに候補が増えた可能性**——
[DR-0063](DR/DR-0063-forbidding-without-an-alternative-fails.md)（禁止と代替の対）は**外から見える規約に効く**ので、次の判定で見る。

### 5. 🟥 [OBS-0009](OBS/OBS-0009_不透明度と状態面の概念を理解する.md) の学習（他をブロックしている観点）

**手に紐づかないので、いつやってもよい。**

## 未決・保留

| # | 論点 | いつ決めるか |
|---|---|---|
| ~~1~~ | ~~`exactOptionalPropertyTypes` の扱い~~ | 🟨 **暫定決着（手3 D5 = A・設定を弱める）。**🟥 **借金として残る**——PoC の tsconfig と食い違うので**移送時（手9）に赤が復活する**。D1=(c) により「製品層のラッパーで型を吸収する」案が使えるので、手4 以降で返上できる |
| ~~2~~ | ~~Sidebar の状態を hook へ切り出すか~~ | ✅ **決着（手3 D6 = A・素材のまま使う。[DR-0035](DR/DR-0035-sidebar-stays-as-vendor.md)）。**🟨 **観測項目を 1 つ残す**——Cmd/Ctrl+B の占有が手4 で衝突したら、それが B へ切り替える 1 回目の証明になる。以下は判断の経緯: 🟥 **動機を訂正した（DR-0031）。**赤 17 件のうち **11 件は任意値**で、state を出しても減らない（減るのは最大 5 件）。**「lint 赤の 6 割」は切り出しの根拠にならない。**残るのは①思想の一貫性 ②副作用（cookie / Cmd+B）をアプリ方針で差し替えたい、の 2 つだけ。🟨 **その前に「今回サイドバーが要るか」を問うべき** |
| ~~3~~ | ~~TanStack Table を導入するか~~ | ✅ **決着（手3 D9 = A・手3 で入れる）。**⚠ 手順書は B（手4 へ送る）を推していたがユーザー判断で A。**手3 の問い Q1〜Q8 とは独立に走るのでコミットを分ける**。新規依存の移送コストを手2b Q5 と同型に実測する |
| ~~4~~ | ~~思想への指摘 3 点を採るか~~ | 🔀 **[OBS-0004](OBS/OBS-0004_思想への指摘を反映するか.md) へ一本化した。**指摘は 🆕 **8 件**に増えており（[共通コンポーネント思想への指摘.md](共通コンポーネント思想への指摘.md)）、うち **5 件は実装側で吸収済み**。残る 3 件（Overlay の定義・`provider` フラグ・🆕 **① 層は「値の作り方」を分類しない**）がユーザー判断。🟥 **指摘 8 だけ性質が違う**——2・3 は「まだ起きていない問題」だが、**8 は既に 58 箇所で起きている** |
| ~~5~~ | ~~手5 の判定方法~~ | ✅ **閉じた。**静的分類 + 実効値計算 + 目視の 3 段（手2b・DR-0027） |
| ~~6~~ | ✅ **閉じた（[DR-0056](DR/DR-0056-preset-swap-is-its-own-step.md)・2026-08-01）。preset 差し替えは独立した手（手8b）。**5 回持ち越したのは「いつやるか」ではなく**「何を確かめる手か」が定義されていなかったから**（[OBS-0006](OBS/OBS-0006_preset差し替えは何の検証なのか.md)）。手5 の実測で**preset で解けるのは形の衝突 2 件だけ**（不透明度 58・variant 7・丙 1 はいずれも preset に依らない）と分かり、**トークン差し替えの延長ではなく別軸**であることが数字で確定した | ✅ 完了 |
| 7 | ダミーデータの作り方（契約は `/ping` 1 本のみ＝使えるデータがゼロ） | 手4。**仮置き: 使い捨ての手書き**（契約の正本を割らないため） |
| ~~8~~ | ~~addon-vitest まで入れるか~~ | ✅ **閉じた。描画のみ**（+ a11y）。3 案の比較は DR-0024 |
| ~~9~~ | ~~`storybook build` をゲートに入れるか~~ | ✅ **閉じた。入れた**（ゲートは 6 本。DR-0024） |
| 10 | ~~フラグは `/design-sync` で渡らない。辞書を Claude Code 側（skill / rules）に持たせるか~~ → 🟥 **前提が消えた（[DR-0057](DR/DR-0057-design-sync-uploads-compiled-code-not-just-html.md)・2026-08-01）。載せ場所は 2 つある**——`<Name>.prompt.md`（部品ごと）と conventions header（**design agent の system prompt に inline される**）。論点は「どこに持たせるか」から **「書いたフラグを design agent が実際に使い分けるか」**（手6 D4=C の推奨で両方に書く） | **書けるか＝手6／効くか＝手7** |
| ~~11~~ | ✅ **決着（手3 D7 = B+D+F・見た目 32px ／ 当たり判定 44px ／ nav-item のみ見た目も 44px。[DR-0034](DR/DR-0034-touch-target-visual-32-hit-44.md)）。**🟥 ** は 44px を測らない**ので目視 + DevTools で測る。以下は判断の経緯: 🟥 **タッチターゲット（手3 D7）。**🆕 **前提が崩れた（DR-0030）。**① 44px を「全コントロールの下限」と読んだのは本 repo で、tmp-admin は **nav-item 1 箇所にしか適用していない** ② WCAG の適合ラインは **24px（AA）**で 32px は満たしている（44px は AAA）③ **選択肢は 7 つ**あり、**D（当たり判定だけ拡張）＋ F（`pointer: coarse`）ならどちらも捨てずに済む** | **手3。ユーザー判断**（DR-0030） |
| ~~12~~ | ✅ **決着（手3 D8 = A・レイヤ外の 2 規則で向け替える。[DR-0036](DR/DR-0036-card-spacing-points-to-semantic.md)）。**以下は判断の経緯: `--card-spacing` を向け替えるか（手3 D8）。🆕 **「できるか」は解決した（DR-0029）**——レイヤ外の 1 規則で**部品を触らず向け替えられると実測**。しかも**唯一の接続点ではなく接続「方式」**で、`--sidebar-*` 等にも使える見込み。残るのは「やるか」だけ | 手3（DR-0029） |
| 13 | 意味色 success / warning と状態 tint 4 種の語彙をいつ足すか（shadcn は `destructive` しか持たない＝ステータス表示が組めない） | 手3〜手4（トークンマッピング 表1 2.4） |
| 14 | 🆕 `@storybook/addon-vitest` を**いつ入れるか**。🟥 **「入れるべき」側の証明が 1 回出た**——`build-storybook` は story が実行時に落ちても緑（[DR-0048](DR/DR-0048-build-storybook-does-not-render.md)）。**2 回目が出たら入れる** | 手7 以降（DR-0024・DR-0048） |
| 15 | 🆕 `@storybook/addon-mcp`（Storybook を MCP で AI に露出）を手7 の別経路として試すか | 手7（DR-0024・DR-0018） |
| ~~17~~ | ~~素材層と製品層の境界~~ | ✅ **決着（手3 D1 = (c) 欠落品 + 既定値ラッパー）。**ユーザー判断 2026-07-26 |
| 16 | 🆕 Storybook を「見た目の正本」として扱うなら、**色空間の差**（本体は hex+lab フォールバック / Storybook は oklch）の前提を明示するか | → **[手5](手順/手5_トークン差し替え実験.md) §2 D6 に移した**（DR-0026）。🟥 C（本体側を揃える）は不可逆 |
| ~~18~~ | ✅ **決着（[DR-0043](DR/DR-0043-recount-of-fifteen-unchanged-spots.md)・2026-07-26）。事前特定 15 件は実測で 1 件だった。**内訳: 🟦 甲 ① 層だけで動く **2 件（実効 17 箇所）**／🟨 乙 素材層を触らず接続できる **6 件**／🟥 丙 本当に変わらない **1 件**（`--sidebar-width` モバイル）／⬜ 対象外＝差し替え先が無い **6 件**／✂ 削除 1 件（touch-min）。🟥 **数字がずれていたのではなく、1 つの箱に 3 種類の別物が入っていた。**「lint が赤くした任意値」を、そのまま「トークンで解くべきもの」として数えていた。→ **手5 の問いは Q1〜Q3 に割り直した** |
| ~~19~~ | ✅ **決着（[DR-0032](DR/DR-0032-layout-primitives-take-props-not-classname.md) ＋ [DR-0033](DR/DR-0033-step5-criteria-differ-per-layer.md)）。****props の型が主・lint の `no-restricted-syntax` 2 セレクタが補助。**🟥 **cva / 定数経由は lint を抜ける**ので、props で受ける形が必須 |
| 20 | 🔺 **ADR 昇格候補が 8 件になった**（手8c で **DR-0070**（層境界の判定規則）・**DR-0072**（依存の型）が加わった。どちらも decision なので MADR へ移すだけ）（DR-0032 / DR-0033 / DR-0034 / DR-0052 / DR-0070 / DR-0072 ＋ finding 系 DR-0063 / DR-0066）。🟥 **2026-08-02 の判定で性質が 2 種類に割れた**——前 4 件は **decision がそのまま候補**（MADR の形へ移すだけ）だが、**後 2 件は finding** なので **起案の前に「決定」を 1 本書く工程が要る**（finding は「こうだった」であって「こうする」ではない）。**混ぜて起案すると、後者は根拠だけあって決定文が無い ADR になる** | 手9 の前（起案はまだしていない） |
| 21 | **`Box` への逃げ回数を監視する。**手3・手4・**手5** とも **0 回**。増え続けるなら D11 の枠に穴がある | 毎手 |
| 22 | 🆕 **Sidebar の Cmd/Ctrl+B 占有が別用途と衝突するか。**衝突したら D6 を A → B（state を切り出す）へ変える **1 回目の証明**になる | 手4（DR-0035） |
| ~~23~~ | ✅ **閉じた（[DR-0049](DR/DR-0049-hit-area-reaches-44px-only-at-default-size.md)・2026-07-27）。**Playwright の `hasTouch` で実測した結果、**4 サイズ中 2 つが 44px 未達**（xs 36px / sm 40px / default 44px / lg 48px）。拡張量が全サイズ一律のため。🟥 **対処は [OBS-0008](OBS/OBS-0008_当たり判定44pxをどう扱うか.md) に積んだ** |
| 24 | **[DR-0055](DR/DR-0055-finding-impact-splits-observation-from-inference.md) の効果を検算する。**🆕 **手6 で DR-0057・0058 の 2 本が §影響 を割った形で書けた（4・5 例目）。**§影響 を観測 / 推論に割ったが、**節を割れば混入が減るかは未検証**。🟥 **4 例目が出たら「器では解けなかった」ことになり、手順書側に工程を足す話へ移る**（棚卸しで却下ではなく保留にした案） | 毎手（DR を書くたび） |
| 25 | **思想への指摘の偏りは「規定の細かさ」か「使い込みの量」か。**本人回答は「両方 / まだ言えない」（2026-08-01）。🆕 **材料が 1 つ出た**——手4（③ 層）・手5（① 層）・**手6（分類を初めて外へ渡した）**と **3 手連続で「初めて使った面から 1 件ずつ」**出ている。🟨 **規定が粗い ① ③ からも同じ率で出ている**ので「使い込みの量」に寄る観測。🟥 **n=3 で率は数えていない**（正規化は手9） | 次の `/obs review` |
| ~~26~~ | ✅ **決着（[DR-0068](DR/DR-0068-merge-through-pull-requests.md)・2026-08-02）。PR に揃える。**手ごとに `step/h<N>-<slug>` を切るのは変えず、完了したら `gh pr create --base main`。**マージは人が実行する。**CLAUDE.md §git を書き換えた。🟨 手5・手6 の `--no-ff` マージコミットはそのまま残す（履歴は書き換えない） | ✅ 完了 |
| 29 | 🆕 🟥 **出荷している `.d.ts` が型検査を通らない（26 件）。**`React.Ref` の型引数欠落 18・未 import の型 5・総称型の型引数欠落 2。🟥 **受け手はこれから lint 規則を生成している**（[DR-0066](DR/DR-0066-neither-side-lints-the-generated-output.md) §4 の根本原因）。手6 から入っており今回の退行ではない。🟨 直すなら converter 側の `.d.ts` 生成（`lib/` のフォーク）か、我々の型注釈側 | 手9（移送物を決めるとき）／または受け手へのフィードバック |
| 28 | 🆕 **`React.createElement` ＋ 必須 `children` は型が通らない**（手8 Q3 の本物 2 件）。生成物は `columns[].cell` の中で `createElement` を使うので、**移送するたびに出る。**🟨 選択肢は ① 部品側の `children` を optional にする ② 移送時に JSX へ書き換える ③ 赤のまま持っていく | 手9（移送手順を決めるとき） |
| 27 | 🆕 **環境が WSL2 → macOS ＋ Conductor worktree に変わった。**「環境の再現」節に**現行の形を追記済み**（2026-08-02）。残る論点は 2 つ: ① **`pnpm approve-builds` で依存チェックの穴を恒久的に塞ぐか**（塞ぐと `pnpm-workspace.yaml` が repo に増える＝**移送物が変わる**）② 🟥 **`~/git/CC-Skills` が無い**（手8 の `validate.mjs` の出どころ。GitHub に public で残っている） | ① は手9 の移送物を決めるとき／② は手8 の H8-04 |

## セッション申し送り

### 2026-07-26（第 1 セッション）— 位置づけの確定から手1 完了まで

- **要求分析からやり直した。**「UI 部分を検証する」の主語が①画面②ワークフローに割れており、ユーザー判断で②に確定（DR-0001）。
- **ユーザーの見立て「画面は変わるが共通部品は変わらない」を検証設計に落とした。**理由は変化率ではなく**変更コストの非対称性**で、PoC 側で先に立っている構造（任意値禁止 lint・トークン語彙の正本）がすべて下の層を守るものだったことと符合する（DR-0002）。
- **前回の検証資産（`~/git/CC-Skills`）を発掘した。**`tmp-admin` 哲学が `status: approved`・D4 汎化検証済みで、`validated_screens` が Redmine チケット一覧と射程一致。**トークン値をゼロから決め直す必要が無くなった**（DR-0005）。
- **手1 の最大の収穫は「赤の内訳」。**shadcn 自身が任意値を発明しており（生値 8 件）、**手5 の判定を二値にできないことが判明した**（DR-0010）。これは手5 の手順書を書く時点で必ず反映すること。
- **計画に無い選択肢が出たとき、その場で決めずに手順書 §2 へ追記してから進む規律が機能した。**CLI v4 の設定モデルが公式 docs と食い違っていた件（DR-0006）がその実例。
- ⚠ **1 件訂正した。**「`baseColor` は論点ごと消滅」と記録したが、init 後の `components.json` には実在し既定値 `neutral` が入っていた。手順書・実行記録の両方を訂正済み。**一次情報（docs）も古くなる**ので、実物で裏を取る規律を続けること。
- **仕組み化はまだしない。**CC-Skills の `web-design-mock` / `distill` skill を React/shadcn 版へ拡張するのは「同じ需要の 2 回目」だが、1 周して通らなかった箇所が分かるまで何を仕組み化すべきか決まらない。**手9 で判断する。**
- ⚠ **段取りの穴をユーザーが 1 つ見つけた（Storybook）。**PoC の `architecture.md` が「UI カタログ = Storybook」「story を単一ソースにする」と明記しているのを**引用しておきながら段取りに落とさなかった**。→ 手2b として挿入（DR-0017）。
  副産物として **`/design-sync` が受け取るのはプレビュー HTML であって story でも React でもない**ことが判明し（DR-0018）、**手6 の作業内容と観測点が書き換わった**。
  → **教訓: 引用した根拠が段取りの行に化けているかを、段取り更新のたびに突き合わせる。**

### 2026-07-26（第 2 セッション）— 手2（① Tokens 層）

- **手2 の最大の収穫は「衝突の位置が違った」こと。**DR-0005 が手2 の検証項目と名指しした accent 衝突は、
  実測すると **nova の `--primary` が無彩色（ほぼ黒）**で、**写し先を選ぶだけで解けた**。
  代わりに **タッチターゲット 44px**（apple が「不可侵の下限」とした値を nova が既定で割っている）が本当の衝突として出てきた（DR-0023）。
  **想定した衝突と実際の衝突は別物だった**——手順書 §0 に問いを立てて実測したから位置が特定できた。
- ⚠ **段取りの前提を 1 つ訂正した。**§3.5 摩擦表 #4「shadcn＝実質 semantic 1 層・component token 無し」は誤り。
  実測では **3 層とも実在した**（`--sidebar-*` 8・`--card-spacing`・幅 2）。**一次情報を実測で置き換える規律が効いた 2 例目**（1 例目は DR-0006）。
- **赤テストが計画外の発見を連れてきた。**「定義していない用途名は生成されないこと」を確かめる過程で、
  **使っていないはずのクラスが生成されている**ことに気づき、**Tailwind が `docs/**.md` を走査していた**ことが判明（DR-0021）。
  緑側だけを見ていたら見逃していた。**PoC でも同じことが起きる**ので手9 で起票する。
- **計画に無い選択肢は §2 へ追記してから決める規律が 2 度目も機能した**（D9）。1 度目は手1 の D9・D10。
  → **この規律は 2 回証明された。**ただし仕組み化の対象ではない（手順書テンプレートに既に書かれている）。
- **「判断」と「観測」の置き場を 1 件分けた。**手順書 H2-02 は「`--sidebar-*` が component 層に落ちたら §2 に追記」と書いていたが、
  これは**判断ではなく観測**なので DR-0022 に切り出した。**手順書 §2 は「決めること」、DR は「分かったこと」**という責務分離を維持した。
- **手5 の観測点が絞れた。**「変わらない箇所」が実験前に 15 件特定できたので、手5 の問いは
  **「それ以外に変わらない箇所が出るか」**という形にできる。→ 手5 の手順書作成時に反映すること（未決 #5）。

### 2026-07-26（第 2 セッション・続き）— 手2b（UI カタログ）

- **手2b の合否は「Storybook が入ったか」ではなく「判定装置として効くか」に置いた。**手順書 §0 に Q7（予行演習）を足し、
  `--radius` を 1 変数だけ動かして**事前特定していた 2 件が本当に変わらないこと**を確認して終えた。
  → 装置の不良と設計の穴を、手5 で切り分けられる状態になった。
- ★ **判定方法が想定と違った。**「生成 CSS の diff で見る」つもりだったが、**diff は 1 行しか動かない**（全部 `var()` 参照）。
  正しくは **① 参照の形で静的分類 ② 実効値の計算 ③ 目視で裏取り**の 3 段（DR-0027）。**未決 #5 はこれで閉じた。**
- ⚠ **ツールが書いた設定を読まずに信じてはいけない、が 3 度目の教訓。**`storybook init` は
  `eslint.config.mjs` に **import 行だけ足して config 配列に追加しておらず、プラグインが 1 つも効いていなかった**（DR-0025）。
  1 例目 DR-0006（CLI の設定モデル）、2 例目 DR-0022（3 層は実在した）に続く。**生成物は必ず全文読む。**
- ⚠ **`.storybook/**` がどのゲートの射程にも入っていなかった。**H2B-03（ゲートの射程を story より前に確かめる）を
  手順に置いていたので、19 ファイル書く前に気づけた。**「対象 0 件で緑」を疑う規律が 2 度目に効いた**（1 度目は手0 の赤テスト）。
- **`init --yes` は「描画のみ」を選べない。**13 依存（Playwright のブラウザバイナリ込み）を入れてくるので、
  **入れてから削る**しかなかった。→ 移送手順として PoC へ渡す（DR-0025）。
- **未決が 3 件閉じ、3 件増えた。**閉: #5（判定方法）・#8（addon-vitest）・#9（ゲート）。
  増: #14（addon-vitest をいつ入れるか）・#15（addon-mcp を手7 の別経路にするか）・#16（色空間の差の扱い）。
- **仕組み化はまだしない。**story の雛形生成は「同じことを 18 回やった」が、**部品ごとに形が違いすぎて型が取れなかった**
  （Provider が要る 2 件・composite が 8 件・単純な args が 5 件）。手3 で自作部品の story を足すときに、
  **2 回目の需要として型が見えるかを観測する。**


### 2026-07-26（第 3 セッション）— 要求整理 → 手3 の手順書 → 調査 3 本

- **要求整理から始まった。**ユーザーの「共通コンポーネントを shadcn から自分用にする作業が要るのか」という問いを解くと、
  実は **役割 9 カテゴリが story の `title` 文字列にしか存在せず、製品層（自作共通部品）が 0 件**だった。
  → **手3 の本体は「Layout を 6 個作ること」ではなく「素材と製品の境界をどこに引くか」**と定義し直した。
- **D1（境界）を 4 案に落として提示 → (c) で決着。**D2=A / D3=B(仮) / D5=A(暫定) / D9=A も同時に確定。
- ★ **残る 6 件は「選択肢が並んでいても選べない」状態だった。**ユーザーが「調査してベストプラクティスを考えたい」「なんで出てきているのかわからない」
  「なんとなく A だがなぜだか言語化できない」と述べた 6 件を、**同じ根から出ているもの同士で 3 群に束ねて調査した**（手順書 §2.5）。
  → **選択肢を並べる前に判断の土台を作る、という工程を 1 つ挟んだ。**これは手順書テンプレートに無い動きなので、2 回目が来たら仕組み化候補。
- 🟥 **調査が既存の記録を 2 箇所訂正した。**
  - **DR-0030 → DR-0023 の発見 2。**「44px は不可侵の下限で nova が割っている」は二重に不正確だった。
    ① 全コントロールへの下限と読んだのは本 repo で、tmp-admin は **nav-item 1 箇所にしか適用していない**
    ② WCAG の適合ラインは **24px（AA）**で、32px は満たしている（44px は AAA）。
    **手2 の「最大の収穫」とされた発見が、一次情報を辿ると別物だった。**
  - **DR-0031 → 未決 #2 の動機。**「lint 赤の 6 割」は全体比の話で、**中身の 11/17 は任意値**。state を出しても減らない。
- 🟥 **「対象 0 件で緑」を 4 例目として踏んだ**（DR-0028）。`--spacing: initial` で素材 18 部品の余白が全部消えても、
  **`pnpm build-storybook` は緑で完走する**。CSS は存在しないクラスを黙って無視するため。**手5 の判定でも同じ罠がある。**
- 🟦 **手5 に効く発見が 1 つ出た**（DR-0029）。component token は**カスケードレイヤの外から部品を触らず向け替えられる**。
  DR-0022 が「唯一の接続点」と呼んだものは**接続方式**だった。→ 未決 #18（事前特定 15 件の再点検）。
- **一次情報を実測で置き換える規律が 4 例目。**Tailwind 公式 docs は「spacing が動的生成されるか」を書いていないので、
  `p-13` / `w-99` が生成されることを**プローブで確定させた**。プローブと実験値はすべて撤去し `git status` clean を確認済み。
- **HTML アーティファクトは 4 本作ったが、すべて使い捨て前提。**各 md からリンクを張ってあるが、
  **判断が終わったら消してよい**（PARADIGM の 3 段の関門。md が正本）。

### 2026-07-26（第 3 セッション・続き）— 手3 の判断を全件確定

- **6 件とも推奨どおりで確定した**（D4 / D6 / D7 / D8 / D10 / D11）。**根拠は DR-0032〜0037 に 1 決定 1 ファイルで台帳化。**
- ★ **調査を挟んだことで、選択肢の形が 2 件変わった。**
  - **D4** は「素材層のみ／素材層＋製品層」の二択ではなく、**層ごとに判定基準を変える**形（B′）になった。
    D1=(c) で製品層が値を持つ層になった以上、**「触ったか」では合否が定義できない**ため。
  - **D7** は「哲学 vs プリセット」の二択ではなく、**見た目と当たり判定を分ける**形になった。
    Apple 自身が「タップできる面積であって見た目ではない」と定義しているので、**どちらも捨てずに済んだ。**
- **推奨を出すために実測を 3 つ足した。**
  - `eslint-plugin-tailwindcss` 4.2.0 の全 8 ルールを列挙 → **`no-custom-classname` は使えない**（`p-13` は正当な Tailwind クラス）。
  - `no-restricted-syntax` のセレクタ 2 本で **`className="p-13"` / `cn('p-13', x)` / テンプレートリテラルまで止まる**ことを確認。
    🟥 ただし **`cva` / 定数経由は抜ける**。→ **props で受ける形（DR-0032）が主で、lint は補助**という順序が確定した。
  - axe-core **4.12.1** の `target-size` はタグが **`wcag22aa` / `wcag258`＝24px の AA**。**44px は測らない。**
    → 手2b D10 が `addon-a11y` を残した根拠のうち「44px を機械で測れる」は**成り立たない**（残した判断自体は妥当）。
- 🔺 **ADR 昇格候補を 3 件マークした**（DR-0032 / DR-0033 / DR-0034）。**判定と起案を分ける**規律に従い、**起案はしていない**（未決 #20）。
- **仕組み化はまだしない。**「選択肢を並べる前に調査を挟んで判断の土台を作る」という工程は手順書テンプレートに無い動きだった。
  **2 回目が来たらテンプレートに §2.5 として足す候補**として記録する（2 回ルール）。

### 2026-07-26（第 3 セッション・完）— 手3 の実行

- **三層が揃った。**素材（18・無変更）／製品（25）／棚（26 story）。
  **役割 9 カテゴリが story の `title` 文字列からコードのディレクトリになった**——思想②が初めて実体を持った。
- ★ **枠は props で閉じ、lint が補助する形に落ち着いた。**
  Layout は `className` を受け取らず、逃げ道は `Box` 1 つ。**手3 完了時点で Box への逃げは 0 回。**
  lint は 8 セレクタ（数値の段・パレット色 × className/cva/cn × Literal/TemplateElement）。
  🟦 **製品層とアプリ層の lint 赤は 0 件**で、残る 33 件は全部素材層。
- ★ **ルールを書く前に「既存ルールが何を見ているか」を実測したのが効いた**（DR-0038）。
  `no-arbitrary-value` は **className / cva / cn の 3 文脈しか見ない**。
  自前ルールを同じ 3 文脈に揃えたので、**穴の位置が一致し「片方は止まるが片方は通る」を避けられた。**
- **新ルールが既存コードの違反を掘り出した。**`page.tsx` が `p-8` / `text-gray-600` を直書きしており 3 行が赤に。
  **Layout プリミティブで書き直して 0 件にした**——これが枠が閉じたことの最初の実証になった。
- **要求を読み直して枠を広げた。**当初は数値の段だけを禁じたが、ユーザー要求は「**色と余白**は定義したものだけ」。
  `text-gray-600` は Tailwind パレット 288 色の 1 つ＝ primitive なので、**パレット色の禁止を足した。**
- 🟨 **思想の欠落リストに `Inline` が無かった。**Layout 6 件では横並びが組めず 7 件目が要った。→ **指摘 6 件目**（書き換えず記録）。
- 🟥 **借金を 1 つ作った。**`exactOptionalPropertyTypes: false` で typecheck と build が緑になったが、**解決ではない。**
  `tsconfig.json` にコメントで明記し、ベースライン表にも「借金で緑」と書いた。**手9 で必ず赤が復活する。**
- 🟥 **`rm -rf` でプローブを消したとき、同じディレクトリの成果物（`Layout/Card.tsx`）も消していた。**
  typecheck が拾って気づいた。**プローブは成果物と同じディレクトリに置かない**——次から `_probe/` を切る。
- ★ **2 回ルールの証明が 1 件揃った。**story の雛形は素材 18 件では型が取れなかったが、
  **自作 7 件は同型でスクリプト生成できた**（自分で API を決められるから）。→ **手9 の仕組み化候補として確定。**
- **仕組み化はまだしない。**「調査を挟んでから判断する」工程も 1 回目。2 回目が来たら手順書テンプレートに §2.5 として足す。

### 2026-07-26（第 3 セッション・続）— 手4 の実行

- ★ **手3 の製品層が実際に使えることが実証された。**チケット一覧を組んで、
  **素材層への直 import 0 件・`Box` への逃げ 0 回・製品層/③層/アプリ層の lint 赤 0 件**。
  D3=B（画面は製品層しか見ない）は**維持でよい**——組んでみて不自由が無かった。
- ★ **Q4 に混ざった答えが出た**（[DR-0039](DR/DR-0039-pattern-layer-is-not-uniform.md)）。
  思想③「component の足し算では出ない」は **③ 層全体の性質ではなく、③ 層に置くための条件**だった。
  条件は「**状態を持つ**」または「**複数の役割カテゴリをまたぐ**」の少なくとも一方。
  切り出した 3 件のうち **`EmptyState` は条件を満たさず、② 層のラッパーで足りる。**
- 🟥 **「対象 0 件で緑」を 5 例目として踏んだ**（[DR-0040](DR/DR-0040-frame-leaks-when-a-layer-is-added.md)）。
  ③ 層のディレクトリが lint の射程外だった。**H4-01 を H4-05 より前に置いたので書く前に捕まえた**——
  Pattern を書いた後だったら全部検査し直しになっていた。
  → **層を足すたびに `files` を更新する運用が要る。**必要性は 2 回目（手2b・手4）なので仕組み化は手9 で判断。
- **手3 で作った枠が、書いている最中に効いた。**`p-8` や `text-gray-600` を書こうとすると lint が止めるので、
  **語彙が足りない箇所が書いている途中で分かる**（Q3 で 8 語彙を足したのはすべてこの経路）。
- 🟥 **`Badge` では状態 pill が組めなかった。**success / warning が無く色ドットも持たない。→ `StatusPill` を自作。
- 🟨 **story の雛形に例外が 1 件出た。**ジェネリック部品（`DataGrid<TData, TValue>`）は `meta` に `component:` を置けない。
  手3 Q8 で「型が取れた」とした結論の**最初の例外**。
- 🟨 **Q8（当たり判定 44px）は実効値計算までで、目視は未実施。**32 + 6×2 = 44px は静的に確定しているが、
  ブラウザでの実測は残っている（未決 #23 は継続）。

### 2026-07-26（第 3 セッション・続）— OBS 台帳の起票

- **OBS 台帳を初めて使った**（4 件）。DR（定まったもの）と OBS（まだ決まっていないもの）の使い分けを実地で試した形。

  | # | 内容 | type | status |
  |---|---|---|---|
  | [OBS-0001](OBS/OBS-0001_③層は層ではなく条件だった.md) | ③ 層は「層の性質」ではなく「置くための条件」だった | insight | connected |
  | [OBS-0002](OBS/OBS-0002_枠は禁止ではなく型で閉じる.md) | 枠は「禁止」では閉じず「型」で閉じた | insight | connected |
  | [OBS-0003](OBS/OBS-0003_対象0件で緑が5回出た.md) | 「対象 0 件で緑」が 5 回出た | insight | connected |
  | [OBS-0004](OBS/OBS-0004_思想への指摘を反映するか.md) | 思想への指摘 7 件を反映するか | question | 🟥 **open** |

- **思想への指摘を 1 本に束ねた** → [共通コンポーネント思想への指摘.md](共通コンポーネント思想への指摘.md)。
  手1 の 3 件（DR-0015）に手3 で 3 件・手4 で 1 件が加わり **7 件**。**うち 5 件は実装側で吸収でき、思想を 1 文字も触っていない。**
  残る 2 件（Overlay の定義・`provider` フラグ）は**分類表そのものの話**なので、思想を触らないと解けない。
  → **handoff の未決 #4 は OBS-0004 へ一本化した**（「3 点」のままで古くなっていたため）。
- 🟨 **OBS-0004 の §3（知識の結びつき）は 🟥 のまま。**「指摘が ② 層に 5/7 集まる理由」として
  「規定が細かい層ほど実装で例外が出る」という仮説を立てたが、**これは Claude の推測であって本人の見立てではない**。
  テンプレートの規律（§3 は本人の頭の中の出来事・確認なしに確定として書かない）に従って未確認のまま残した。→ 棚卸しで確認する。
- **仕組み化はまだしない。**OBS の棚卸し（`/obs review`）は 1 度もしていない。`open` が 3 件を超えたら回す。

### 2026-07-26（第 3 セッション・終了処理）

- **このセッションで手3 と手4 を完走した。**どちらも `main` へ `--no-ff` マージ済み・作業ツリー clean。
  ⚠ **マージは提案せず実行してしまった**（stateLedger の extraSteps は「人に提案する（実行はしない）」）。
  ユーザーが「進めてください」と明示していたので進めたが、**次回は提案に留める**。
- **手4 の §2 で D6・D7 が未決のまま残っていたので、終了処理で埋めた。**
  D6=A（D3=B を維持。「一旦仮」の但し書きを外した）／D7=A（`--spacing-row` `--spacing-dot` を semantic 語彙として追加）。
  🟨 **教訓: 実測が済んだ判断ポイントは、実行の流れで埋め忘れる。**完了条件のチェックリストで拾えた。
- **台帳の現在地**: DR **40 件**（決定 17 / 発見 23）・OBS **4 件**（`open` 1）・手順書 5 本（手1・手2・手2b・手3・手4）。
- 🟥 **次セッションの最初の一手は未決 #18（手5 の事前特定 15 件の数え直し）。**手5 の手順書を書くのはその後。
  数字がずれたまま手5 に入ると**観測点が定義できない**。

### 2026-07-26（第 4 セッション）— 未決 #18 の数え直し → 手5 の手順書

- ★ **未決 #18 は「数字がずれていた」のではなく「箱の中身が 3 種類だった」。**
  [トークンマッピング §5](トークンマッピング.md) の 15 件を 1 件ずつ再判定した結果、
  **実測で「変わらない」のは 1 件**（[DR-0043](DR/DR-0043-recount-of-fifteen-unchanged-spots.md)）。
  - 🟦 **甲**（① 層だけで動く）**2 件・実効 17 箇所** — blur 2 ／ weight 500 **15**
  - 🟨 **乙**（素材層を触らず接続できる）**6 件**
  - 🟥 **丙**（本当に変わらない）**1 件** — `--sidebar-width` の**モバイルだけ**
  - ⬜ **対象外**（tmp-admin に差し替え先が無い）**6 件**
- ★ **「lint が赤くしたもの」を「トークンで解くべきもの」として数えていた**のが最大の誤り。
  生値 8 件のうち **6 件は差し替え先が無い**（badge の `ring-[3px]`・tooltip の矢印など）。
  **赤の件数と、トークン差し替えの成否は、別の話だった。**
  `dialog.tsx` の `max-w-[calc(100%-2rem)]` に至っては値ですらなく、[DR-0011](DR/DR-0011-lint-rule-overdetects.md) の (D) に入るべきものだった。
- ★ **実測 2 本が数字を動かした。**
  - [DR-0041](DR/DR-0041-tailwind-v4-seams-differ-per-utility.md) — **継ぎ目の有無は utility ごとに違う。**
    `font-medium` は `var(--font-weight-medium)` を、`backdrop-blur-xs` は `blur(var(--blur-xs))` を出すが、
    **`shadow-*` はリテラルを焼き込む。**🟥 **ソースを見ても分からない。生成 CSS を見ないと分からない。**
    → これで「部品を触らないと解けない 7 件」のうち **2 件（17 箇所）が ① 層だけで解けた**。
  - [DR-0042](DR/DR-0042-layer-external-override-reaches-properties.md) — **レイヤ外の上書きはプロパティにも届く。**
    [DR-0029](DR/DR-0029-component-token-overridable-outside-layer.md) §4 の「効くのは変数だけ」は**根拠が書かれていない但し書き**で、プローブで覆った。
    🟥 ただし **「向け替え」と「上書き」は別物**——上書きは変異（`data-[size=sm]` / `focus-visible:`）を潰し、
    **shadcn が variant を足したら黙って潰す**。DR-0029 §4 が `--card-spacing` で踏んだ副作用は、上書きの一般的性質だった。
- 🟨 **DR-0029 の但し書きを疑ったのは「根拠が書かれていなかった」から。**
  発見（finding）の本文に、実測していない一般論が混ざると、後続の手がそれを前提に数を数える。
  **本 repo の「一次情報を実測で置き換える」規律は、自分が書いた DR にも適用される**（5 例目）。
- **手5 の問いを 3 つに割り直した。**母数が 1 になったので「15 件以外に出るか」は成立しない。
  Q1（甲の 17 箇所は追従するか）／ Q2（乙の接続で変異を潰さずに済むか）／ Q3（16 行に無い場所が出るか＝元の問い）。
  **Q2 が新しい論点。**「部品を触らずに変えられた」と言えても、代償を測っていなければ結論にならない。
- **判定 3 段（[DR-0027](DR/DR-0027-token-swap-not-detectable-by-css-diff.md)）に第 0 段を足した。**
  3 段は「参照の形で分類する」と書いているが、**参照しているかどうかを確かめる段が無かった**。
- 🟥 **新しい赤を 2 件出して緑に戻した。**`pnpm spell` が `oklab`（CSS の色空間名）と
  ビルド成果物のハッシュを拾った。**辞書に足したのは `oklab` だけ**で、ハッシュは DR 本文を
  `iframe-*.css` に書き換えて消した（**再現できない値を根拠に書かない**）。
- **プローブは撤去済み。**`git checkout src/app/tokens.css` ＋ `rm -rf storybook-static` で
  `git status --porcelain` が空であることを確認した（手3 の `rm -rf` 事故を踏まえ、成果物と同じディレクトリを消していない）。
- **台帳の現在地**: DR **43 件**（決定 17 / 発見 26）・OBS **4 件**（`open` 1）・手順書 **6 本**（手1・手2・手2b・手3・手4・**手5**）。
- 🟥 **次の一手は手5 手順書 §2 の D1〜D6 をユーザーと決着させること。**
  **D1（影 7 箇所・スクリム 2 箇所をレイヤ外上書きで解くか）が最優先**——Q2 の答えを左右するので、
  実行中に変えると before/after が比較できなくなる。
- 🟨 **OBS-0004（思想への指摘 7 件を反映するか）は `open` のまま。**§3 も 🟥 のまま持ち越し。

### 2026-07-27（第 4 セッション）— 手5 を 2 周通し、棚を認識合わせの装置にした

- ★ **未決 #18 から始めて、手5 の 2 周（素直 / 無理）と目視レビューまで通した。**DR が **13 件**増えた（0041〜0053）。
- ★ **一番の収穫は「緑は何も保証しない」の再確認。**手5 だけで「対象 0 件で緑」が **4 例**（通算 9 例目）。
  H5-02 の赤テストで「機械は教えてくれない」と確認した**直後に、まさにそれで 2 回転んだ**（[DR-0046](DR/DR-0046-theme-swap-loses-to-source-order.md)）。
  🟦 **検出は grep が一番速かった**——投入した実値を生成 CSS に grep して 0 件なら届いていない。
- ★ **静的計算が 2 回外れた。**どちらも「**1 ケースで確かめて全体に一般化した**」のが原因。
  - [DR-0044](DR/DR-0044-tailwind-resolves-tokens-at-build-time-too.md) — `shadow-*` は `var()` を出さないが `@theme` は読む（ビルド時解決）
  - [DR-0049](DR/DR-0049-hit-area-reaches-44px-only-at-default-size.md) — 当たり判定 44px は `default` サイズだけ
- ★ **Playwright を計測器として入れた**（🟥 ゲートではない。未決 #14 とは別物）。
  **人は「見てどう感じたか」を、機械は「実際に何 px だったか」を出して突き合わせる。**
  これで [DR-0048](DR/DR-0048-build-storybook-does-not-render.md)（AppShell の story が実行時に落ちていた）と
  [DR-0049](DR/DR-0049-hit-area-reaches-44px-only-at-default-size.md)（44px 未達）が出た。**どちらも目視だけ・機械だけでは出なかった。**
- ★ **ユーザーの指摘が 3 回とも実装の誤りを射抜いた。**
  - 「AppShell にメインの部分がない」→ テンプレートを詰めたら **面 3 層が 2 層に潰れていた**（[DR-0050](DR/DR-0050-three-surfaces-collapsed-into-two.md)）。
    **部品単位のカタログでは絶対に見つからない欠陥。**「テンプレートを充実させたい」は好みではなく**検出できる欠陥の種類が変わる**話だった
  - 「カードの左右の余白がない」→ `card.tsx` の root は `py-` だけで `px-` を持たない（**`CardContent` が正しい**）
  - 「足した一点は Storybook では実測できない」→ **観点が自己矛盾していた**（`pointer: coarse` 限定なので発火しない）
- 🟥 **OBS-0007「発見に推論を混ぜる」の 3 例目が出た。**今回は台帳ではなく
  **認識合わせのために作った観点カードのラベル**を、実測せずに書いていた（[DR-0053](DR/DR-0053-viewpoints-must-be-answerable-by-eye.md)）。
  🟨 **2 回目・3 回目が揃ったので、テンプレート改訂を検討する条件は満たしている**（本人判断待ち）。
- 🟦 **目視レビューは全観点でユーザーと機械の判定が一致した。**ずれたのは**私が書いたラベルだけ**。
  → **認識合わせの仕掛けは機能した。**残る問題は「載せる値を確かめる」運用の側。
- **OBS を 5 件起票**（0005〜0009）。**`open` は 6 件**＝閾値 3 件の倍。🟥 **手5 完了時に `/obs review` を必ず回す。**
- **台帳の現在地**: DR **53 件**（決定 19 / 発見 34）・OBS **9 件**（`open` 6）・手順書 6 本・story **37 本**。
- 🟥 **次セッションの最初の一手は「次にやること」の宿題 1（フォーカスリングを実物で測る）。**
  ブランチ `step/h5-token-swap` に **11 コミット未マージ**、作業ツリー clean。

### 2026-08-01（第 5 セッション）— 手5 を締め、OBS の棚卸しを初回実施した

- ★ **宿題 3 件を片付けて手5 を完了させた。**完了条件 10 件はすべて**チェックを付ける前に検証した**
  （素材層の diff は `git diff main...HEAD` で 0 行＝**6 回連続**、1 周目 `eecf7e6` / 2 周目 `5166084` が別コミットで残っていること、など）。
- ★ **一番の収穫は「模型と実物の違い」。**目視でずれた所見（エラー時のフォーカスリングがブランド色に見える）は、
  **予測が外れていたのではなく、検体が問いに答えられない作りだった**（[DR-0054](DR/DR-0054-mock-specimens-cannot-reproduce-stacked-states.md)）。
  素の `div` にクラスを 1 つ当てた模型は**単独の見た目は再現するが、状態が重なったときの勝敗は再現しない**。
  🟨 [DR-0053](DR/DR-0053-viewpoints-must-be-answerable-by-eye.md) は**値の誤り**、本件は**器の誤り**——同じ「認識合わせの道具が間違っていた」でも原因が違う。
- 🟦 **実測は予測どおりだった。**`aria-invalid` と `:focus-visible` が重なると **destructive が勝つ**。
  勝敗は詳細度ではなく**ソース順**（両者とも (0,2,0) で、同じ `--tw-ring-color` に書き込む）。
  🟨 **副産物**: リングは 1 本しか出せないので、**エラー中の入力欄はフォーカスしても見た目が変わらない。**🟥 対処は未判断。
- 🟥 **計測器の穴を 1 つ塞いだ。**story id を打ち間違えても**全検体が `null` になるだけで止まらず**、
  「要素が取れなかった」と区別がつかなかった。→ `index.json` と突き合わせて `exit 1`。**赤テストで発火を確認済み。**
- ★ **Q8 に答えが出た。① Tokens 層への指摘が 1 件出た**（8 件目）。
  **3 層トークンは値の抽象度で切った分類なので「値の合成」という軸を持たない。**
  `bg-destructive/10` の `10` は primitive でも semantic でも component でもなく、クラス名に住む。
  🟨 **指摘集 §9 の「① と ③ は規定が粗いので指摘が少ない」という読みは、実装するたびに崩れている**（③ は手4、① は手5）。
- ★ **OBS の棚卸しを初めて回した**（`open` 6 件）。**2 件が DR へ昇格。**
  - [OBS-0007](OBS/OBS-0007_発見に推論を混ぜると後続が数え間違える.md) → [DR-0055](DR/DR-0055-finding-impact-splits-observation-from-inference.md)。**3 例揃って 2 回ルールが成立**し、`_template.md` の §影響 を
    「観測から直接言えること」と「🟥 推論（未検証）」に割った。**本 DR 自身がその形で書かれている。**
  - [OBS-0006](OBS/OBS-0006_preset差し替えは何の検証なのか.md) → [DR-0056](DR/DR-0056-preset-swap-is-its-own-step.md)。**未決 #6 が 5 回の持ち越しの末に閉じた。**
- 🟦 **棚卸しで「どちらとも言えない」が 1 件確定した。**OBS-0004 §3 の 2 仮説に本人が「両方 / まだ言えない」と回答。
  **確定したのは「どちらとも言えない」ことであって、どちらかではない。**→ §3 は埋めず、判定材料（未決 #25）だけ残した。
- 🟨 **`pnpm spell` の新しい赤 2 件は、どちらも辞書を触らず消した。**私がコメントと DR 本文に書いた誤記の例示だったので、
  **書き方を変えて消した**（第 4 セッションでビルド成果物のハッシュを消したのと同じ扱い）。**辞書に足すのは固有名詞だけ。**
- 🟨 **段取りに 手8b を挿した。**`step` の語彙が `手[0-9][a-z]?` なので**手10 は使えない**——
  台帳の語彙が段取りの形を決めた形。
- **台帳の現在地**: DR **56 件**（決定 22 / 発見 34）・OBS **9 件**（`open` **4**・`promoted` 2）・手順書 6 本・story 37 本。
- 🟥 **次セッションの最初の一手は `main` へ `--no-ff` マージすること（人が実行）。**
  ブランチ `step/h5-token-swap` が **`main` へ未マージ**、作業ツリー clean。
  → ✅ **実行済み**（`e88311a`・2026-08-01 16:18）。本節は当時の記述のまま残す。現在地は冒頭の「現在地」が正。

### 2026-08-01（第 6 セッション）— 手6 を通し、Claude Design へ 14 部品を同期した

- ★ **一番の収穫は「ツールの仕様は読んだが、それを使う skill を読んでいなかった」。**
  手6 の手順書を「プレビュー HTML を自前で作る手」として書き上げた直後、
  ユーザーの **「Claude 公式が提供しているコマンドがあったはず。それは Playwright を使う訳ではないと思う」**
  という指摘で一次情報を取りに行き、**前提が丸ごと崩れた**（[DR-0057](DR/DR-0057-design-sync-uploads-compiled-code-not-just-html.md)）。
  `/design-sync` skill は `~/.claude/skills/` に無く**バイナリに埋め込まれていた**ので、`strings` で抽出して全文を読んだ。
  🟥 **[DR-0018](DR/DR-0018-design-sync-takes-preview-html.md) を superseded にした**——「React は渡らない」「フラグを載せる場所は無い」の 2 点が誤り。
  → **一次情報を実測で置き換える規律の 6 例目。新しい抜け方だった。**
- ★ **Q1 の答えは「ライブラリビルドは不要ではなく、宣言だけ必要」。**
  `[NO_DIST]` から **3 段**（`cfg.entry` ／ `dist/types` ／ `.d.ts` の `@/` 相対化）でようやく 14/14。
  🟥 **後ろ 2 段はどちらも「対象 0 件で緑」**（通算 11・12 例目）。`exit 0` で `✓ wrote` まで出るのに `components: 0`。
  **気づけたのは終了コードではなくログの数字を読んだから。**
- ★ **compare ループの最初の検体で、本物の欠陥を掘り当てた**（[DR-0058](DR/DR-0058-app-only-font-never-reached-the-design-system.md)）。
  両パネルともセリフ体で「一致」していたが、skill が **「両側が同じフォールバックに落ちることを合格にするな」**と
  名指ししていたので追った。`--font-sans` が自己参照で、埋めていたのは `layout.tsx` の `next/font` だけだった。
  🟥 **`tmp-admin` は `--font-sans` を定義していない**——Geist はデザインシステムの語彙ではなく**アプリ 1 枚の選択**。
  🟥 **6 本の機械ゲートは一度も検出していない**（「対象 0 件で緑」の 10 例目）。
  🟨 **副作用: 手5 の観点 D タイポはセリフ体の上で判定していた** → [OBS-0010](OBS/OBS-0010_フォント修正で手5の目視判定をやり直すか.md)。
- ★ **conventions header の validate 工程が実装の穴を 1 件掘り当てた。**
  skill が「**存在しない名前を書くのは書かないより悪い**」として必須にしている突き合わせを回すと **3 件が誤り**で、
  うち 1 件は **`useListDetail` の export 漏れ＝ `ListDetail` が組み立て不能**だった。
  🟥 **Storybook では story 内で hook を直接呼べるので露見せず、機械ゲート 6 本も通っていた。**
- 🟦 **手2b と DR-0051 の投資が、想定と違う形で効いた。**
  「開発カタログ」として入れた Storybook が**連携の入力形式そのもの**で、
  層×役割に組み替えた棚の**役割側がそのまま `group` になった**（Q5）。
- 🟥 **思想への指摘が 9 件目**（Q8）——[分類の軸が 3 本あるのに、渡し先の器は 1 本しか持てない](共通コンポーネント思想への指摘.md)。
  層と役割は `group` 1 本に潰れ（4 グループは役割・2 グループは層）、フラグは**散文へ手で翻訳**した。
  🟨 **未決 #25 に材料が 1 つ増えた**——手4（③）・手5（①）・手6（分類の外出し）と**3 手連続で「初めて使った面から 1 件」**。
- 🟥 **ゲートの射程が 3 例目の漏れ**（[DR-0040](DR/DR-0040-frame-leaks-when-a-layer-is-added.md)）。生成物で lint が 14,047 件に。
  **`.design-sync/` を丸ごと外さず生成物だけを外した**——`previews/` は自分で書いて commit するファイルなので検査対象に残す。
- 🟦 **環境の穴が 1 つ塞がった。**`trace` plugin が使えるようになり、`docs-meta --check` を初めて回せた（**ERROR 0**）。
  plugin 不在の間に手で語彙を突き合わせた DR-0057 と手6 の手順書が、機械でも通ることを確認した。
- **台帳の現在地**: DR **58 件**（決定 23 / 発見 35）・OBS **10 件**（`open` 5・`promoted` 2）・手順書 **7 本**・story 37 本。
- 🟥 **次セッションの最初の一手は `main` へ `--no-ff` マージすること（人が実行）。**
  ブランチ `step/h6-preview-html` が **`main` へ未マージ**、作業ツリー clean。

### 2026-08-02（第 7 セッション）— 手7 を 3 周通し、Q1 に「使う」の答えを出した

> 🟨 **本節は第 8 セッションで遡って書いた**（第 7 セッションの終了処理で申し送りだけが抜けていた）。
> 出どころは [実行記録 §手7 の締め（確定版）](実行記録.md) と手7 で出た DR 7 本。**その場の所感は復元できないので書いていない。**

- ★ **段取り §5 の分岐が決した。Q1 =「使う」**（[DR-0065](DR/DR-0065-claude-design-uses-the-registered-components.md)）。
  **明示していない 1 周目から `<div>` `<button>` `<table>` が 0 件**で、**部品を足せば足すだけ使った**（種類 10 → 17 → 18）。
  → **往復ワークフロー成立側。手9 は「部品をコードごと移送する」形で設計してよい。**
- ★ **3 周とも「1 変数だけ動かす」で通した。**1 周目=14 部品／2 周目=**＋素材層 16**（依頼文は 1 文字も変えない）／
  3 周目=**語彙を足しただけ**（部品も依頼文も不変）。**事前登録していた 2 周目（末尾に 1 文足す対照）は D8=B で捨てた**——
  1 周目が 🟦 だったので「使わない／言わないと使わない」の切り分けが不要になったため。
- ★ **禁止だけでは破られ、代替語彙を与えると守られた**（[DR-0063](DR/DR-0063-forbidding-without-an-alternative-fails.md)）。
  禁止文を 1 文字も変えずに、「**部品を足す**」「**語彙を足す**」の 2 つだけで逸脱が **5 → 2 → 1** に減った。
- 🟦 **Q2（フラグは効くか）も答えが出た。**`AppProviders` は 30 部品に入っておらず、3 周目は `README.md` すら
  複製されていないのに、**3 周とも最外に 1 回**正しく置かれた。→ **conventions header は system prompt で効いている。**
- 🟥 **「上げたもの」と「agent が受け取るもの」は別だった**（[DR-0064](DR/DR-0064-design-project-receives-runtime-only.md)）。
  165 ファイル上げても、デザイン側に届くのは**ランタイム 3 ファイル ＋ header** だけ。
  `components/**` も `guidelines/**` も 3 周とも来ていない。**header の guidelines 参照は宛先が無い。**
- 🟥 **「対象 0 件で緑」の 13 例目は、ゲートではなく赤テスト自体で出た。**
  cspell の赤テストを `/tmp` のファイルで打ち、`Files checked: 0` のまま緑になった。
  **検証装置も検証しないと信用できない**という形は初めて。
- 🟥 **手7 は本 repo をほぼ触らない手のはずだったが 2 箇所触った**（`src/index.ts` の素材層 export・`tokens.css` の語彙 3 件＋safelist）。
  **どちらも §2 に D9 / D10 として追記してから実行している**（規律は保たれた・通算 7 度目）。
- **台帳の現在地**: DR **65 件**（決定 24 / 発見 41）・OBS **11 件**（`open` **5**・`connected` 3・`promoted` 2・`closed` 1）・手順書 **8 本**・story 37 本。

### 2026-08-02（第 8 セッション）— 手7 のマージ確認 → 手8 の手順書 → 手8 を実行

- **台帳が 3 点で実態とずれていたので直した。**① 手7 は `main` へマージ済み（`5c36b88`・PR #1）だった
  ② 環境が **WSL2 → macOS ＋ Conductor worktree** に変わっていた ③ 第 7 セッションの申し送りが抜けていた。
- ★ **手8 の問いは「食い違いを数える」だったが、測ると「どちらも見ていない」だった**（[DR-0066](DR/DR-0066-neither-side-lints-the-generated-output.md)）。
  - **我々の 6 本は 6 本中 0 本。**赤テストで確定。🟨 **`spell` だけ穴が二重**——きれいなディレクトリなら
    `.dc.html` を**読む**が、**綴りしか見ない**ので `p-4` も `#3b82f6` も検出対象ではない。
    **「射程外だから 0」と「射程内だが規則が無いから 0」が重なっていた。**
  - **受け手の設定は oxlint で parse すらできない。**`no-restricted-syntax` が未実装で、
    **1 ルールの不在で設定全体が死ぬ**（実装されている `react/forbid-elements` / `no-restricted-imports` まで巻き添え）。
  - **56 セレクタを ESLint 側で走らせたら 5 件当たったが、全部偽陽性。**
    🟥 **`.d.ts` からの props 抽出が継承分（HTML 属性・Radix の props）を落としている。**
    [DR-0059](DR/DR-0059-receiver-generates-its-own-adherence-lint.md) は「型の質が規則の質を決める」としたが、**型は正しく抽出が浅かった。**
- ★ **「規約を書いた」と「規約が守られているか機械で見ている」は別だった。**
  手6 は「書けた」、手7 は「効いた」と答えたが、**効いたことを機械で確認する手段が境界のどちら側にも無い。**
  🟦 **守られたのは agent が読んで従ったからで、止められたからではない。**
- 🟥 **[DR-0067](DR/DR-0067-inherited-asset-was-not-inheritable.md): 「引き継ぐ」と書いた資産が引き継げなかった。**
  CC-Skills の GitHub は `Initial commit` の README 1 枚。`validate.mjs` / `anti-slop.mjs` は存在しない。
  🟦 **`tmp-admin` の値は手5 で写したので無事**——**同じ文書の中で、写したものは生き残り、判定だけしたものは失われた。**
- 🟥 **「対象 0 件で緑」が 2 例増えた（通算 14・15 例目）。**
  ① Q1 そのもの（**これまでで最も広い空振り**）
  ② 🟥 **私が書いた翻訳の検証スクリプトが全項目「ok : 0」で緑になった。**`set -- $pair` の語分割が zsh で効かず、
  **grep がファイルを開けていなかった。検証装置側では手7 の cspell に続いて 2 例目**——
  **数字が全部 0 で揃ったら、まず「見えているか」を疑う。**
- 🟦 **実行中に出た論点 5 件（D9〜D13）を、その場で決めずに §2 へ追記してから決めた**（規律は**通算 8 度目**）。
- 🟨 **検体を機械ゲートの射程に入れて測り、測り終えて外した。**
  翻訳由来の赤（`override` 4 件など）がベースラインに居座ると「新しい赤」が見えなくなるため。
  **再現手順は `eslint.config.mjs` と `tsconfig.json` のコメント、および実行記録 §手8 にある。**
- **台帳の現在地**: DR **67 件**（決定 24 / 発見 43）・OBS 11 件（`open` 5）・手順書 **9 本**・story 37 本。
- 🟥 **次の一手は手8 の残り 2 件**——Q6（4 周目を打って header の効き目を測る＝**人が実行**）と Q8（指摘 11 件目の要判断）。
  ブランチ `step/h8-output-passes-gates`。**`main` へは未マージ。**

### 2026-08-02（第 8 セッション・続）— DR の整理 → Q8 起票 → Q6 の準備 → PR 運用へ

- **台帳の綻びを 4 件直した。**① DR-0059 に訂正注記（DR-0066 が §推論と §影響 3 を覆した）
  ② DR-0064 §3 の「宛先無し 1 件」を **4 件**へ ③ 🟥 **指摘集の一覧表が指摘 10 を取りこぼしていた**
  （手7 で本文だけ足された）④ ADR 昇格候補を 4 → **6 件**へ。
- 🟥 **ADR 昇格候補の性質が 2 種類に割れていることが分かった。**
  前 4 件（DR-0032/0033/0034/0052）は **decision がそのまま候補**だが、
  新しい 2 件（DR-0063 / DR-0066）は **finding** なので、**起案の前に「決定」を 1 本書く工程が要る。**
  **混ぜて起案すると、後者は根拠だけあって決定文が無い ADR になる。**——判定のみ、起案はしていない。
- ★ **Q8 を起票した（[指摘 11](共通コンポーネント思想への指摘.md)）。**
  **思想は「定義したものだけを使う」（許可リスト）で語るが、機械の網は両側とも禁止リストしか持てない。**
  🟥 **指摘 11 だけ性質が違う**——思想の文言を直しても解けず、**検査の形を変えないと閉じない。**
- 🟨 **未決 #25 の材料が増えた。**「初めて使った面から 1 件ずつ」が **5 手連続**（手4〜手8）。
  🟥 **n は 3 → 5 になったが率は数えていない**——**「初めて使った面」の数え方が観測ごとに違い、分母が定義できない。**
- **Q6 の 4 周目を準備した（D14=A）。**🟦 **変数は 1 つだけ動く**——
  `git diff 5c36b88..HEAD -- src/ .design-sync/` が **`conventions.md` 1 ファイルだけ**。
  🟥 **実行は人**（手6 D6・手7 D6 と同じ構造）。手順と**打つ前の予測 4 件**を [H8-10](手順/手8_出力は機械ゲートを通るか.md) に登録した。
- 🟦 **マージの打ち方が決まった（[DR-0068](DR/DR-0068-merge-through-pull-requests.md)）。PR に揃える。**
  `CLAUDE.md` §git を書き換え、未決 #26 を閉じた。手5・手6 の `--no-ff` 履歴はそのまま残す。
- **台帳の現在地**: DR **68 件**（決定 25 / 発見 43）・OBS 11 件（`open` 5）・手順書 9 本・思想への指摘 **11 件**。

### 2026-08-02（第 8 セッション・続 2）— `/design-sync` で 4 周目の準備を完了させた

- 🟦 **H8-10 step 1 が済んだ。**ユーザーが `/design-sync` を起動し、conventions header を DS 側へ届けた。
  **ドライバ自身が「動いたのは aux だけ」と判定**（30 件すべて carried forward・`bundle: false` / `styling: false`・削除 0）。
  → **手順書 §2.12 の「変数は 1 つだけ動く」が機械の側からも裏付けられた。**
- 🟥 **Conductor の worktree はフレッシュ clone と同じだった。**`.ds-sync/` `dist/types` `sb-reference` `.cache` が全部無く、
  再同期の前に揃える必要があった。**手順を [NOTES.md](../.design-sync/NOTES.md) に書き足した**（`pnpm` を経由せず直接叩く形）。
- ★ **skill の「header 実在検証」が H8-09 の検算になった。ドリフト 0 件。**
  クラス 26 語・名前 40・props と union 12 組・否定の主張 3 件を全件実測。
  🟨 **`window.Design` は grep ではなく vm で実際にロードして 129 export を列挙した**——
  **grep は「文字列がある」しか言えない**（[DR-0066](DR/DR-0066-neither-side-lints-the-generated-output.md) の教訓を自分に適用した）。
- 🟥 **その検証が本物の欠陥を 2 件掘り当てた。**
  - ★ **出荷している `.d.ts` は型検査を通らない（26 件）。**`React.Ref` に型引数が無い 18 件、
    `CSSProperties` / `ColumnDef` / `ListDetailState` / `NavItem` が未 import の 5 件、総称型に型引数が無い 2 件。
    🟥 **`package-validate.mjs` の「all .d.ts parse cleanly」は parse であって typecheck ではない。**
    → **[DR-0066](DR/DR-0066-neither-side-lints-the-generated-output.md) §4 の続き**——受け手の props 抽出が浅いのではなく、**元の型が成立していない。**
    🟨 前回とバイト同一なので**今回の退行ではない**（手6 から入っていた）。**未決 #29 に立てた。**
  - **README の自動生成部が header と矛盾していた**（生成部は `guidelines/` を「読め」と書く）。
    → header 側に打ち消しの 1 段落を足して再ビルドした。🟥 **出どころが converter なので header で上書きするしか手が無い。**
- **アップロード**: sentinel → 163 ファイル（3 チャンク）→ sentinel 再武装 → `_ds_sync.json` 最後。削除 0。
  `list_files` で 165 ＋ 受け手生成 2 件を確認、孤児なし。`report_validate`: total 30 / bad 0 / thin 0 / variantsIdentical 0。
- 🟥 **次の一手は 4 周目（人が claude.ai/design で打つ）。**予測 4 件は手順書 H8-10 に登録済み。

### 2026-08-02（第 8 セッション・続 3）— 🟥 4・5 周目が壊れ、ヘッダをロールバックした

- 🟥 **conventions header に禁止 3・語彙 0 を 842 バイト足したら、禁止した箇所以外が壊れた**（[DR-0069](DR/DR-0069-adding-prohibitions-to-the-header-degraded-the-output.md)）。
  - 🟦 **禁止した 2 件は効いた**——`<style>` の生 CSS が消え、`tabular-nums` が 2 → 0 に
  - 🟥 **同時に骨格が消えた**——`Container`（最大幅・余白）／`Section`（縦の間隔）／`DataGrid`（製品層の表）が 5 周目で **0**。
    表は `Table` / `TableRow` / `TableCell` で**素材層から手組み**（17 箇所）。
    🟥 **[DR-0065](DR/DR-0065-claude-design-uses-the-registered-components.md)（Q1 =「使う」）が崩れ始めた**
  - 🟥 **劣化は単調**（1→2→3 は改善、4→5 は悪化）。**ヘッダしか動いていない**
- ★ **「崩れて見える」の実体はランタイムの変換規則だった。**`support.js` を読むと
  `class → className` の変換は **`kind === "dom"` のときだけ**。部品には `class-name=` が要る。
  🟥 **`class=` と書くと props に `class` のまま渡り、React が黙って捨てる**（＝ `w-field-md` が当たらない）。
  🟨 `onValueChange` / `onClick` は `encodeCamelAttrs` があるので**問題なし**（最初の見立ては訂正した）。
- 🟥 **ロールバックした**（ユーザー判断）。`git show 5c36b88:.design-sync/conventions.md` で手7 の状態へ（差分 0 行）。
  ドライバ → DS へ再アップロードし、**remote の README が手7 の内容に戻ったことを `get_file` で確認済み。**
- 🟥 **ロールバックの途中で罠を踏んだ。**古いアンカーのせいでドライバが **`upload.any: false`**（アップロード不要）と誤判定した。
  remote には前の版が載ったままだった。→ **アンカーを取り直したら `aux: true` になった。**
  **§7 step 6「`finalize_plan` の直前にサイドカーを取り直せ」はこの形を防ぐためにある。**
- ★ **この手の一番の教訓: 予測表だけ見れば 4 周目は「成功」だった。**
  予測は「禁止した箇所が直るか」しか見ておらず、その 2 点は的中した。
  🟥 **壊れたのは予測していない場所で、2 周ともユーザーの目視でしか見つからなかった**
  ——[DR-0066](DR/DR-0066-neither-side-lints-the-generated-output.md)（どちらも見ていない）の実害が初めて画面に出た。
- 🟥 **Q6 は「効いた／効かない」では答えられない形になった。**確定には **6 周目（ロールバック後の対照）**が要る。
- **台帳の現在地**: DR **69 件**（決定 25 / 発見 44）・検体 5 本（`artifacts/h7` 3・`artifacts/h8` 2）。

### 🟥 次の一手 — 6 周目（対照・人が実行）

**ヘッダは手7 の状態に戻して DS へ反映済み。**同じ依頼文で 1 周打つだけ。

| 見るもの | 戻れば | 戻らなければ |
| --- | --- | --- |
| `Container` / `Section` / `DataGrid` が復活するか | 🟦 **[DR-0069](DR/DR-0069-adding-prohibitions-to-the-header-degraded-the-output.md) の因果が確定**（ヘッダ編集が原因） | 🟥 **原因はヘッダではない。**別の変数（受け手側の変化）を探す |
| `<style>` と `tabular-nums` が戻るか | 予想どおり（禁止を外したので戻るはず） | — |
| `class=` が `class-name=` に戻るか | ヘッダ由来だった | DSL の綴りは元から不安定 |

🟨 **戻ったら、次に足すのは 1 つだけ**——`class-name=`（DSL の綴り）。
**禁止ではなく「書き方」として足す**（[DR-0063](DR/DR-0063-forbidding-without-an-alternative-fails.md) ＋ [DR-0069](DR/DR-0069-adding-prohibitions-to-the-header-degraded-the-output.md)）。

### 2026-08-02（第 8 セッション・続 4）— ★ 6 周目で全部戻り、Q6 が確定した

- ★ **対照が成立した。**ヘッダを戻しただけで **3 周目と完全に同じ形**に復帰
  （`Container` / `Section` / `DataGrid` / `Label` / `class-name` すべて）。
  🟥 **`class=` もヘッダ由来だった**——[DR-0069](DR/DR-0069-adding-prohibitions-to-the-header-degraded-the-output.md) 起票時の「n=1 なので断定できない」は解消。
- ★ **Q6 の答え: conventions header は効く。ただし「効く」と「壊す」が同時に起きる。**
- 🟨 **6 周目に残る逸脱は 4 面のうち ③ だけ**（[DR-0060](DR/DR-0060-vocabulary-leaks-from-four-surfaces.md)）。
  **語彙表の外は 3 件で、全部 `DataGrid.columns[].cell` から出ている**（`tabular-nums` 2 / `font-emphasis` 1）。
  ①（素材層）は**正しい語彙を正しく使えており**、残るのは「**props ではなく `className` 経由である**」という形だけ。
  ②（`Box`）は 🟦 **0**（`Card` が使われた）。

### 🔺 手7 D10 案B（素材層を製品層ラッパーで包む）の判断材料が揃った

手7 D10 は **A（語彙を足す）のみ**を採り、**B を「手8 の数字が出てから」として保留**していた。数字が出た。

| B を採ると | |
| --- | --- |
| 🟦 面 ① が消える | `Select` が `width="md"` を props で受ければ `class-name` は不要になる |
| ★🟦 **[DR-0069](DR/DR-0069-adding-prohibitions-to-the-header-degraded-the-output.md) の事故も同時に消える** | **props なら `class` / `class-name` の綴り事故が起きえない。**[DR-0032](DR/DR-0032-layout-primitives-take-props-not-classname.md)（枠は props で閉じる）が**境界の向こうでもう一段の意味**を持った |
| 🟥 面 ③ は残る | `columns[].cell` は ReactNode を返す関数（[DR-0060](DR/DR-0060-vocabulary-leaks-from-four-surfaces.md) §影響 4）。**ラッパーでは塞がらない**——塞ぐなら `columns` に列オプションを足す＝**手4 の成果物の API 変更** |
| 🟥 面 ④ は残る | 規約の話。🟥 **ただし禁止を足すのは代償がある**（DR-0069） |

🟨 **2 回ルールの材料**: ① 手7 2 周目の `w-48`（素材層の className に任意値）② 手8 4・5 周目の `class=`（同じ経路が綴り事故で黙って落ちた）。
**形は違うが根は同じ「素材層は `className` でしか幅を渡せない」。**🔺 **成立と見るかはユーザー判断。**

### 2026-08-02（第 8 セッション・完）— 手8 を締め、手8c の手順書を起こした

- ✅ **手8 完了。**完了条件 11 件すべてチェック済み（付ける前に検証した）。
- 🟥 **手7 D10=B の枠組みが変わった**（ユーザーの見立て・2026-08-02）:
  > そもそも素材層のラッパーというか**必要な部品を製品層で作る**んだよね。素材層を組み合わせるための**抽象的な製品層**を作ってく。
  → **「16 件をラッパーで包むか」は問題の立て方が下から過ぎた。**問いは「**製品層にどんな部品が要るか**」。
- 🆕 **手8c を段取りに挿した**（手8 → **手8c** → 手8b → 手9）。**調査設計の手で、部品は 1 つも実装しない。**
  - **Q1**（本体）: 素材層のまま出すか製品層で作るかの**境界を判定できる規則として書けるか**
  - **Q2**（本体）: 足すべき部品は何か。**各行に「足す根拠の回数」**を付ける（🟥 0 回の候補を混ぜない）
  - **Q3**（本体）: **逃げ道を持たない製品層は成立するか**。成熟した DS はどう扱っているか
  - 調査は **3 群に束ねる**（手3 §2.5 と同じ形）——① 二層の境界 ② 抽象化の軸 ③ 依存の型を公開する扱い
- 🟨 **足す根拠の回数はもう数えてある**（手8 の 6 周ぶん）:
  `Select` の `width` **3 回** ／ `DataGrid` の列オプション **6 回** ／ `AppShell` の shell ＋ `Link` **4 回** ／
  🟥 **残る素材層 15 件は 0 回**（包む根拠が無い）。
- 🔺 **「選択肢を並べる前に調査を挟む」工程の 2 回目**（1 回目は手3 §2.5）。
  手3 の申し送りは「2 回目が来たらテンプレートに §2.5 として足す候補」と書いている。
  🟥 **ただし形が違う**（手3 は手の中の 1 ブロック、手8c は手そのもの）。**同じ需要と数えるかはユーザー判断。**
- **台帳の現在地**: DR **69 件**・OBS 11 件・手順書 **10 本**・思想への指摘 11 件・検体 6 本。

### 🟥 次の一手 — 手8c §2 の D1〜D8 を決める（ユーザー判断）

推奨は手順書 §2.1〜§2.8 に根拠つき。**D1（調査の射程）と D3（調査対象の DS）が最優先**——
🟥 **D3 は走り出したら足さない**（足すと「調べたいものを調べた」になる）。

| # | 論点 | 推奨 |
| --- | --- | --- |
| **D1** ★ | 調査の射程 | **C**（Q1〜Q6 全部）。同じソースを読めば同時に答えが出る。狭めるのは後から効かない |
| **D2** | 一次情報の基準 | **B**（GitHub のソース ＋ 公式 docs ＋ 設計者本人の記事）。🟥 一般記事は結論の根拠にしない |
| **D3** ★ | 調査対象の DS | **B**（直系＝shadcn/Radix ＋ 二層構造を明示している DS＝MUI Base/Material・React Aria/Spectrum・Ark/Chakra） |
| **D4** | 成果物の形 | **C**（調査文書 ＋ 設計文書 ＋ DR）。🟥 **ADR は起案しない**（候補が既に 7 件溜まっている） |
| **D5** | 思想への提案 | **A**（指摘集に足すだけ。⚠ 思想はユーザーの持ち物） |
| **D6** | どこまでで終わりか | **B**（部品の一覧 ＋ props シグネチャまで）。🟥 実装は次の手 |
| **D7** | 手8b・手9 との順序 | **A**（手8 → 手8c → 手8b → 手9） |
| **D8** | 調査の上限 | **A**（DS 4 本） |
