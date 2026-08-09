// tools/a11y-scan.mjs — 完成バー 面② の台帳を作る計測器（部品3 C3-09 で常設化）。
//
// 🟥 **ゲートではない。**落とすのは `.storybook/preview.tsx` の `a11y.test: 'error'` 側で、
//    ここは**台帳（[部品の完成バー_台帳.md](../docs/部品の完成バー_台帳.md) §5）に載せる数**を作る。
//
// ★★ 🟥 **件数ではなく「色の組の種類」で畳む**（台帳 §5 の教訓）——
//    serious は **story を増やすだけで増える**（83 → 113 の +30 は全部、既知の色の組を
//    描く story が増えたぶんだった）。**意味があるのは組の種類。**
//
// 🟥 **`document` を走査する**（`#storybook-root` ではない）——portal に出る部品
//    （`Dialog` / `Popover` / `Tooltip`）が丸ごと観測から消える（完成バー §0 罠 3）。
//
// 🆕 ★★★ 🟥 **2026-08-09（部品4 D8=B）: `incomplete`（axe が判定を保留したもの）も数える。**
//    **旧: `resultTypes: ['violations']`** ——**「機械が分からないと答えたもの」を明示的に捨てていた。**
//    落とす側（`preview.tsx` の `a11y.test: 'error'`）も violations しか見ないので、
//    🟥 **保留は repo のどこにも 1 件も記録されていなかった。**
//    実測（部品4 C4-03）: `Sheet/Open` は **violations 0 / incomplete `aria-hidden-focus` 3 件**——
//    **「通った」と読んでいたものが、実は「分からない」だった。**
//    ★ **「対象 0 件で緑」とは別の型**——**対象は在るのに、判定が保留のまま緑になる。**
//    🟨 **落とさない**（数える場所を先に作る。落とすかは数を見てから決める）。
//
// 使い方: pnpm build-storybook && node tools/a11y-scan.mjs
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';

const ROOT = 'storybook-static';
const OUT = 'tmp/a11y';
const PORT = 61009;

/** 出荷しない棚（[部品1 D4=B]）。母数は「出荷物の棚」だけ。 */
const EXCLUDED = ['★ Review', '⑤ 題材', '① Tokens'];

/** harness 由来（storybook の iframe に <main> も <h1> も無い）。部品の欠陥ではない。 */
const HARNESS_RULES = new Set([
  'region',
  'landmark-one-main',
  'page-has-heading-one',
  // 🆕 部品4 D8=B の初回計測で incomplete に **102 件 / 44 story** 出た。
  //    「繰り返しブロックを飛ばす手段」はページの規定で、**iframe 1 枚に story を 1 つ描く
  //    harness には成立しない**（`region` / `landmark-one-main` と同じ理由）。
  //    🟥 **消したのではなく分類した**——数は本コメントに残す。
  'bypass',
]);

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function serve() {
  return new Promise((resolve) => {
    const s = createServer(async (req, res) => {
      const path = decodeURIComponent((req.url ?? '/').split('?')[0]);
      const file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ''));
      try {
        const body = await readFile(file);
        res.writeHead(200, {
          'content-type': MIME[extname(file)] ?? 'application/octet-stream',
        });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end('not found');
      }
    });
    s.listen(PORT, () => {
      resolve(s);
    });
  });
}

const index = JSON.parse(await readFile(`${ROOT}/index.json`, 'utf8'));
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
// 🟨 pnpm なので axe-core は hoist されない（`node_modules/axe-core` は無い）。
//    `@storybook/addon-a11y` の依存として `.pnpm` に居るものを解決して読む。
const axeSource = await readFile(
  createRequire(
    createRequire(import.meta.url).resolve('@storybook/addon-a11y'),
  ).resolve('axe-core/axe.min.js'),
  'utf8',
);

const server = await serve();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });

const shelf = { shipped: [], excluded: [] };
/** 🆕 D8=B: 判定の保留（axe の incomplete）。**落とさないが、必ず数える。** */
const pending = { shipped: [], excluded: [] };
for (const story of stories) {
  const isExcluded = EXCLUDED.some((prefix) => story.title.startsWith(prefix));
  const key = isExcluded ? 'excluded' : 'shipped';
  await page.goto(
    `http://localhost:${String(PORT)}/iframe.html?id=${story.id}&viewMode=story`,
    { waitUntil: 'networkidle' },
  );
  await page.waitForTimeout(120);
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () => {
    // @ts-expect-error axe は addScriptTag で注入している
    // 🆕 resultTypes を外した（部品4 D8=B）——**incomplete を捨てない。**
    return await axe.run(document);
  });
  for (const v of result.violations) {
    if (HARNESS_RULES.has(v.id)) continue;
    for (const node of v.nodes) {
      const color =
        /Expected contrast ratio|foreground color: (#[0-9a-f]{6})/.exec(
          node.any.map((c) => c.message).join(' '),
        );
      const data = node.any.find((c) => c.data?.fgColor !== undefined)?.data;
      shelf[key].push({
        story: story.title,
        rule: v.id,
        impact: v.impact,
        pair:
          data === undefined
            ? null
            : `${String(data.fgColor)} on ${String(data.bgColor)}`,
        _matched: color === null ? undefined : color[1],
      });
    }
  }
  for (const v of result.incomplete) {
    if (HARNESS_RULES.has(v.id)) continue;
    for (const node of v.nodes) {
      pending[key].push({
        story: story.title,
        rule: v.id,
        impact: v.impact,
        target: node.target.join(' '),
      });
    }
  }
}

await browser.close();
server.close();

const summarize = (rows) => {
  const byImpact = {};
  const pairs = new Map();
  for (const r of rows) {
    byImpact[r.impact] = (byImpact[r.impact] ?? 0) + 1;
    if (r.pair !== null) pairs.set(r.pair, (pairs.get(r.pair) ?? 0) + 1);
  }
  return {
    total: rows.length,
    byImpact,
    pairKinds: pairs.size,
    pairs: [...pairs.entries()].sort((a, b) => b[1] - a[1]),
    rules: [...new Set(rows.map((r) => r.rule))].sort(),
  };
};

/** 🆕 保留は「どの rule が、どの story で」だけを畳む（色の組は関係しない）。 */
const summarizePending = (rows) => {
  const byRule = new Map();
  for (const r of rows) {
    const entry = byRule.get(r.rule) ?? { count: 0, stories: new Set() };
    entry.count += 1;
    entry.stories.add(r.story);
    byRule.set(r.rule, entry);
  }
  return {
    total: rows.length,
    byRule: [...byRule.entries()]
      .map(([rule, e]) => ({ rule, count: e.count, stories: [...e.stories] }))
      .sort((a, b) => b.count - a.count),
  };
};

const report = {
  storyCount: stories.length,
  shipped: summarize(shelf.shipped),
  excluded: summarize(shelf.excluded),
  pendingShipped: summarizePending(pending.shipped),
  pendingExcluded: summarizePending(pending.excluded),
};

await mkdir(OUT, { recursive: true });
await writeFile(
  `${OUT}/a11y.json`,
  JSON.stringify({ report, shelf, pending }, null, 2),
);

console.log(`story ${String(stories.length)} 題`);
for (const key of ['shipped', 'excluded']) {
  const s = report[key];
  console.log(
    `\n[${key === 'shipped' ? '出荷物の棚' : '除外棚'}] 件数 ${String(s.total)} / impact ${JSON.stringify(s.byImpact)} / 色の組 ${String(s.pairKinds)} 種類`,
  );
  console.log(`  rules: ${s.rules.join(', ') || '（無し）'}`);
  for (const [pair, count] of s.pairs)
    console.log(`  ${String(count)}  ${pair}`);
}

// 🆕 D8=B — 判定の保留。**「緑」の中に混ざっていたもの。**
for (const key of ['pendingShipped', 'pendingExcluded']) {
  const p = report[key];
  console.log(
    `\n[判定の保留・${key === 'pendingShipped' ? '出荷物の棚' : '除外棚'}] ${String(p.total)} 件`,
  );
  for (const r of p.byRule)
    console.log(
      `  ${String(r.count)}  ${r.rule} / ${r.stories.length > 3 ? `${String(r.stories.length)} story` : r.stories.join(', ')}`,
    );
}
