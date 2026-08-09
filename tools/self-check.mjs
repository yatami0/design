// tools/self-check.mjs — 測る側を測る（部品6 C6-04・D4=D）
//
// ★★★ 🟥 **なぜ要るか**: この repo の数字（critical 0 ／ serious 148 ／ 色の組 9 ／
//    保留 23 ／ 開いた overlay 7/7 ／ 被覆 21%）は **`tools/*.mjs` 1,512 行が作っている**のに、
//    **その 1,512 行に型の網も自動テストも 1 枚も無かった**（部品6 §1.3）。
//
//    🟥 **既に 2 度壊れていた**——
//      [DR-0094] バーの実行エンジンが CSS を 1 行も当てずに走っていた
//      [DR-0101] 「開いた story がある」の静的検査が **JSDoc のコメントで通っていた**
//    ★★ **2 度とも人が偶然見つけた。**部品4 K3・部品5 C5-05 の両方向テストは
//    **毎回手で打って捨てていた**ので、同じ形が次に入っても止まらない。
//
// 🟦 **やること: 検体を repo に置き、実行を 1 コマンドにする。**
//    ★ **両方向**（緑の検体で exit 0 ／ 赤の検体で exit 1）を必ず対にする——
//    片方だけだと「目盛りを書いて針を付けない」（部品1 B1-06・部品3 K7・部品4 K3 で 3 回踏んだ）。
//
// 🟨 **本物の `src/` は 1 バイトも触らない。**検体は `tmp/self-check/` に書き出し、
//    走査先を環境変数で向ける（`OVERLAY_UI_DIR` / `COVERAGE_STORY_DIR` …）。
//
// 使い方: node tools/self-check.mjs
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const ROOT = 'tmp/self-check';

/**
 * 検体を書き出す。
 * @param {string} dir
 * @param {Record<string, string>} files
 */
async function fixture(dir, files) {
  await rm(dir, { recursive: true, force: true });
  for (const [name, body] of Object.entries(files)) {
    const path = join(dir, name);
    await mkdir(join(path, '..'), { recursive: true });
    await writeFile(path, body);
  }
}

/**
 * @param {string} tool
 * @param {Record<string, string>} env
 * @returns {{ code: number, out: string }}
 */
