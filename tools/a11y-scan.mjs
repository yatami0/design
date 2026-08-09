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
// 🆕 ★★★ 🟥 **2026-08-09（部品5 D2=C / D3=B / D4=B）: 数える場所に「種類」と「理由」を足した。**
//    **部品4 は数える場所を作ったが、種類を持たなかった**——**23 という数字は、増えても減っても
//    何が起きたか読めない。**🟥 **`violations` 側は最初からこれを解いている**
//    （`HARNESS_RULES` で harness 由来を畳み、`pairs` で色の組に畳む）。
//
//    実測（部品5 §1.1）で保留 23 件は **3 種類**に割れた:
//      (a) **既知の色の組と同じもの**（9 件）——axe は「文字が短くて本文か判定できない」と保留するが、
//          **色は測れている**（`fgColor` / `bgColor` / `contrastRatio` を持っている）。
//          🟥 **実測すると本当に AA 未達**（`#8a8a8e on #ffffff` 3.43 ／ `#85858b on #f2f2f7` 3.28）
//          ＝ **同じ欠陥が、文字数だけで violations と incomplete に振り分けられている。**
//      (b) **重なりで測れないもの**（1 件）——`bgOverlap`。**判断はまだ無い**（OBS 行き）。
//      (c) **検査器が無条件に保留するもの**（13 件）——`TOOL_LIMIT` を見よ。
//
//    🟥 **理由（`messageKey`）を保存する。**旧版は `rule` / `impact` / `target` しか持たず、
//    **12 件を割るのに probe を書き直す必要があった**（＝ 次も同じ作業を繰り返す形）。
//
// 🟥 **本ファイルはゲート 7 本には入っていない**が、**未分類が出たら exit 1 で落ちる。**
//    「知っているものを畳み、知らないものは落とす」——`HARNESS_RULES` の形をそのまま裏返した。
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

/**
 * 🆕 **(c) 検査器が無条件に保留するもの**（部品5 D3=B）。
 *
 * 🟥 **`HARNESS_RULES` に混ぜない。**あちらは「storybook の iframe が原因」という意味で、
 *    **harness を替えれば消える**もの。こちらは **本番の DOM でも同じことが起きる。**
 *    混ぜると、次に harness を替えたときに何を再検討すべきかが分からなくなる。
 *
 * 🟥 **`引き換え` を書けないものはここに入れない。**畳むだけなら、それは無効化ではなく削除
 *    （部品1 D3 が `color-contrast` でやったのは「数える場所を移す」であって「消す」ではない）。
 */
const TOOL_LIMIT = {
  'aria-hidden-focus': {
    根拠: 'axe-core@4.12.1 の isModalOpen() は dialog, [role=dialog], [aria-modal=true] しか見ない（ソース実測）。role="menu" / role="listbox" の modal overlay は原理的に判定できない',
    引き換え:
      'src/stories/opened.ts の expectFocusTrapped（userEvent.tab() ×3 で外へ出ないことを直接測る）',
    出典: '部品4 D7=C',
  },
  'aria-valid-attr-value': {
    根拠: 'axe-core@4.12.1 の ariaValidAttrValueEvaluate は、preChecks["aria-controls"] で aria-haspopup が false/null 以外なら **参照先 ID の実在を確かめずに** needsReview を立てる（ソース実測）',
    引き換え:
      'src/stories/opened.ts の expectOpened（開いた story で aria-controls の参照先が実在することを毎回測る）',
    出典: '部品5 D3=B・D10=A',
  },
};

/**
 * 🆕 **保留 1 件を種類に割る**（部品5 D2=C）。
 * 戻り値の `kind` が `unclassified` なら**落とす**——「知らないもの」を黙って通さない。
 */
const classify = (row) => {
  if (TOOL_LIMIT[row.rule] !== undefined) return 'tool-limit';
  if (row.rule === 'color-contrast' && row.messageKey === 'shortTextContent')
    return 'short-text'; // (a) 色は測れている → 既知の色の組と突き合わせる（D4=B）
  if (row.rule === 'color-contrast' && row.messageKey === 'bgOverlap')
    return 'bg-overlap'; // (b) 重なりで測れない → 判断は OBS が持つ
  return 'unclassified';
};

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
      // 🆕 部品5 D2=C — **理由を捨てない。**axe は保留の理由を `messageKey` で、
      //    色は `fgColor` / `bgColor` / `contrastRatio` で**既に持っている**。
      const check = node.any.find((c) => c.data?.messageKey !== undefined);
      const data = check === undefined ? undefined : check.data;
      const row = {
        story: story.title,
        rule: v.id,
        impact: v.impact,
        target: node.target.join(' '),
        messageKey: data === undefined ? null : data.messageKey,
        message: node.any.map((c) => c.message).join(' / '),
        pair:
          data === undefined || data.fgColor === undefined
            ? null
            : `${String(data.fgColor)} on ${String(data.bgColor)}`,
        contrastRatio:
          data === undefined || data.contrastRatio === undefined
            ? null
            : data.contrastRatio,
      };
      row.kind = classify(row);
      pending[key].push(row);
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

