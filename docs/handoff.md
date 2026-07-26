# 状態台帳（handoff）

> **この repo の「状態」はすべて本ファイルが正。**セッション開始時に必ず読み、終了時に更新する。
> 地図＝[UI検証の位置づけと段取り.md](UI検証の位置づけと段取り.md)／計画＝[docs/手順/](手順/)／実測＝[実行記録.md](実行記録.md)／決定と発見＝[docs/DR/](DR/index.md)

最終更新: 2026-07-26

---

## 現在地

- **手0（土台）・手1（shadcn 導入と役割分類）が完了。**どちらも `main` へ `--no-ff` マージ済み、作業ツリー clean。
- 手1 の 7 つの問い（Q1〜Q7）にすべて回答済み。**手2 と手3 の作業範囲が確定した。**
- **決定 7 件・発見 9 件を [docs/DR/](DR/index.md) に切り出し済み**（DR-0001〜0016）。
- 次は **手2（① Tokens 層）**。まず手順書 `docs/手順/手2_*.md` を書き、問いを立ててから実行する。

## 進捗ボード

| 手 | 内容 | 手順書 | 状態 |
|---|---|---|---|
| 手0 | 土台（Next.js + Tailwind v4 + PoC 同一版・同一 lint） | （無し。フォーマット確定前） | ✅ **done** |
| 手1 | shadcn デフォルト導入 + 役割 9 カテゴリ割り当て | [手1](手順/手1_shadcn導入と役割分類.md) | ✅ **done** |
| 手2 | ① Tokens 層（3 層トークン ↔ shadcn 語彙 ↔ tmp-admin のマッピング） | 未作成 | ⬜ **次はここ** |
| 手3 | ② Components 層（Layout / Overlay の自作テンプレ・状態は hook へ） | 未作成 | ⬜ |
| 手4 | ③ Patterns / Templates 層 + ダミーデータで一覧を組む | 未作成 | ⬜ |
| 手5 | ★ トークン差し替え実験 | 未作成 | ⬜ |
| 手6 | `/design-sync` で登録 → 役割・フラグが渡るか観測 | 未作成 | ⬜ |
| 手7 | ★ Claude Design で一覧を組ませる → 使うか作り直すか | 未作成 | ⬜ |
| 手8 | 出力は lint / validate.mjs を通るか | 未作成 | ⬜ |
| 手9 | 移送手順（人が実行）+ PoC の docs へ DR/OBS で戻す | 未作成 | ⬜ |

## 機械ゲートのベースライン ★重要

**赤がベースライン**（DR-0007 により shadcn の赤を ignore していない）。
次セッションは**この数字と比較**して「新しい赤が出たか」を判定する。

| ゲート | 手1 完了時 | 備考 |
|---|---|---|
| `pnpm typecheck` | 🟥 **赤 1 件** | `dropdown-menu.tsx:94` / `exactOptionalPropertyTypes`（DR-0014） |
| `pnpm lint` | 🟥 **赤 33 件** | 任意値 24（DR-0010）／型系 9。**うち `sidebar.tsx` 17 + `use-mobile.ts` 3 = 6 割** |
| `pnpm build` | 🟥 **赤** | typecheck と同一原因 |
| `pnpm format:check` | 🟦 **緑** | shadcn 出力は `.prettierignore`（DR-0007） |
| `pnpm spell` | 🟦 **緑** | |

内訳を取り直すコマンド:

```bash
./node_modules/.bin/eslint . -f json > /tmp/lint.json
node -e "const r=require('/tmp/lint.json');const m={};for(const f of r)for(const x of f.messages)m[x.ruleId]=(m[x.ruleId]||0)+1;console.log(m)"
```

## 環境の再現

```bash
cd ~/git/design
pnpm install          # node 24 / pnpm 10（mise.toml で node 24 を固定）
pnpm dev              # 開発サーバ
```

依存は**すべて PoC の catalog と同一値で厳密ピン**（DR-0003）。`^` で入っているのは shadcn が追加した 7 件のみ（DR-0016）。

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

## 次にやること（手2）

**まず手順書を書く。**問いの立っていない手は実行しない（DR-0004）。

### 手2 で扱うことは、手1 の観測で既に確定している

