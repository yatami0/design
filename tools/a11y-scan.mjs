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
for (const story of stories) {
  const isExcluded = EXCLUDED.some((prefix) => story.title.startsWith(prefix));
  await page.goto(
    `http://localhost:${String(PORT)}/iframe.html?id=${story.id}&viewMode=story`,
    { waitUntil: 'networkidle' },
  );
  await page.waitForTimeout(120);
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () => {
    // @ts-expect-error axe は addScriptTag で注入している
    return await axe.run(document, { resultTypes: ['violations'] });
  });
  for (const v of result.violations) {
    if (HARNESS_RULES.has(v.id)) continue;
    for (const node of v.nodes) {
      const color =
        /Expected contrast ratio|foreground color: (#[0-9a-f]{6})/.exec(
          node.any.map((c) => c.message).join(' '),
        );
      const data = node.any.find((c) => c.data?.fgColor !== undefined)?.data;
      shelf[isExcluded ? 'excluded' : 'shipped'].push({
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

const report = {
  storyCount: stories.length,
  shipped: summarize(shelf.shipped),
  excluded: summarize(shelf.excluded),
};

await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/a11y.json`, JSON.stringify({ report, shelf }, null, 2));

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
