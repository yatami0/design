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

// 手3 D4=B′（DR-0033）: 枠は層ごとに違う手段で閉じる。
//   素材層 = 触らない（git diff で判定）／製品層・アプリ層 = 何を書いたかで判定。
//
// 🟥 `tailwindcss/no-arbitrary-value` は角括弧しか見ない（DR-0028）。
//    `p-13` は正当な Tailwind クラスなので素通りし、`w-99`(396px) まで書けてしまう。
//    v4 の spacing は calc(var(--spacing) * n) の動的生成で n に上限が無いため。
const NUMERIC_STEP =
  '/(^|\\s)-?(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y|w|h|size|min-w|min-h|max-w|max-h|space-x|space-y|inset|inset-x|inset-y|top|right|bottom|left|basis)-[0-9]/';

// 色も同じ穴を持つ。`text-gray-600` は Tailwind のパレット 288 色の 1 つで、
// 用途を一切言っていない＝ primitive。ユーザー要求は「**色と余白**は定義したものだけ」。
const PRIMITIVE_COLOR =
  '/(^|\\s)(bg|text|border|ring|outline|fill|stroke|from|via|to|divide|placeholder|caret|accent|decoration|shadow)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]/';

// 検査する文脈は `tailwindcss/no-arbitrary-value` に合わせる（実測: className / cva / cn は見る、
// 素の const や object literal は見ない）。同じ穴を空けないよう同じ 3 文脈を張る。
const NUMERIC_STEP_MESSAGE =
  '数値の段（primitive）は製品層・アプリ層では使えない。semantic な用途名（--spacing-inset-* / stack / inline）を使うこと（DR-0032・DR-0033）';
const COLOR_MESSAGE =
  'パレット色（primitive）は製品層・アプリ層では使えない。semantic な色（bg-card / text-muted-foreground など）を使うこと（DR-0033）';

const restrict = (pattern, message) => [
  {
    selector: `JSXAttribute[name.name='className'] Literal[value=${pattern}]`,
    message,
  },
  {
    selector: `JSXAttribute[name.name='className'] TemplateElement[value.raw=${pattern}]`,
    message,
  },
  {
    selector: `CallExpression[callee.name=/^(cn|cva|clsx|classnames|tv)$/] Literal[value=${pattern}]`,
    message,
  },
  {
    selector: `CallExpression[callee.name=/^(cn|cva|clsx|classnames|tv)$/] TemplateElement[value.raw=${pattern}]`,
    message,
  },
];

const noPrimitiveValues = [
  ...restrict(NUMERIC_STEP, NUMERIC_STEP_MESSAGE),
  ...restrict(PRIMITIVE_COLOR, COLOR_MESSAGE),
];

// Server Actions 禁止（PoC §4.5 と同じ趣旨）。no-restricted-syntax は
// **後のブロックが前のブロックを置き換える**ので、製品層側にも同じ制約を再掲する。
const noServerActions = {
  selector: "ExpressionStatement[directive='use server']",
  message:
    'Server Actions は禁止。部品層でも第 2 の経路を作らない（PoC §4.5 と同じ趣旨）',
};

// 🆕 工程2 D12: PoC が持っていて本 repo が落としていた 2 ルールを、**守る対象が生まれたので**戻す。
// 冒頭の【落としたもの】に「fetch 直書き禁止 … mutator も生成 hooks も無い」と書いてあるのが
// その理由だった。工程2 で `src/redmine/client.ts`（取得の層）ができたので条件が満たされた。
// → DR-0081（poc_feedback は「工場の規約へ戻す候補」）の最初の実例。
//
// 🟥 **足して 0 件のまま緑なのが一番危ない**ので、赤テストで発火を確かめてある（実行記録 §工程2）。
const noRawFetch = {
  selector: "CallExpression[callee.name='fetch']",
  message:
    'fetch の直書きは禁止。取得は題材の層（src/redmine/client.ts）だけが持つ（工程2 D4=B）',
};