| # | やること | 根拠 |
|---|---|---|
| 1 | **semantic spacing を自前定義する**（shadcn に 1 つも無い） | DR-0012 |
| 2 | **semantic typography を自前定義する**（`--font-sans` / `--font-heading` の 2 つだけでサイズ階調が無い） | DR-0012 |
| 3 | 色と radius は shadcn の語彙に載せる（`@theme inline` / `:root` / `.dark` の 3 ブロック構造） | DR-0012 |
| 4 | 思想の 3 層（primitive / semantic / component）↔ shadcn の 2 層（`:root` の値 ↔ `@theme inline` の語彙）↔ `tmp-admin` の Apple 系語彙、の**マッピング表**を作る | DR-0005 |
| 5 | 🟨 **`tmp-admin` の「accent は塗りに使わない・ブランドは濃紺の面で出す」と shadcn 既定（`primary` の塗り CTA）の衝突を解く** | DR-0005 |
| 6 | Tailwind v4 の `--spacing`（1 変数基準のスケール）を semantic spacing とみなすかを判断する | DR-0012 |

### 手2 で決めてはいけないこと

- **トークンの「値」は決めない。**手5 まで shadcn デフォルトのまま（DR-0005 決定3）。手2 で作るのは**語彙とマッピング**だけ。

### 参照先

- `tmp-admin` 哲学: `~/git/CC-Skills/web-design-mock/_philosophies/aux-admin/aux-admin.md`（`status: approved`）
- shadcn の現行トークン: `src/app/globals.css`（138 行・init が生成）
- PoC の語彙: `~/git/PoC/packages/tailwind-config/theme.css`

## 未決・保留

| # | 論点 | いつ決めるか |
|---|---|---|
| 1 | 🟥 **`exactOptionalPropertyTypes` の扱い**（設定を弱める / 部品を 1 行直す / 該当部品を使わない） | **手3 まで**。`build` が赤のままだと手4 で詰まる（DR-0014） |
| 2 | Sidebar の状態を hook へ切り出すか（唯一 state を内包・lint 赤の 6 割） | 手3（DR-0013） |
| 3 | TanStack Table を導入するか（`Data Table` は組み立てガイドで新規依存が要る） | 手3 |
| 4 | 思想への指摘 3 点を採るか（分類の穴・Overlay の定義・`provider` フラグ） | ユーザー判断（DR-0015） |
| 5 | 手5 の判定方法を「どこが変わらなかったか」の列挙に変える | 手5 の手順書作成時（DR-0010） |
| 6 | `preset` ごと差し替える軸を手5 に含めるか（トークン差し替えとは別の軸） | 手5（DR-0016） |
| 7 | ダミーデータの作り方（契約は `/ping` 1 本のみ＝使えるデータがゼロ） | 手4。**仮置き: 使い捨ての手書き**（契約の正本を割らないため） |

## セッション申し送り

### 2026-07-26（第 1 セッション）— 位置づけの確定から手1 完了まで

- **要求分析からやり直した。**「UI 部分を検証する」の主語が①画面②ワークフローに割れており、ユーザー判断で②に確定（DR-0001）。
- **ユーザーの見立て「画面は変わるが共通部品は変わらない」を検証設計に落とした。**理由は変化率ではなく**変更コストの非対称性**で、PoC 側で先に立っている構造（任意値禁止 lint・トークン語彙の正本）がすべて下の層を守るものだったことと符合する（DR-0002）。
- **前回の検証資産（`~/git/CC-Skills`）を発掘した。**`tmp-admin` 哲学が `status: approved`・D4 汎化検証済みで、`validated_screens` が Redmine チケット一覧と射程一致。**トークン値をゼロから決め直す必要が無くなった**（DR-0005）。
- **手1 の最大の収穫は「赤の内訳」。**shadcn 自身が任意値を発明しており（生値 8 件）、**手5 の判定を二値にできないことが判明した**（DR-0010）。これは手5 の手順書を書く時点で必ず反映すること。
- **計画に無い選択肢が出たとき、その場で決めずに手順書 §2 へ追記してから進む規律が機能した。**CLI v4 の設定モデルが公式 docs と食い違っていた件（DR-0006）がその実例。
- ⚠ **1 件訂正した。**「`baseColor` は論点ごと消滅」と記録したが、init 後の `components.json` には実在し既定値 `neutral` が入っていた。手順書・実行記録の両方を訂正済み。**一次情報（docs）も古くなる**ので、実物で裏を取る規律を続けること。
- **仕組み化はまだしない。**CC-Skills の `web-design-mock` / `distill` skill を React/shadcn 版へ拡張するのは「同じ需要の 2 回目」だが、1 周して通らなかった箇所が分かるまで何を仕組み化すべきか決まらない。**手9 で判断する。**
