// tools/coverage-scan.mjs — 完成バーの「被覆」を数える（部品6 C6-02・D2=B）
//
// ★★★ 🟥 **なぜ要るか**: バーの数字は **story 数**で書かれている（「バー 130/130 緑」）が、
//    **story 数は主張の量ではない。**着手前実測（部品6 §1.1）——
//    **`await expect` を 1 本も持たない story が 130 中 110（85%）。**
//    ★ その 110 件に掛かっているのは **面①（描画された）と面②（a11y）だけ**で、
//    🟥 **面① は「どの部品が描かれたか」を見ていない**（[OBS-0021]）、
//    🟥 **面② は `color-contrast` / `region` を rule 単位で無効化している**。
//    ＝ **「緑」は面積で読まないと、何を保証しているのか分からない。**
//
// 🟥 **ゲートではない**（`a11y-scan.mjs` と同じ立ち位置）。**台帳に載せる数**を作る。
//    ★ **閾値は置かない**（部品6 D2=B）——**いま何%かを知らないと閾値は置けない**し、
//    置いた瞬間の 21% が正当化される。**置く条件は D9 に書いた**（「被覆率が 1 度でも下がったら」）。
//
// 🟥 **ただし「走査が壊れたら落ちる」**——`a11y-scan` の「未分類は exit 1」と同じ形。
//    **0 件を静かに返す計測器は、それ自体が「対象 0 件で緑」**（通算 17 例）。
//
// 🆕 **コメントを先に落とす**（部品5 D11=A・[DR-0101]）——
//    **JSDoc に `await expect(...)` と引用しただけで主張として数えられる**形を作らない。
//
// 使い方: node tools/coverage-scan.mjs
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';

// 🆕 部品6 D4=D — 走査先を差し替えられるようにする（**この道具自身の赤テストのため**）。
//    既定値は変えない。固定した赤テストは `tools/self-check.mjs`。
const STORY_DIR = process.env['COVERAGE_STORY_DIR'] ?? 'src/stories';
const COMPONENT_DIRS = (
  process.env['COVERAGE_COMPONENT_DIRS'] ?? 'src/components,src/patterns'
).split(',');
const OUT = process.env['COVERAGE_OUT'] ?? 'tmp/coverage';

/** 出荷しない棚（[部品1 D4=B]）。`a11y-scan.mjs` の EXCLUDED と同じ集合。 */
const EXCLUDED = ['★ Review', '⑤ 題材', '① Tokens'];

/**
 * 🆕 部品5 D11=A — コメントを主張として数えない。減る方向にしか効かない。
 * @param {string} src
 * @returns {string}
 */
const stripComments = (src) =>
  src.replaceAll(/\/\*[\s\S]*?\*\//g, '').replaceAll(/\/\/[^\n]*/g, '');

/**
 * 部品の同一性はファイル名で取る（`dropdown-menu.tsx` ↔ `DropdownMenu.stories.tsx`）。
 * @param {string} name
 * @returns {string}
 */
const norm = (name) => name.toLowerCase().replaceAll(/[^a-z0-9]/g, '');

/**
 * @param {string} dir
 * @param {string} suffix
 * @returns {Promise<string[]>}
 */
async function walk(dir, suffix) {
  /** @type {string[]} */
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path, suffix)));
    else if (entry.name.endsWith(suffix)) out.push(path);
  }
  return out;
}

/**
 * @typedef {object} StoryRow
 * @property {string} file
 * @property {string} key
 * @property {string} title
 * @property {string} shelf
 * @property {boolean} shipped
 * @property {string} name
 * @property {boolean} hasPlay
 * @property {number} expects
 * @property {boolean} vocab
 * @property {number} opened
 * @property {number} trapped
 */

// ── ① story を数える ──────────────────────────────────────────
const storyPaths = (await walk(STORY_DIR, '.stories.tsx')).sort();
/** @type {StoryRow[]} */
const stories = [];
/** @type {Map<string, {path: string, title: string, shelf: string, shipped: boolean, rows: StoryRow[]}>} */
const byFile = new Map();