// 🆕 工程2: **コアは題材を知らない。**出荷物（src/index.ts から出るもの）が
// Redmine の URL 形状やステータス id を知った時点で、「使い回せる UI」ではなくなる（DR-0078）。
const noSubjectImports = {
  group: ['@/redmine/*', '@/mocks/*', '**/redmine/*', '**/mocks/*'],
  message:
    'コア（部品・Pattern・Template）は題材（Redmine）を知らない。データは props で受け取る（工程2 D4=B・データモデル §6）',
};

const noMaterialLayerImports = {
  group: ['@/components/ui/*', '**/components/ui/*'],
  message:
    '素材層（shadcn）は直接使わない。製品層 @/components/<役割カテゴリ>/… から import すること（D3=B）',
};

// 🆕 工程4 D12: **コアは編集の状態を持たない。**
// ユーザー判断 2026-08-08「UI はできるだけ純粋に保つ」＋ 工程4 D1=B の帰結——
// フォームの状態管理（react-hook-form）と検証（zod）は**題材の画面**が持ち、
// コアは器（ラベル・必須の印・エラー文の置き場）だけを持つ。
//
// 🟥 これを機械で守らないと、**import 1 行で出荷物の依存が増える**。
//    しかも増えたことは dist の中身では見えない（entry から到達しなければ束ねられないので、
//    「dist が綺麗」のまま `package.json` の名乗りだけが濁る）→ 型と lint でしか捕まらない。
// 🟦 発火は赤テストで確認済み（実行記録 §工程4 P4-04）。
const noFormStateLibs = {
  group: ['react-hook-form', '@hookform/*', 'zod', 'zod/*'],
  message:
    'コア（部品・Pattern・Template）は編集の状態と検証の仕組みを知らない。フォームの器は「ただのデータ」を受け取り、react-hook-form / zod は題材（src/redmine/**）が持つ（工程4 D1=B・ユーザー判断「UI はできるだけ純粋に保つ」）',
};

