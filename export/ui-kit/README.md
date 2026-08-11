# ui-kit — shadcn/Tailwind ベースの共通 UI コンポーネント持ち出しパッケージ

design repo（UI 工場）から切り出した、**別プロジェクト（Next.js 想定）で PoC を回すための資産一式**。
node_modules・ビルド成果物は含まない。コンポーネント・トークン CSS・Storybook の story と設定だけが入っている。

## 中身

```
ui-kit/
├── README.md              ← 本ファイル（導入手順・使い方の規約）
├── docs/COMPONENTS.md     ← 各コンポーネントの Props 説明書
├── components.json        ← shadcn CLI の設定（新しい素材を足すときに使う）
├── .storybook/            ← Storybook 設定（持ち出し用に msw 配線を除去済み）
└── src/
    ├── index.ts           ← 出荷面の一覧（何が公開 API かの正本）
    ├── styles/            ← ① トークン層
    │   ├── globals.css        エントリ（Tailwind + shadcn + 下記 3 つを @import）
    │   ├── tokens.css         semantic 語彙（inset/stack/inline/text-* など。値は書かず参照で定義）
    │   ├── tmp-admin.css      テーマの実値（この @import 1 行で入り切りできる）
    │   └── tmp-admin-override.css  テーマ 2 周目の上書き（同上）
    ├── components/
    │   ├── ui/            ← ② 素材層 = shadcn 生成物。🟥 ここから直接 import しない
    │   ├── Action/ Communication/ DataDisplay/ Display/ Layout/
    │   │   Navigation/ Overlay/ Selection/ TextInput/
    │   │                  ← ② 製品層 = 役割カテゴリ別の窓口（自作 + shadcn ラッパー/再輸出）
    │   └── providers.tsx  ← AppProviders（Tooltip/Sidebar の Provider をまとめたもの）
    ├── patterns/          ← ③ 画面の型（PageHeader / FilterBar / FormLayout / ListDetail / EmptyState）
    ├── templates/         ← ④ AppShell（サイドバー + ヘッダのアプリ骨格）
    ├── hooks/             ← use-mobile（sidebar が使う）
    ├── lib/               ← cn() と、トークン語彙を教えた twMerge
    └── stories/           ← Storybook（役割カテゴリ別 + Foundations/Tokens + Patterns + Templates）
```

元 repo から**入れていないもの**: Redmine 題材の画面（`src/redmine/`）・msw モック（`src/mocks/`、`public/mockServiceWorker.js`）・検証記録用 story（`stories/Review/`）。story のうちこの 3 つに依存するものも除外済みで、残りは自己完結する。

## 導入手順（Next.js プロジェクトへ）

### 1. ファイル配置

`src/` の中身を移送先の `src/` にそのままマージする（`components/` `patterns/` `templates/` `hooks/` `lib/` `styles/` `stories/` `index.ts`）。
既存の `lib/utils.ts`（shadcn 既定）がある場合は**このパッケージの `lib/utils.ts` + `lib/tw-merge.ts` で上書きする**——トークン語彙を教えた twMerge が入っており、素の `cn()` だと語彙クラス（`w-field-md` 等）が `className` 経由で静かに無効になる。

### 2. tsconfig の alias

すべての import は `@/*` 前提。

```jsonc
{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }
```

### 3. 依存パッケージ

ランタイム（コンポーネントが動くのに必要な分）:

```bash
pnpm add @tanstack/react-table class-variance-authority clsx date-fns \
  lucide-react radix-ui react-day-picker shadcn tailwind-merge tw-animate-css
```

- `shadcn` は CLI としてだけでなく **`globals.css` が `@import 'shadcn/tailwind.css'` で参照する**ため dependencies に要る
- `radix-ui` は統合パッケージ（`@radix-ui/react-*` 個別ではない）
- react-hook-form / zod は**不要**（FormLayout は値を持たない設計。フォーム状態はアプリ側の持ち物）
- Tailwind は **v4**（`tailwind.config` ファイル無し・CSS ファーストの `@theme` 方式）。Next.js なら `@tailwindcss/postcss` で配線する

検証済みバージョンは元 repo で React 19.2 / Tailwind 4.3 / TypeScript 6.0 / Storybook 10.5。

