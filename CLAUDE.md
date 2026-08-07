# design — UI 工場

**他の開発でも使い回せる UI を作る工場**（[DR-0078](docs/DR/DR-0078-repo-becomes-a-ui-factory-for-a-core-design-system.md)・2026-08-07 に役割変更）。
最終目的は**自分用コアデザインシステム**（Redmine 固有から抽象化したスーパーセット。レイアウトも含む）。
**題材は Redmine の 5 画面**（一覧 / 詳細 / ガント / EVM / 稼働表・編集あり）——部品の需要を洗い出す役。
出荷口は **git 依存（コード）＋ Claude Design（トークン・部品）**の 2 経路（[DR-0079](docs/DR/DR-0079-ship-via-git-dependency-and-claude-design.md)）。

## セッション開始時に必ず読む

**[`docs/handoff.md`](docs/handoff.md) が状態台帳の正本。**現在地・進捗ボード・機械ゲートのベースライン・次にやること・未決がすべてここにある。

## 正本ポインタ（食い違ったらこの順で正）

1. `docs/handoff.md` — **状態**（現在地・進捗・次の一手）
2. `docs/DR/index.md` — **決定と発見**（1 ファイル = 1 決定 or 1 発見）
3. `docs/工場の段取り.md` — **地図**（何を・なぜ・どの順で。工程0〜工程8）
   - 旧地図 `docs/UI検証の位置づけと段取り.md`（手0〜手9）は**検証期の記録**として凍結
4. `docs/共通コンポーネント思想.md` — **部品分類の正本**（3 層・役割 9 カテゴリ・フラグ）。⚠ **ユーザーの持ち物。書き換えず、指摘は DR に書く**
5. `docs/手順/` — 各工程の**計画**（答えを出す問い・判断ポイント・手順。旧・手N の手順書もここ）
6. `docs/実行記録.md` — 各工程の**実測**（構成とゲート結果の時系列）

## 進め方の規律

- **手順書を書く → 問いを確定させる → 実行する。**問いが立っていない工程は実行しない。
- **実行中に手順書 §2 に無い選択肢が出たら、その場で決めずに §2 へ追記してから進む。**
- **緑を信用しない。**赤テストで gate が発火することを確かめる（「対象 0 件で緑」を通算 16 例踏んでいる）。
- **赤は ignore で消さない。**shadcn の lint / typecheck の赤は**内訳こそが成果物**。ベースラインは handoff にある。
- **一次情報を実測で置き換える。**公式ドキュメントも古くなる（実例: DR-0006）。
- **「まだ作らない」と決めるときは理由を書く。回数（何回目か）は理由にならない**（[DR-0077](docs/DR/DR-0077-abolish-the-two-occurrence-rule.md) で 2 回ルールを廃止した）。回数は**記録する観測量**として数え続ける。

## 文書の責務分離

```
段取り（地図）→ 手順書（計画・実測は書かない）→ 実行記録（実測のみ）→ DR（1 決定 or 1 発見）
```

計画と結果を同じ場所に書かない。二重管理になるか、計画が結果に上書きされて「何を確かめようとしたか」が消える。

## git

- `main` が安定点。工程ごとに `step/p<N>-<slug>` を切り（旧・手は `step/h<N>-<slug>`）、完了したら **`gh pr create --base main` で PR を出す**（[DR-0068](docs/DR/DR-0068-merge-through-pull-requests.md)）。**マージは人が実行する**——Claude は提案まで
  - 🟥 ローカルの `git merge --no-ff` は使わない（手5・手6 の履歴には残っているが、以後は PR に揃える）
- コミットは `<type>(P<N>): 日本語要約 [工程N]`（type: `feat` / `fix` / `docs` / `chore` / `build` / `procedure` / `refactor` / `test`。旧・手のコミットは `(H<N>) [手N]`）
- 工程に属さない作業（文書整備・証跡整理）は `main` に直接コミットしてよい

## 機械ゲート

```bash
pnpm typecheck && pnpm lint && pnpm build && pnpm format:check && pnpm spell
```

**赤がベースライン。**件数と内訳を `docs/handoff.md` の表と比較して「新しい赤」を見つける。
🟥 工程1（Next → Vite）でゲートの構成が変わる予定。それまでは上記 ＋ `pnpm build-storybook` の 6 本。

### 文書のメタデータと台帳

`trace` plugin（`trace@aisy`）が機械で守る。**語彙・フィールド定義の正本は `.claude/trace.config.mjs`**（各 `_template.md` は読むための写し）。

| 台帳 | 入れるもの | skill |
|---|---|---|
| `docs/DR/` | **定まったもの。**決めたこと（`decision`）／実測で分かったこと（`finding`） | `/dr` |
| `docs/OBS/` | **まだ決まっていないもの。**疑問（`question`）／結びついた気づき（`insight`） | `/obs` |

**決まっていないものを DR に積まない。**結びついて判断が定まったら DR へ昇格させる。
`poc_feedback` フィールドは**「工場の規約へ戻す候補」**と読む（[DR-0081](docs/DR/DR-0081-poc-feedback-redirected-to-factory-conventions.md)。名前は旧のまま）。

- **新規 md を書く前に止まる** — 必須（`type` / `title` / `step` / `status`）の欠落・語彙違反・**採番の重複**を hook がブロックする
- **既存ファイルは対象外。** retrofit は段階的でよい（`--check` では warn で出る）
- **`related` の参照先が実在するかは hook では見ない。**台帳全体を見る検査は CLI 側:

```bash
node "$(jq -r '.plugins["trace@aisy"][0].installPath' ~/.claude/plugins/installed_plugins.json)/tools/docs-meta.mjs" --check
```

## 関連リポジトリ

| repo | 役割 |
|---|---|
| `~/git/PoC` | **参照のみ**（UI 規約・トークン語彙・任意値禁止 lint の出どころ）。🟥 **移送先ではなくなった**（DR-0078。旧・手9 は廃止） |
| `~/git/CC-Skills` | 前回の検証。`tmp-admin` 哲学（トークン値の引き継ぎ元）。🟥 この機械には無い（GitHub `yatami0/CC-Skills` は README のみ・DR-0067） |