export default defineConfig(
  {
    // 手6: /design-sync の生成物・staging を射程から外す。
    // 🟥 除外するのは**生成物だけ**。`.design-sync/` を丸ごと外さないのは、
    //    `previews/`（自分で書いて commit する owned preview）と config/NOTES を
    //    検査対象に残すため——「層を足すたびに射程が漏れる」（DR-0040）の 3 例目を作らない。
    ignores: [
      '**/dist/**',
      '**/storybook-static/**',
      '**/.design-sync/sb-reference/**', // 参照 Storybook（基準器・再生成される）
      '**/.design-sync/.cache/**', // 生成された preview wrapper・compare の作業状態
      '**/ds-bundle/**', // converter の出力（アップロードされる成果物）
      '**/.ds-sync/**', // skill から写した converter スクリプト＋その依存
      // 手8 D7=B の帰結: Claude Design の生成物（`artifacts/h7/**` の `.dc.html` 原本と、
      // `artifacts/h8/**` の TSX 機械翻訳）は**検体であって製品ではない**。
      // 🟥 測るときだけ射程に入れる。恒久的に入れると、翻訳由来の赤（TS4114 の
      //    `override` 4 件など）がベースラインに居座り「新しい赤」が見えなくなる。
      //   再現手順: この行を外し、`tsconfig.json` の include に
      //             "artifacts/h8/**/*.tsx" を足す（実測は実行記録 §手8）。
      'artifacts/**',
      // 工程2: MSW の worker スクリプト（`msw init` の生成物・vendor コード）。
      // 🟥 除外前に測ったら **warning が 1 件増えた**——しかも中身は
      //    「Unused eslint-disable directive」＝ **生成物が自分で書いた eslint-disable が赤を作った**。
      //    DR-0040 の再演。内訳は 実行記録 §工程2。
      'public/mockServiceWorker.js',
    ],
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

      'no-restricted-syntax': ['error', noServerActions, noRawFetch],
    },
  },

  // 🆕 工程2: 取得の層だけは fetch を書いてよい（というより**ここしか書けない**）。
  // no-restricted-syntax は後のブロックが前を置き換えるので、noServerActions を再掲する。
  // 🟥 工程3 D11: 例外の射程を `src/redmine/**` 全体 → **client.ts 1 ファイル**に絞った。
  //    広いままだと画面（screens/）が client.ts を迂回して fetch を直書きできる
  //    （K7 で「全体例外のときは緑」を実証してから絞った）。
  {
    name: 'repo/fetch-lives-here',
    files: ['src/redmine/client.ts'],
    rules: {
      'no-restricted-syntax': ['error', noServerActions],
    },
  },

  // 手3 D4=B′: 製品層とアプリ層だけ「数値の段」を禁じる。
  // 素材層（src/components/ui/**）は 128 箇所が直書きなので**開いたまま**にする——
  // 閉じると余白が全部消えるうえ、ビルドは緑のまま通ってしまう（DR-0028）。
  {
    name: 'repo/product-layer-frame',
    files: [
      'src/components/**/*.{ts,tsx}',
      // 工程1: src/app（Next の画面）は削除した。画面はカタログ（src/stories）が持つ
      'src/patterns/**/*.{ts,tsx}',
      'src/templates/**/*.{ts,tsx}',
    ],
    ignores: ['src/components/ui/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        noServerActions,
        noRawFetch,
        ...noPrimitiveValues,
      ],
    },
  },

  // 手3 D3=B: 画面と story は製品層しか見ない。
  // 製品層自身と `.storybook/**` は素材層を包む側なので対象外。
  //
  // 🆕 工程2: no-restricted-imports も**後のブロックが前を置き換える**ので、
  //    「素材層を見ない」と「題材を見ない」は**射程ごとに 3 ブロックへ割った**。
  //    story だけは題材（src/redmine・src/mocks）を見てよい——検体がそこにあるため。
  {
    name: 'repo/import-through-product-layer',
    files: ['src/stories/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [noMaterialLayerImports] },
      ],
    },
  },

  {
    // 手4 D8: ③ 層は ② の上にあるので、素材層を直接触ってよい理由が無い。
    // 🆕 工程2 D12: ③④ 層は**題材も知らない**（コアとして出荷されるため）。
    name: 'repo/product-layer-boundaries',
    files: ['src/patterns/**/*.{ts,tsx}', 'src/templates/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            noMaterialLayerImports,
            noSubjectImports,
            // 🆕 工程4 D12
            noFormStateLibs,
          ],
        },
      ],
    },
  },

  {
    // 🆕 工程2 D12: ② 層（素材層を包む側）は素材層を見てよいが、題材は見ない。
    // 🆕 工程4 D12: 素材層（src/components/ui/**）も含めて、コアは状態ライブラリを見ない。
    //    shadcn の `form` を後から足すと rhf が素材層に入るので、**射程はここが要**。
    name: 'repo/core-does-not-know-the-subject',
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [noSubjectImports, noFormStateLibs] },
      ],
    },
  },

  {
    // 🆕 工程3 D11: アプリ層（題材の画面）。手3 D4=B′ の「アプリ層」の規則が
    // 工程1 で src/app が消えて以来、掛かる先を失っていた（DR-0074 の w-48 と同じ経路）。
    // 画面には ① 素材層の直 import 禁止（窓口 1 本） ② 数値の段・パレット色の禁止 を張る。
    // ③ fetch 禁止は global ブロックのものが効く（例外を client.ts に絞ったため）。
    // 🟥 発火は K7 で「穴の実証 → 塞いで赤 → 検体を消して緑」まで確認した（実行記録 §工程3）。
    name: 'repo/subject-screens-frame',
    files: ['src/redmine/screens/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        noServerActions,
        noRawFetch,
        ...noPrimitiveValues,
      ],
      'no-restricted-imports': [
        'error',
        { patterns: [noMaterialLayerImports] },
      ],
      // 🆕 工程3 D15: K2 の実測「`as unknown as` は型でもベースの lint でも止まらない」への答え。
      // 画面は model の型だけを読めばよく、キャストが要る正当な場面が無い——
      // ここが開いていると「3 点だけ」（工程2 Q3）が as 1 個で破れる。射程は画面層だけ
      // （client.ts / handlers.ts には request.json() など正当なキャストが残る）。
      '@typescript-eslint/no-unsafe-type-assertion': 'error',
    },
  },

  // 手2b: story 専用の検査（D12）。init が配線し損ねていたものを正しく入れる。
  storybook.configs['flat/recommended'],
);
