// tools/pivot-probe.mjs — 工程5 K1・K2・K6 の証拠取り。
//
// 🟥 **これはゲートではない。**「表に数字が出た」ではなく
//    「**総和が API と合っているか・何が飛んだか・最後の列に行けるか**」を数えるための道具。
//    `storybook build` は story が実行時に落ちても exit 0（DR-0048）。
//
// 測るもの:
//   K1 セルの合計 = `GET /time_entries.json` が返した `hours` の総和（**独立に数え直す**）
//   K2 期間を動かすと **`from` / `to`** が載った URL が飛ぶ（🟥 `updated_on` が載ったら Q3 が破れている）
//   K6 92 列で **最後の列に到達できるか / 行ヘッダ（人名）を見失わないか**
//
// 使い方: pnpm build-storybook && node tools/pivot-probe.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const ROOT = 'storybook-static';
const PORT = 61009;
const STORY_WEEK = '⑤-題材（redmine）-稼働表--this-week';
const STORY_QUARTER = '⑤-題材（redmine）-稼働表--quarter-ninety-columns';

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

/** MSW は Service Worker なのでネットワーク層には出ない。console の証拠出力を数える。 */
function attach(page) {
  const gets = [];
  const errors = [];
  page.on('console', (msg) => {
    const text = msg.text();
    const get = /^\[msw\] GET (\/\S+)$/.exec(text);
    if (get) gets.push(get[1]);
    if (msg.type() === 'error') errors.push(text);
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return { gets, errors };
}

async function openStory(page, id) {
  await page.goto(`http://127.0.0.1:${String(PORT)}/iframe.html?id=${id}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForSelector('[data-testid="workload-audit"]', {
    timeout: 20000,
  });
  await page.waitForTimeout(400);
}

/** 画面が出す監査行を読む。 */
async function readAudit(page) {
  const text = await page.textContent('[data-testid="workload-audit"]');
  const m =
    /件数 (\d+) \/ 申告 (\d+) ・ ページ (\d+) ・ 合計 ([\d.]+) h ・ 列 (\d+) ・ 行 (\d+)/.exec(
      text ?? '',
    );
  if (m === null) throw new Error(`監査行が読めない: ${String(text)}`);
  return {
    fetched: Number(m[1]),
    declared: Number(m[2]),
    pages: Number(m[3]),
    total: Number(m[4]),
    columns: Number(m[5]),
    rows: Number(m[6]),
  };
}

/**
 * ★ **独立に数え直す。**画面と同じ範囲を、画面を通さずに取って `hours` を足す。
 * 🟥 MSW はページの中に居るので `page.evaluate` から呼ぶ（probe から直接は届かない）。
 */
async function sumFromApi(page, from, to) {
  return page.evaluate(
    async ([f, t]) => {
      let offset = 0;
      let total = 0;
      let count = 0;
      let declared = 0;
      for (;;) {
        const res = await fetch(
          `/redmine/time_entries.json?from=${f}&to=${t}&offset=${String(offset)}&limit=100`,
          { headers: { Accept: 'application/json' } },
        );
        const json = await res.json();
        declared = json.total_count;
        for (const entry of json.time_entries) total += entry.hours;
        count += json.time_entries.length;
        offset += json.limit;
        if (count >= declared || json.time_entries.length === 0) break;
      }
      return { total: Math.round(total * 100) / 100, count, declared };
    },
    [from, to],
  );
}

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? '🟦 PASS' : '🟥 FAIL'}  ${name}\n         ${detail}`);
}

const server = await serve();
const browser = await chromium.launch();

try {
  // ── K1 ＋ K2（今週）─────────────────────────────────────────────
  {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    const log = attach(page);
    await openStory(page, STORY_WEEK);
    const audit = await readAudit(page);

    record(
      'K1-a 取りこぼしが無い（取得件数 = API の申告件数）',
      audit.fetched === audit.declared,
      `取得 ${String(audit.fetched)} / 申告 ${String(audit.declared)} ・ ページ ${String(audit.pages)}`,
    );

    const api = await sumFromApi(page, '2026-08-03', '2026-08-09');
    record(
      'K1-b 画面の合計 = API の hours の総和（独立に数え直した）',
      Math.abs(api.total - audit.total) < 0.001,
      `画面 ${String(audit.total)} h / API ${String(api.total)} h（API 件数 ${String(api.count)}）`,
    );

    record(
      'K2-a 飛んだ URL に from / to が載っている',
      log.gets.some(
        (u) =>
          u.startsWith('/time_entries.json') &&
          u.includes('from=') &&
          u.includes('to='),
      ),
      log.gets.filter((u) => u.startsWith('/time_entries.json')).join(' | ') ||
        '（1 本も飛んでいない）',
    );
    record(
      'K2-b 🟥 updated_on が載っていない（一覧の変換を流用していない）',
      !log.gets.some(
        (u) => u.startsWith('/time_entries.json') && u.includes('updated_on'),
      ),
      `time_entries への要求 ${String(log.gets.filter((u) => u.startsWith('/time_entries.json')).length)} 本`,
    );

    // 期間を動かす → URL と列数が変わる
    const before = log.gets.length;
    await page.getByRole('combobox', { name: '期間' }).click();
    await page.getByRole('option', { name: '今月' }).click();
    await page.waitForTimeout(1200);
    const after = await readAudit(page);
    const moved = log.gets
      .slice(before)
      .filter((u) => u.startsWith('/time_entries.json'));
    record(
      'K2-c 期間を動かすと新しい from / to が飛び、列数が変わる',
      moved.length > 0 && after.columns !== audit.columns,
      `新しい要求 ${moved.join(' | ') || '—'} ／ 列 ${String(audit.columns)} → ${String(after.columns)}`,
    );
    record(
      'K1-c console error が 0 件',
      log.errors.length === 0,
      log.errors.join(' / ') || '0 件',
    );
    await page.close();
  }

  // ── K6（92 列）──────────────────────────────────────────────────
  {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    const log = attach(page);
    await openStory(page, STORY_QUARTER);
    const audit = await readAudit(page);

    record(
      'K6-a 92 列ぶんの列が出ている（範囲から引いている）',
      audit.columns === 92,
      `列 ${String(audit.columns)} ・ 行 ${String(audit.rows)} ・ 取得 ${String(audit.fetched)}/${String(audit.declared)} ・ ページ ${String(audit.pages)}`,
    );

    const api = await sumFromApi(page, '2026-07-01', '2026-09-30');
    record(
      'K6-b 92 列でも合計が API と一致（ページングを跨いでも）',
      Math.abs(api.total - audit.total) < 0.001,
      `画面 ${String(audit.total)} h / API ${String(api.total)} h（API 件数 ${String(api.count)} / 申告 ${String(api.declared)}）`,
    );

    const geometry = await page.evaluate(() => {
      const box = document.querySelector('[data-slot="table-container"]');
      // 🟨 `instanceof` で絞る（`querySelector` の戻りは `Element` で `tabIndex` を持たない）
      if (!(box instanceof HTMLElement)) return null;
      // 🟥 **必ず器の中だけを見る。**素の `document.querySelector('thead …')` は
      //    **Storybook 自身が出す引数の表**（`sb-` から始まるクラスの table）を先に拾う——
      //    初版はそれで「最終列 = Control」「1 列目 = propertyName」を測っていた
      //    （**測る側が壊れる**の 3 度目・DR-0103）。
      const grid = box.querySelector('[data-slot="table"]');
      if (grid === null) return null;
      const before = {
        scrollWidth: box.scrollWidth,
        clientWidth: box.clientWidth,
        overflow: box.scrollWidth - box.clientWidth,
        headCells: grid.querySelector('thead tr')?.children.length ?? 0,
      };
      box.scrollLeft = box.scrollWidth;
      const boxRect = box.getBoundingClientRect();
      // 行ヘッダ（人名 = 各行の 1 列目）が、右端までスクロールした状態で見えているか
      // 🟨 行ヘッダは `DataGrid` 版では `<td>`、`PivotTable` 版では `<th scope="row">`。
      //    **どちらでも 1 列目を指す**書き方にする（部品を替えても同じものを測る）。
      const firstCell = grid.querySelector('tbody tr > *:first-child');
      const cellRect = firstCell?.getBoundingClientRect() ?? null;
      const lastHead = grid.querySelector('thead tr th:last-child');
      const lastRect = lastHead?.getBoundingClientRect() ?? null;
      return {
        ...before,
        scrolledTo: box.scrollLeft,
        headerVisible:
          cellRect !== null &&
          cellRect.right > boxRect.left &&
          cellRect.left < boxRect.right,
        headerText: firstCell?.textContent ?? null,
        lastColumnVisible:
          lastRect !== null &&
          lastRect.right > boxRect.left &&
          lastRect.left <= boxRect.right + 1,
        lastColumnText: lastHead?.textContent ?? null,
        focusable: box.tabIndex >= 0,
      };
    });
    if (geometry === null) throw new Error('table-container が見つからない');

    record(
      'K6-c 表は実際に横へ溢れている',
      geometry.overflow > 0,
      `scrollWidth ${String(geometry.scrollWidth)} / clientWidth ${String(geometry.clientWidth)}（溢れ ${String(geometry.overflow)} px）・ th ${String(geometry.headCells)} 本`,
    );
    record(
      'K6-d 最後の列まで到達できる',
      geometry.lastColumnVisible,
      `右端までスクロール後の最終列 = ${String(geometry.lastColumnText)}`,
    );
    record(
      '🆕 K6-e スクロール器がキーボードで焦点を得られる（D9=B の効果）',
      geometry.focusable,
      `tabIndex >= 0: ${String(geometry.focusable)}`,
    );
    // ★★ **この 1 本が Q1 の答えを決めた。**
    //    `DataGrid` 版では 🟥 FAIL（右端までスクロールすると 1 列目が画面外）。
    //    `PivotTable`（新設）では 🟦 PASS（`sticky left-0` で器の左端に残る）。
    record(
      'K6-f 行ヘッダ（人名）を見失わない',
      geometry.headerVisible,
      `右端までスクロール後、1 列目（${String(geometry.headerText)}）は ${geometry.headerVisible ? '見えている' : '🟥 画面外'}`,
    );
    record(
      'K6-g console error が 0 件',
      log.errors.length === 0,
      log.errors.join(' / ') || '0 件',
    );
    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

const failed = results.filter((r) => !r.pass);
console.log(
  `\n=== ${String(results.length - failed.length)}/${String(results.length)} PASS ===`,
);
console.log(
  '🟨 K6-f は Q1 の答えを決めた検体——`DataGrid` 版では落ち、`PivotTable`（新設）では通る。',
);
process.exit(failed.length === 0 ? 0 : 1);