for (const path of storyPaths) {
  const src = stripComments(await readFile(path, 'utf8'));
  const title = /title:\s*'([^']+)'/.exec(src)?.[1] ?? '(title 無し)';
  const shelf = title.split('/')[0] ?? title;
  // 🟨 `startsWith` で見る（`a11y-scan.mjs` と同じ）——棚名は `⑤ 題材（Redmine）` のように
  //    後ろが伸びる。**完全一致で書くと 2 story を出荷物の棚に数えてしまう**（実測で踏んだ）。
  const shipped = !EXCLUDED.some((prefix) => shelf.startsWith(prefix));
  const key = norm(basename(path, '.stories.tsx'));

  // `export const X` 単位で切る（`export default meta` は含まれない）
  const parts = src.split(/\nexport const /).slice(1);
  /** @type {StoryRow[]} */
  const rows = [];
  for (const part of parts) {
    const name = /^([A-Za-z0-9_]+)/.exec(part)?.[1] ?? '(名前不明)';
    const body = part.split(/\n(?=export )/)[0] ?? part;
    rows.push({
      file: path,
      key,
      title,
      shelf,
      shipped,
      name,
      hasPlay: /\bplay:/.test(body),
      expects: (body.match(/await expect\(/g) ?? []).length,
      // 面④（語彙の効果）— `src/stories/measure.ts` の測り方を使っているか
      // 🆕 工程5 D12=A: `measure.ts` の 4 関数**または**生の `getComputedStyle`。
      //    🟥 初版は measure.ts の呼び出しだけを数えており、**実効値を読んでいる主張を
      //    「道具の使い方が違う」という理由で 0 と数えていた**（`PivotTable` で踏んだ）。
      vocab:
        /\b(resolveLength|resolveColor|styleOf|boxOf|getComputedStyle)\(/.test(
          body,
        ),
      opened: (body.match(/expectOpened\(/g) ?? []).length,
      trapped: (body.match(/expectFocusTrapped\(/g) ?? []).length,
    });
  }
  stories.push(...rows);
  byFile.set(key, { path, title, shelf, shipped, rows });
}

// ── ② 語彙 prop を持つ部品を機械で引く ────────────────────────────
// 🟥 **手で数えない**（[DR-0099]「射程の外の一覧は機械が引く」）。
//    部品1 B1-06 の「union prop を持つ 21 部品」は**目で数えたもの**で、正本が無かった。
//
// 🟥 **語彙の書かれ方は 3 通りある。**1 通りだけ見ると静かに取りこぼす——
//    実測（部品6 C6-02）: (i) だけだと 12 件しか出ず、`Button` も `Box` も落ちる。
const componentPaths = [];
for (const dir of COMPONENT_DIRS) {
  componentPaths.push(
    ...(await walk(dir, '.tsx')),
    ...(await walk(dir, '.ts')),
  );
}

/** (ii) の下ごしらえ: `export type X = keyof typeof CONST` の X を集める。 */
const keyofAliases = new Set();
/**
 * ★★★ 🆕 **(iv) 4 経路目**（工程5 D11=A）: `export type X = (typeof CONST)[number]`
 * ＝ **`as const` 配列から導いた union**。
 *
 * 🟥 **部品6 は「語彙の書かれ方は 3 通り」と結論したが、4 通り目があった。**
 *    落ちていたのは新設の `PivotTable.intensity` だけではない——
 *    **`PERIOD_PRESETS`（工程3）と `DATE_PICKER_MODES`（部品3）も同じ書き方**で、
 *    **ずっと母数の外に居た。**（`PeriodSelect` が母数に居るのは別 prop `width` のおかげ。）
 * ★ **母数は目より機械が正しい、が正しくない場合がある**——**機械も 1 経路落とす。**
 */
const constUnionAliases = new Set();
/**
 * ★★★ 🆕 **(v) 5 経路目**（工程5 D11=A）: `export type X = 'a' | 'b'` に**名前を付けた**もの。
 *
 * 🟥 経路 (i) は **prop の宣言に union が直書きされている場合しか見ていない**ので、
 *    **`DataGridColumnKind`（手8d）や `StatusTone`（工程2）は 1 度も母数に入っていなかった。**
 * ★ **4 通り目を見つけたら 5 通り目も出た**——「何通りあるか」を数え切った証拠は無い。
 */
const literalAliases = new Set();
for (const path of componentPaths) {
  const src = stripComments(await readFile(path, 'utf8'));
  for (const m of src.matchAll(/type\s+(\w+)\s*=\s*keyof\s+typeof\s+\w+/g))
    keyofAliases.add(m[1]);
  for (const m of src.matchAll(
    /type\s+(\w+)\s*=\s*\(\s*typeof\s+\w+\s*\)\s*\[\s*number\s*\]/g,
  ))
    constUnionAliases.add(m[1]);
  for (const m of src.matchAll(
    /type\s+(\w+)\s*=\s*["'][A-Za-z0-9-]+["'](?:\s*\|\s*["'][A-Za-z0-9-]+["'])+/g,
  ))
    literalAliases.add(m[1]);
}

const ROUTES = {
  literal:
    /(\w+)\??:\s*(?:["'][A-Za-z0-9-]+["'](?:\s*\|\s*["'][A-Za-z0-9-]+["'])+)/g,
  // 🟨 単語境界の `\b` を頭に置くと、cspell が直後の識別子と繋げて未知語として拾う（実測で赤くなった）。
  //    ★ **辞書に語を足して黙らせない**——足すこと自体が「保留」の記録になる（部品6 Q3）。
  //    → 後読みで書く。**綴りの側を直すのではなく、綴りを作らない形にする。**
  cva: /(?<!\w)cva\(/,
};

const vocabByKey = new Map(); // key -> { routes:Set, props:Set, files:Set }
for (const path of componentPaths.sort()) {
  const src = stripComments(await readFile(path, 'utf8'));
  const key = norm(basename(path, extname(path)));
  const found = { routes: new Set(), props: new Set() };

  for (const m of src.matchAll(ROUTES.literal)) {
    found.routes.add('literal');
    found.props.add(m[1]);
  }
  if (keyofAliases.size > 0) {
    const alias = new RegExp(
      String.raw`(\w+)\??:\s*(${[...keyofAliases].join('|')})\b`,
      'g',
    );
    for (const m of src.matchAll(alias)) {
      found.routes.add('keyof');
      found.props.add(m[1]);
    }
  }
  if (constUnionAliases.size > 0) {
    const alias = new RegExp(
      String.raw`(\w+)\??:\s*(${[...constUnionAliases].join('|')})\b`,
      'g',
    );
    for (const m of src.matchAll(alias)) {
      found.routes.add('constUnion');
      found.props.add(m[1]);
    }
  }
  if (literalAliases.size > 0) {
    const alias = new RegExp(
      String.raw`(\w+)\??:\s*(${[...literalAliases].join('|')})\b`,
      'g',
    );
    for (const m of src.matchAll(alias)) {
      found.routes.add('literalAlias');
      found.props.add(m[1]);
    }
  }
  if (ROUTES.cva.test(src) && /VariantProps/.test(src)) {
    found.routes.add('cva');
    for (const m of src.matchAll(/variants:\s*\{([\s\S]*?)\n\s{4}\}/g))
      for (const v of (m[1] ?? '').matchAll(/^\s{6}(\w+):/gm))
        found.props.add(v[1]);
  }

  if (found.routes.size === 0) continue;
  const entry = vocabByKey.get(key) ?? {
    routes: new Set(),
    props: new Set(),
    files: new Set(),
  };
  for (const r of found.routes) entry.routes.add(r);
  for (const p of found.props) entry.props.add(p);
  entry.files.add(path);
  vocabByKey.set(key, entry);
}

// ── ③ 面ごとの被覆 ────────────────────────────────────────────
const shipped = stories.filter((s) => s.shipped);
/** @param {StoryRow[]} rows */
const withPlay = (rows) => rows.filter((r) => r.hasPlay);
/**
 * 🟥 **主張は `await expect(` だけではない。**`expectOpened` / `expectFocusTrapped` は
 * それ自身が `expect` を内蔵しており、story 側には `await expectOpened('…')` としか書かれない。
 * ★ **`await expect(` だけで数えると 7 story を「主張 0 本」に落とす**（実測で踏んだ）。
 * @param {StoryRow} r
 */
const claimCount = (r) => r.expects + r.opened + r.trapped;
/** @param {StoryRow[]} rows */
const withClaim = (rows) => rows.filter((r) => claimCount(r) > 0);

/** 語彙 prop を持つ部品のうち、story を持つもの／面④ の主張を持つもの。 */
const vocabParts = [...vocabByKey.entries()].map(([key, v]) => {
  const story = byFile.get(key);
  return {
    key,
    props: [...v.props].sort(),
    routes: [...v.routes].sort(),
    files: [...v.files],
    hasStory: story !== undefined,
    title: story?.title ?? null,
    covered: story?.rows.some((r) => r.vocab) ?? false,
  };
});

const report = {
  storyFiles: storyPaths.length,
  stories: stories.length,
  shelves: Object.fromEntries(
    [...new Set(stories.map((s) => s.shelf))].map((shelf) => [
      shelf,
      stories.filter((s) => s.shelf === shelf).length,
    ]),
  ),
  faces: {
    // ① と ② は preview.tsx が全 story に自動で掛ける（掛かった＝ 対象）
    '① 描画された': {
      対象: stories.length,
      掛かった: stories.length,
      注: '🟥 どの部品が描かれたかは見ていない（OBS-0021）。別の部品でも満たせる',
    },
    '② a11y': {
      対象: stories.length,
      掛かった: stories.length,
      注: '🟥 color-contrast / region は rule 単位で無効（serious は落ちない）',
    },
    '③ 状態面': {
      対象: null,
      掛かった: 0,
      注: '🟥 実装が無い（台帳に手で載せている）',
    },
    '④ 語彙の効果': {
      対象: vocabParts.length,
      掛かった: vocabParts.filter((p) => p.covered).length,
      注: '対象は「語彙 prop を持つ部品」を 5 経路で機械が引いた数（工程5 D11=A で 3 → 5）',
    },
  },
  claims: {
    総数: stories.reduce((a, s) => a + s.expects, 0),
    'play を持つ story': withPlay(stories).length,
    '主張を持つ story': withClaim(stories).length,
    '主張 0 本の story': stories.length - withClaim(stories).length,
    expectOpened: stories.reduce((a, s) => a + s.opened, 0),
    expectFocusTrapped: stories.reduce((a, s) => a + s.trapped, 0),
  },
  出荷物の棚: {
    story: shipped.length,
    play: withPlay(shipped).length,
    主張を持つ: withClaim(shipped).length,
    '主張 0 本': shipped.length - withClaim(shipped).length,
  },
  vocabParts,
  '主張 0 本の部品': [...byFile.entries()]
    .filter(([, f]) => f.rows.every((r) => claimCount(r) === 0))
    .map(([, f]) => ({
      title: f.title,
      story: f.rows.length,
      shipped: f.shipped,
    })),
};

await mkdir(OUT, { recursive: true });
await writeFile(
  `${OUT}/coverage.json`,
  JSON.stringify({ report, stories }, null, 2),
);

// ── ④ 出力 ────────────────────────────────────────────────────
/**
 * @param {number} a
 * @param {number} b
 */
const pct = (a, b) => (b === 0 ? '—' : `${String(Math.round((a / b) * 100))}%`);

console.log(
  `story ${String(report.stories)} 題 / ${String(report.storyFiles)} ファイル`,
);
console.log(
  `  棚: ${Object.entries(report.shelves)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k} ${String(v)}`)
    .join(' / ')}`,
);

console.log('\n[面ごとの被覆]');
for (const [face, f] of Object.entries(report.faces)) {
  const 対象 = f.対象 === null ? '?' : String(f.対象);
  console.log(
    `  ${face.padEnd(14)} ${String(f.掛かった).padStart(3)} / ${対象.padStart(3)}  ${
      f.対象 === null ? '' : pct(f.掛かった, f.対象)
    }`,
  );
  console.log(`  ${' '.repeat(14)} ${f.注}`);
}

console.log('\n[主張の量]');
const c = report.claims;
console.log(
  `  await expect 総数 ${String(c.総数)} 本 / expectOpened ${String(c.expectOpened)} / expectFocusTrapped ${String(c.expectFocusTrapped)}`,
);
console.log(
  `  play を持つ story   ${String(c['play を持つ story']).padStart(3)} / ${String(report.stories)}  ${pct(c['play を持つ story'], report.stories)}`,
);
console.log(
  `  主張を持つ story    ${String(c['主張を持つ story']).padStart(3)} / ${String(report.stories)}  ${pct(c['主張を持つ story'], report.stories)}`,
);
console.log(
  `  🟥 主張 0 本の story ${String(c['主張 0 本の story']).padStart(3)} / ${String(report.stories)}  ${pct(c['主張 0 本の story'], report.stories)}`,
);
const s = report.出荷物の棚;
console.log(
  `  出荷物の棚: story ${String(s.story)} / 主張を持つ ${String(s.主張を持つ)} / 🟥 主張 0 本 ${String(s['主張 0 本'])}  ${pct(s['主張 0 本'], s.story)}`,
);

console.log(
  `\n[面④ の対象＝ 語彙 prop を持つ部品] ${String(vocabParts.length)} 件（経路: ${[
    'literal',
    'literalAlias',
    'keyof',
    'constUnion',
    'cva',
  ]
    .map(
      (r) =>
        `${r} ${String(vocabParts.filter((p) => p.routes.includes(r)).length)}`,
    )
    .join(' / ')}）`,
);
for (const p of vocabParts.sort((a, b) => a.key.localeCompare(b.key))) {
  const mark = p.covered ? '🟦' : p.hasStory ? '🟥' : '🟨';
  console.log(
    `  ${mark} ${p.key.padEnd(18)} ${p.props.join(',').padEnd(28)} ${
      p.hasStory
        ? p.covered
          ? '面④ あり'
          : '🟥 面④ の主張が無い'
        : '🟨 story が無い'
    }`,
  );
}

console.log(
  `\n[🟥 1 本も主張を持たない部品] ${String(report['主張 0 本の部品'].length)} / ${String(report.storyFiles)} ファイル`,
);
for (const p of report['主張 0 本の部品'])
  console.log(
    `  ${p.shipped ? '🟥' : '⬜'} ${p.title}（story ${String(p.story)} 本）${p.shipped ? '' : ' ※ 出荷しない棚'}`,
  );

// ── ⑤ 自己検査 ────────────────────────────────────────────────
// 🟥 **0 件を静かに返す計測器を作らない。**走査が壊れたら落ちる（`a11y-scan` と同じ形）。
const broken = [];
if (report.storyFiles === 0) broken.push('story ファイルが 1 件も見つからない');
if (report.stories === 0) broken.push('story が 1 件も見つからない');
if (vocabParts.length === 0)
  broken.push('語彙 prop を持つ部品が 1 件も引けない');
for (const route of ['literal', 'literalAlias', 'keyof', 'constUnion', 'cva'])
  if (!vocabParts.some((p) => p.routes.includes(route)))
    broken.push(`語彙の経路 ${route} が 0 件（抽出が壊れている合図）`);
if (c.総数 === 0) broken.push('await expect が repo 全体で 0 本');

if (broken.length > 0) {
  console.error('\n🟥 走査が壊れている（被覆の数字は読めない）');
  for (const b of broken) console.error(`  ${b}`);
  process.exit(1);
}
