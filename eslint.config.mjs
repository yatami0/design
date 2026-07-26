// eslint.config.mjs
// PoC の @repo/eslint-config（base.js + next.js）を本 repo 用に 1 ファイルへ統合したもの。
//
// 【写したもの】移送可能性と検証に直結するため逐語で写す
//   - tseslint.configs.strictTypeChecked（型の厳しさ）
//   - non-negotiable-async 4 ルール
//   - 設定ファイル（js/mjs/cjs）の disableTypeChecked override
//   - react-hooks の flat.recommended
//   - ★ tailwindcss/no-arbitrary-value: 'error' ＝ 本検証の中核（数値・色の直書きを止める）
//   - Server Actions 禁止（'use server'）
//
// 【落としたもの】本 repo に守る対象が存在しないため
//   - fetch 直書き禁止 … mutator（src/lib/api/）も生成 hooks も無い
//   - no-restricted-imports … redmine-api も lib/api も無い
//   - 上記に対応する例外 override 2 つ … 参照先ディレクトリが存在しない
//   → 移送時は PoC 側の設定が正。本 repo で「通った」ことは PoC で通ることを保証しない。
//
// 【意図的に ignore しないもの】
//   shadcn/ui が置くコード（src/components/ui/**）は orval のような生成物ではなく
//   自分で編集する実体コード。ignore すると「shadcn の素のコードが strictTypeChecked と
//   任意値禁止を通るか」という手1 の観測ができなくなるため、検査対象に含める。
//
// 【手2b で足したもの】eslint-plugin-storybook
//   `storybook init` は import 行だけを足して config 配列に追加せず、
//   **プラグインが効いていない状態**にしていた（手順書 §2 D12）。story は shadcn の出力ではなく
//   自分で書くコードなので検査対象に入れる。PoC も将来 Storybook を入れる方針
//   （architecture.md §3.6）なので、この設定はそのまま移送できる。
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import tailwindcss from 'eslint-plugin-tailwindcss';
import storybook from 'eslint-plugin-storybook';

export default defineConfig(
  {
    ignores: ['**/dist/**', '**/.next/**', '**/storybook-static/**'],
  },

  tseslint.configs.strictTypeChecked,

  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  {
    name: 'repo/non-negotiable-async',
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/require-await': 'error',
    },
  },

  // 設定ファイル自身は tsconfig の include 外＝projectService が型情報を取れず parse error になる。
  // ignores で丸ごと除外せず、型情報を要求するルールだけ無効化する（構文・スタイル検査は残す）。
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  reactHooks.configs.flat.recommended,

  {
    files: ['**/*.{ts,tsx}'],
    // flat config では namespace → plugin 実体の明示登録が必須。
    // これが無いと 'tailwindcss/...' の rules 参照で lint 起動自体が落ちる。
    plugins: { tailwindcss },
    rules: {
      // ★ 本検証の中核。トークン外の値をコードに書けなくする。
      //   これが効いていないと「トークンを差し替えれば見た目が変わる」（手5）は成立しない。
      'tailwindcss/no-arbitrary-value': 'error',

      'no-restricted-syntax': [
        'error',
        {
          selector: "ExpressionStatement[directive='use server']",
          message:
            'Server Actions は禁止。部品層でも第 2 の経路を作らない（PoC §4.5 と同じ趣旨）',
        },
      ],
    },
  },

  // 手2b: story 専用の検査（D12）。init が配線し損ねていたものを正しく入れる。
  storybook.configs['flat/recommended'],
);