function run(tool, env) {
  const r = spawnSync('node', [tool], {
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
  return { code: r.status ?? -1, out: `${r.stdout ?? ''}${r.stderr ?? ''}` };
}

/** @type {{name: string, ok: boolean, detail: string}[]} */
const results = [];
/**
 * @param {string} name
 * @param {boolean} ok
 * @param {string} detail
 */
const check = (name, ok, detail) => {
  results.push({ name, ok, detail });
  console.log(`  ${ok ? '🟦' : '🟥'} ${name}  ${detail}`);
};

// ── 検体 1: opened-overlay-check（[DR-0099] 静的側・[DR-0101] の穴） ──────
console.log('\n[opened-overlay-check]');

const UI_PORTAL = `
import { Primitive } from 'radix-ui';
function X() {
  return <Primitive.Portal><div data-slot="probe-content" /></Primitive.Portal>;
}
`;
const STORY_WITH_CLAIM = `
export const Open = {
  play: async () => { await expectOpened('probe-content'); },
};
`;
const STORY_CLAIM_IN_COMMENT = `
/** 開いた状態。主張は expectOpened('probe-content') と書く。 */
export const Open = {
  play: async () => { await userEvent.click(document.body); },
};
`;
const STORY_NO_CLAIM = `
export const Closed = { render: () => null };
`;

const ui = join(ROOT, 'ui');
const st = join(ROOT, 'stories');

await fixture(ui, { 'probe.tsx': UI_PORTAL });

await fixture(st, { 'Probe.stories.tsx': STORY_WITH_CLAIM });
let r = run('tools/opened-overlay-check.mjs', {
  OVERLAY_UI_DIR: ui,
  OVERLAY_STORY_DIR: st,
});
check('主張が在れば緑', r.code === 0, `exit ${String(r.code)}`);

await fixture(st, { 'Probe.stories.tsx': STORY_NO_CLAIM });
r = run('tools/opened-overlay-check.mjs', {
  OVERLAY_UI_DIR: ui,
  OVERLAY_STORY_DIR: st,
});
check('主張が無ければ赤', r.code === 1, `exit ${String(r.code)}`);

// ★★★ 🟥 [DR-0101] の再発検知。**この 1 本がこのファイルを書いた理由。**
await fixture(st, { 'Probe.stories.tsx': STORY_CLAIM_IN_COMMENT });
r = run('tools/opened-overlay-check.mjs', {
  OVERLAY_UI_DIR: ui,
  OVERLAY_STORY_DIR: st,
});
check(
  '🟥 コメントに書いただけでは通らない（DR-0101）',
  r.code === 1,
  `exit ${String(r.code)}`,
);

// 🟥 走査が壊れたら落ちる（「対象 0 件で緑」を作らない）
await fixture(ui, { 'probe.tsx': 'export function X() { return null; }' });
await fixture(st, { 'Probe.stories.tsx': STORY_WITH_CLAIM });
r = run('tools/opened-overlay-check.mjs', {
  OVERLAY_UI_DIR: ui,
  OVERLAY_STORY_DIR: st,
});
check(
  'portal を持つ素材が 0 件なら赤（走査が壊れた合図）',
  r.code === 1,
  `exit ${String(r.code)}`,
);

// ── 検体 2: coverage-scan（部品6 D2=B） ─────────────────────────────
console.log('\n[coverage-scan]');

const COMP_VOCAB = `
import { cva } from 'class-variance-authority';
export type Inset = keyof typeof INSET;
const INSET = { none: '', sm: 'p-inset-sm' } as const;
export interface ProbeProps { inset?: Inset; tone?: 'primary' | 'muted' }
const probeVariants = cva('base', {
  variants: {
    size: { sm: '', md: '' },
  },
});
export function Probe(props: ProbeProps & VariantProps<typeof probeVariants>) { return null }
`;
const STORY_VOCAB_CLAIM = `
export const Widths = {
  play: async ({ canvasElement }) => {
    await expect(styleOf(canvasElement, 'probe').paddingTop).toBe(
      resolveLength(canvasElement, '--spacing-inset-sm'),
    );
  },
};
`;
const STORY_VOCAB_NONE = `
export const Widths = { render: () => null };
`;
// 🟨 **面④ の 0/1 を測るには、repo 全体の主張が 0 本ではいけない。**
//    coverage-scan は「主張が 1 本も無い＝ 走査が壊れている」で落ちる（自己検査）ので、
//    面④ とは無関係な主張を 1 本置いて、**面④ の目盛りだけを動かす。**
const STORY_OTHER_CLAIM = `const meta = { title: '② 素材層/Other' };
export const Default = {
  play: async () => { await expect(1).toBe(1); },
};
`;

const comp = join(ROOT, 'components');
// 🟨 頭文字を詰めた造語をディレクトリ名にしない——**cspell の辞書に語が 1 つ増える。**
//    辞書に足すこと自体が「判定を人が覆した」記録になる（部品6 Q3）。
//    🟥 **注意すべきはコメントも検査対象だということ**——「この綴りは使わない」と
//    説明文にその綴りを書いた時点で赤になる（本回 2 回踏んだ）。
const cst = join(ROOT, 'cov-stories');
const covEnv = {
  COVERAGE_COMPONENT_DIRS: comp,
  COVERAGE_STORY_DIR: cst,
  COVERAGE_OUT: join(ROOT, 'out'),
};

await fixture(comp, { 'Probe.tsx': COMP_VOCAB });
await fixture(cst, {
  'Probe.stories.tsx': `const meta = { title: '② 素材層/Probe' };\n${STORY_VOCAB_CLAIM}`,
  'Other.stories.tsx': STORY_OTHER_CLAIM,
});
r = run('tools/coverage-scan.mjs', covEnv);
check(
  '面④ の主張が在れば 1/1',
  r.code === 0 && /④ 語彙の効果\s+1 \/\s+1/.test(r.out),
  `exit ${String(r.code)} / ${/④ 語彙の効果.*/.exec(r.out)?.[0]?.trim() ?? '（行が無い）'}`,
);

await fixture(cst, {
  'Probe.stories.tsx': `const meta = { title: '② 素材層/Probe' };\n${STORY_VOCAB_NONE}`,
  'Other.stories.tsx': STORY_OTHER_CLAIM,
});
r = run('tools/coverage-scan.mjs', covEnv);
check(
  '🟥 主張を消すと 0/1 に落ちる（目盛りが動く）',
  r.code === 0 && /④ 語彙の効果\s+0 \/\s+1/.test(r.out),
  `exit ${String(r.code)} / ${/④ 語彙の効果.*/.exec(r.out)?.[0]?.trim() ?? '（行が無い）'}`,
);

// 🟥 語彙の 3 経路のどれかが引けなくなったら落ちる
await fixture(comp, {
  'Probe.tsx': `export interface ProbeProps { tone?: 'primary' | 'muted' }`,
});
r = run('tools/coverage-scan.mjs', covEnv);
check(
  '語彙の経路が欠けたら赤（抽出が壊れた合図）',
  r.code === 1,
  `exit ${String(r.code)}`,
);

// 🟥 コメントを主張として数えない（DR-0101 を coverage 側でも）
await fixture(comp, { 'Probe.tsx': COMP_VOCAB });
await fixture(cst, {
  'Probe.stories.tsx': `const meta = { title: '② 素材層/Probe' };
/** 測り方は resolveLength(canvasElement, '--spacing-inset-sm') と書く。 */
export const Widths = { render: () => null };
`,
  'Other.stories.tsx': STORY_OTHER_CLAIM,
});
r = run('tools/coverage-scan.mjs', covEnv);
check(
  '🟥 コメントの中の測り方は数えない（DR-0101）',
  r.code === 0 && /④ 語彙の効果\s+0 \/\s+1/.test(r.out),
  `exit ${String(r.code)} / ${/④ 語彙の効果.*/.exec(r.out)?.[0]?.trim() ?? '（行が無い）'}`,
);

await rm(ROOT, { recursive: true, force: true });

// ── まとめ ────────────────────────────────────────────────────
const failed = results.filter((x) => !x.ok);
console.log(
  `\n${String(results.length - failed.length)} / ${String(results.length)} 件`,
);
if (results.length === 0) {
  console.error('🟥 検体が 1 件も走っていない（それ自体が「対象 0 件で緑」）');
  process.exit(1);
}
if (failed.length > 0) {
  console.error('\n🟥 測る側が測れていない');
  for (const f of failed) console.error(`  ${f.name}  ${f.detail}`);
  process.exit(1);
}
console.log('🟦 測る側は、壊すと落ちる');