### 4. CSS の取り込み

`app/layout.tsx`（または既存の globals）で 1 行:

```ts
import '@/styles/globals.css';
```

- 見た目のテーマ値は `tmp-admin.css`（+ override）に分離してある。**素の shadcn に戻したいときは `globals.css` からその 2 つの `@import` を消すだけ**
- `globals.css` 内の `@source not '../../docs'` は元 repo 都合（docs/ の md を Tailwind の走査から外す）。移送先にそのパスが無ければ削ってよい
- `@source inline('{w,max-w}-field-{sm,md,lg}')` は**消さない**——フィールド幅語彙はコンポーネント自身が使わないため、この行が無いと CSS に生成されず「書けるのに効かない」になる

### 5. Provider

Tooltip / Sidebar を使う画面ツリーの根を 1 回だけ包む:

```tsx
import { AppProviders } from '@/components/providers';

<AppProviders>{children}</AppProviders>
```

### 6. Storybook（任意）

story は Next.js 非依存なので、元 repo と同じ react-vite 構成が最短:

```bash
pnpm add -D storybook @storybook/react-vite @storybook/addon-a11y \
  @storybook/addon-docs @tailwindcss/vite tailwindcss playwright
npx storybook dev -p 6006
```

`.storybook/` は同梱の 2 ファイルをそのまま使う。story 内の `storybook/test`（expect / userEvent / waitFor）は `storybook` パッケージ同梱なので追加インストール不要。

## 使い方の規約（これだけ守る）

1. **画面からの import は役割カテゴリの窓口だけ**: `@/components/<役割>/...`・`@/patterns/...`・`@/templates/...`。
   🟥 `@/components/ui/**`（素材層）から直接 import しない。素材は製品層の内部実装で、窓口を 1 本に保つことで shadcn 更新やテーマ差し替えの影響範囲が読める。lint で守るなら `no-restricted-imports` に `@/components/ui/*` を足す。
2. **何が公開 API かは `src/index.ts` が正本**。迷ったらここを読む（各 export に「なぜ出すか」のコメント付き）。
3. **spacing / 文字サイズは semantic 語彙で書く**: `p-inset-md`・`gap-stack-md`・`gap-inline-sm`・`text-body` 等（一覧は `styles/tokens.css` と Storybook の Foundations/Tokens）。生値（`p-4` 等）は素材層の中にしか無い状態を保つ。
4. **語彙を増やしたら 2 箇所**: `styles/tokens.css` の `@theme` と `lib/tw-merge.ts` の `TOKEN_SCALES`。後者を忘れると `cn()` のクラス競合解決が効かず「型も lint も緑なのに作用しない prop」ができる。

## 新しいコンポーネントの作り方（shadcn + 自作資産の組み合わせ）

元 repo で回していた型をそのまま使う:

1. **素材が要るなら shadcn CLI で足す**: `npx shadcn add <name>`（`components.json` 同梱済み。生成先は `src/components/ui/`）
2. **役割カテゴリの窓口を作る**: `src/components/<役割>/<Name>.tsx` に
   - そのまま使えるなら再輸出（例: `export * from '@/components/ui/checkbox'`）
   - API を絞る・語彙を当てるなら薄いラッパー（例: `Action/Button.tsx`、`Selection/DatePicker.tsx` が手本）
   - shadcn に無いものは `Layout/Stack.tsx` や `DataDisplay/PivotTable.tsx` を手本に自作（トークン語彙のみで組む）
3. **`src/index.ts` に export を足す**（型も一緒に）
4. **story を 1 本書く**: `src/stories/<役割>/<Name>.stories.tsx`。overlay 系は「開いた」story を必ず入れる（`stories/opened.ts` のヘルパを使う。閉じた overlay は DOM が無く、描画・a11y チェックがすべて素通りするため）

役割カテゴリは 9 つ: Action / Communication / DataDisplay / Display / Layout / Navigation / Overlay / Selection / TextInput（+ Patterns / Templates）。

## Props の説明書

各コンポーネントの Props・使用例は **[docs/COMPONENTS.md](docs/COMPONENTS.md)** を参照。
生きた使用例としては Storybook の各 story（`src/stories/`）が最も正確。
