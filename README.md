# design — UI 検証リポジトリ

PoC（`~/git/PoC`）の **UI 部分の開発ワークフローが往復するか**を実測するための場所。
成果物は「決定」と「PoC へ移送可能なコード」。

## 読む順

| # | 文書 | 何の正本か |
|---|---|---|
| **1** | **[docs/handoff.md](docs/handoff.md)** | **状態台帳。**現在地・進捗ボード・機械ゲートのベースライン・次の一手・未決。**セッション開始時はここから** |
| 2 | [docs/DR/index.md](docs/DR/index.md) | **決定と発見**（1 ファイル = 1 決定 or 1 発見） |
| 3 | [docs/UI検証の位置づけと段取り.md](docs/UI検証の位置づけと段取り.md) | **地図。**この repo が何をする場所か・確定事項・手0〜手9 |
| 4 | [docs/共通コンポーネント思想.md](docs/共通コンポーネント思想.md) | **部品分類**（3 層・役割 9 カテゴリ・フラグ） |
| 5 | [docs/手順/](docs/手順/) | 手ごとの**実行計画**。形式の正本は [_template.md](docs/手順/_template.md) |
| 6 | [docs/実行記録.md](docs/実行記録.md) | 手ごとの**実測**（構成とゲート結果の時系列） |
| 7 | [docs/部品カタログ.md](docs/部品カタログ.md) | shadcn 63 部品 × 役割 9 カテゴリの割り当て・欠落リスト |
| 8 | [ClaudeDesignShadcnIntegration.md](ClaudeDesignShadcnIntegration.md) | 先行調査（shadcn × Claude Design） |

## 文書の責務分離

```
段取り（UI検証の位置づけと段取り.md）  … 何を・なぜ・どの順で。全体の地図
  └ 手順書（docs/手順/手N_*.md）      … その手で「答えを出す問い」と作業計画。実測は書かない
      └ 実行記録（実行記録.md）        … 実測結果の時系列。手順書へリンクする
          └ DR（docs/DR/DR-00XX-*.md） … 1 決定 or 1 発見。横断で引ける粒度

状態（docs/handoff.md）… 上のどこに何があるかと「いま何をすべきか」を指す台帳
```

**手順書と実行記録を混ぜない。**計画と結果を同じ場所に書くと、二重管理になるか、
計画が結果に上書きされて「何を確かめようとしたか」が消える。

## ローカルで起動する

```bash
cd ~/git/design
pnpm install          # node 24 / pnpm 10（mise.toml で固定）

pnpm storybook        # UI カタログ  → http://localhost:6006
pnpm dev              # 本体アプリ    → http://localhost:3000
```

**止めるとき**: 起動したターミナルで `Ctrl+C`。ポートが掴まれたままなら `lsof -ti:6006 | xargs kill`。

### Storybook で何を見るか

**カタログは開発補助ではなく[手5（トークン差し替え実験）の判定装置](docs/DR/DR-0017-storybook-as-catalog.md)。**
「部品が並んでいること」ではなく、**判定装置として使える状態か**を見る。

| # | 見るもの | 期待 |
|---|---|---|
| 1 | 左のサイドバーの階層 | **役割 9 カテゴリ + Foundations**（[部品カタログ.md](docs/部品カタログ.md) の表と同じ構造）。部品 18 件・story 33 本 |
| 2 | **Foundations / Tokens** | 色 26・角丸 7 段・余白 9・タイポ 6 が出ている。**ここが判定の一段目**——手5 でまず見る面 |
| 3 | 各部品が**素で描画される**か | Tailwind が通っていない場合は全部が無スタイルになる。1 つでも崩れたら配線を疑う |
| 4 | **Accessibility** パネル | `addon-a11y` を入れてある（[DR-0024](docs/DR/DR-0024-storybook-render-only-and-gate.md)）。**Action/Button → Sizes** で見ると、[未決 #11（タッチターゲット 44px）](docs/handoff.md#未決保留)の材料が取れる |

> 🟨 **色は本体と完全一致しない。**本体（Next）は oklch を hex + lab に展開し、Storybook（Vite）は oklch のまま出す。
> 値は等価だが、古いブラウザでの見え方は違いうる（[DR-0026](docs/DR/DR-0026-two-css-pipelines-differ.md)）。

### トークン差し替えを手で試す（手5 の予行演習）

[DR-0027](docs/DR/DR-0027-token-swap-not-detectable-by-css-diff.md) で確定した判定方法の **③ 目視で裏を取る**にあたる操作。
`--radius` を 1 つ動かすと 7 段すべてが追従するが、**生値を持つ 2 部品だけが変わらない**ことが目で見える。

```bash
git status --short                                   # 空であること（戻す前提）
sed -i 's/--radius: 0.625rem;/--radius: 1.5rem;/' src/app/globals.css
# → Storybook は自動リロードする。Foundations/Radius と各部品を見る
```

| 見る場所 | 期待 |
|---|---|
| Foundations / Radius | 🟦 7 段すべて丸くなる |
| Layout / Card, Overlay / Dialog | 🟦 丸くなる |
| **Selection / Checkbox** | 🟥 **変わらない**（`rounded-[4px]` の生値） |
| **Overlay / Tooltip → Always Open** | 🟥 **変わらない**（`rounded-[2px]` の生値） |
| Action / Button → Sizes の `xs` / `sm` | 🟨 少しだけ丸くなって**頭打ち**（`min(var(--radius-md), 10px)`） |

```bash
git checkout -- src/app/globals.css                  # 🟥 必ず戻す
git status --short                                   # 空に戻ることを確認
```

> 🟥 **戻し忘れると手5 の出発点が汚染され、実験が無効になる**（トークンの値は手5 まで shadcn デフォルトのまま。[DR-0005](docs/DR/DR-0005-token-ownership-and-two-stage.md) 決定3）。

## 作業の進め方

- **ブランチ**: `main` が安定点。手ごとに `step/h<N>-<slug>` を切り、完了したら `main` へ `--no-ff` マージ
- **コミット**: `<type>(H<N>): 日本語要約 [手N]`（type は PoC の規約に合わせる: `feat` / `fix` / `docs` / `chore` / `build` / `refactor` / `test`）
- **機械ゲート（6 本）**:
  ```bash
  pnpm typecheck && pnpm lint && pnpm build && pnpm format:check && pnpm spell && pnpm build-storybook
  ```
  - **赤がベースライン。**件数と内訳を [handoff.md](docs/handoff.md#機械ゲートのベースライン-重要) の表と比べて「新しい赤」を見つける
  - **緑を信用しない。**赤テストで gate が発火することを確かめる（PoC で「lint が対象 0 件で緑」の事故があった。
    手2b でも `.storybook/**` が射程外だったのを赤テストで見つけている → [DR-0025](docs/DR/DR-0025-storybook-init-is-not-selectable.md)）

## PoC との関係

- 依存は **PoC の catalog と同一値で厳密ピン**（版が違うと「移送できたか」の判定が信用できない）
- ESLint は PoC の設定を写す。ただし本 repo に守る対象が無いルールは落としてある
  → **本 repo で緑でも PoC で緑とは限らない**（差分は [実行記録.md](docs/実行記録.md) §手0）
- **移送の瞬間だけは人が実行する。**PoC の「成果物は人が作る」規約を素通りさせないため