/**
 * 🆕 保留を **種類（`kind`）→ rule** の 2 段で畳む（部品5 D2=C）。
 *
 * 🟥 **`knownPairs` と突き合わせる**（D4=B）——`short-text` の保留は**色が測れている**ので、
 *    **既に violations 側に出ている色の組かどうか**を機械が言える。
 *    ★ これが言えないと、保留が増えたとき [OBS-0017] の話なのか新しい欠陥なのかが読めない。
 */
const summarizePending = (rows, knownPairs) => {
  const byRule = new Map();
  const byKind = new Map();
  const newPairs = new Map();
  for (const r of rows) {
    const entry = byRule.get(r.rule) ?? { count: 0, stories: new Set() };
    entry.count += 1;
    entry.stories.add(r.story);
    byRule.set(r.rule, entry);
    byKind.set(r.kind, (byKind.get(r.kind) ?? 0) + 1);
    if (r.kind === 'short-text' && r.pair !== null && !knownPairs.has(r.pair))
      newPairs.set(r.pair, (newPairs.get(r.pair) ?? 0) + 1);
  }
  return {
    total: rows.length,
    byKind: [...byKind.entries()].sort((a, b) => b[1] - a[1]),
    byRule: [...byRule.entries()]
      .map(([rule, e]) => ({ rule, count: e.count, stories: [...e.stories] }))
      .sort((a, b) => b.count - a.count),
    knownPairCount: rows.filter(
      (r) => r.kind === 'short-text' && knownPairs.has(r.pair),
    ).length,
    newPairs: [...newPairs.entries()],
    unclassified: rows.filter((r) => r.kind === 'unclassified'),
  };
};

const shippedSummary = summarize(shelf.shipped);
const excludedSummary = summarize(shelf.excluded);
/** 🆕 D4=B — 既知の色の組（violations 側に出ているもの）。保留の突き合わせ先。 */
const knownPairs = new Set([
  ...shippedSummary.pairs.map(([pair]) => pair),
  ...excludedSummary.pairs.map(([pair]) => pair),
]);

const report = {
  storyCount: stories.length,
  shipped: shippedSummary,
  excluded: excludedSummary,
  pendingShipped: summarizePending(pending.shipped, knownPairs),
  pendingExcluded: summarizePending(pending.excluded, knownPairs),
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
// 🆕 部品5 D2=C — **種類つきで出す。**数だけでは、増えても減っても何が起きたか読めない。
const KIND_LABEL = {
  'tool-limit': '(c) 検査器が無条件に保留（引き換えを我々が測っている）',
  'short-text': '(a) 文字が短くて本文か判定できない（色は測れている）',
  'bg-overlap': '(b) 重なっていて背景色を決められない',
  unclassified: '🟥 未分類',
};
for (const key of ['pendingShipped', 'pendingExcluded']) {
  const p = report[key];
  console.log(
    `\n[判定の保留・${key === 'pendingShipped' ? '出荷物の棚' : '除外棚'}] ${String(p.total)} 件`,
  );
  for (const [kind, count] of p.byKind)
    console.log(`  ${String(count)}  ${KIND_LABEL[kind] ?? kind}`);
  for (const r of p.byRule)
    console.log(
      `    ${String(r.count)}  ${r.rule} / ${r.stories.length > 3 ? `${String(r.stories.length)} story` : r.stories.join(', ')}`,
    );
  if (p.byKind.some(([kind]) => kind === 'short-text'))
    console.log(
      `  → 色の組: 既知 ${String(p.knownPairCount)} 件 / 新しい組 ${String(p.newPairs.length)} 種類${p.newPairs.map(([pair, n]) => `（${pair} ×${String(n)}）`).join('')}`,
    );
}

// 🟥 **知らないものは黙って通さない**（部品5 D2=C の赤テストは K2）。
const unresolved = [
  ...report.pendingShipped.unclassified,
  ...report.pendingExcluded.unclassified,
];
const newPairs = [
  ...report.pendingShipped.newPairs,
  ...report.pendingExcluded.newPairs,
];
if (unresolved.length > 0 || newPairs.length > 0) {
  console.error(
    '\n🟥 保留に分類できないものがある（数える場所は、読めないと意味が無い）',
  );
  for (const r of unresolved)
    console.error(
      `  未分類  ${r.rule} / ${String(r.messageKey)} / ${r.story} / ${r.target}\n          ${r.message}`,
    );
  for (const [pair, n] of newPairs)
    console.error(
      `  新しい色の組  ${pair} ×${String(n)}（violations 側に出ていない＝ OBS-0017 の一覧に無い）`,
    );
  console.error(
    '\n  ★ 塞ぎ方は 2 つ: ① TOOL_LIMIT に「根拠」と「引き換え」を書いて畳む（引き換えが書けないなら畳まない）\n' +
      '                  ② classify() に種類を足す（＝ 何を見て種類を決めたかをコードに残す）',
  );
  process.exit(1);
}
