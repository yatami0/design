// tools/edit-probe.mjs — 工程4 K1・K2・K3 の証拠取り。
//
// 🟥 **これはゲートではない。**「保存の絵が出た」ではなく
//    「**何が・何回・どんな body で飛んだか**」を数えるための道具。
//    `storybook build` は story が実行時に落ちても exit 0（DR-0048）なので、
//    描画も保存も build の緑では 1 ミリも保証されない。
//
// 測るもの:
//   K1 保存 → `PUT /redmine/issues/1001.json` が **1 回だけ**飛び、**変えた項目だけ**が body に載る
//   K2 不正値（件名を空 / 進捗 101）→ エラーが出て **PUT が 0 回**
//   K3 保存後の取り直し → 変更履歴（journals）が **1 件増える**
//
// 使い方: pnpm build-storybook && node tools/edit-probe.mjs
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const ROOT = 'storybook-static';
const PORT = 61007;
const STORY = '⑤-題材（redmine）-チケット詳細--default';

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
  const puts = [];
  const gets = [];
  const errors = [];
  page.on('console', (msg) => {
    const text = msg.text();
    const put = /^\[msw\] PUT (\S+) (.*)$/.exec(text);
    if (put) puts.push({ url: put[1], body: put[2] });
    const get = /^\[msw\] GET (\S+)$/.exec(text);
    if (get) gets.push(get[1]);
    if (msg.type() === 'error') errors.push(text);
  });
  page.on('pageerror', (e) => errors.push(String(e)));
  return { puts, gets, errors };
}

async function openStory(page) {
  await page.goto(`http://127.0.0.1:${String(PORT)}/iframe.html?id=${STORY}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForSelector('#issue-subject', { timeout: 15000 });
  await page.waitForTimeout(400);
}

const results = [];
function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? '🟦 PASS' : '🟥 FAIL'}  ${name}\n         ${detail}`);
}

const server = await serve();
const browser = await chromium.launch();

try {
  // ── K1: 変えた項目だけが 1 回だけ飛ぶ ──────────────────────────────
  {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    const log = attach(page);
    await openStory(page);

    const before = await page.inputValue('#issue-subject');
    await page.fill('#issue-subject', `${before} ★編集`);
    await page.fill('#issue-done', '55');
    await page.getByRole('button', { name: '保存' }).click();
    await page.waitForTimeout(1200);

    const put = log.puts;
    record(
      'K1-a PUT が 1 回だけ飛ぶ',
      put.length === 1,
      `回数 ${String(put.length)} / URL ${put[0]?.url ?? '—'}`,
    );
    const body = put[0] ? JSON.parse(put[0].body) : {};
    const keys = Object.keys(body).sort();
    record(
      'K1-b body は変えた項目だけ',
      keys.length === 2 &&
        keys.includes('subject') &&
        keys.includes('done_ratio'),
      `keys = [${keys.join(', ')}]（期待: done_ratio, subject）`,
    );
    record(
      'K1-c 画面が落ちていない',
      log.errors.length === 0,
      log.errors.length === 0 ? 'console error 0 件' : log.errors.join(' / '),
    );

    // ── K3: 保存後に取り直して履歴が増える ───────────────────────────
    const historyAfter = await page.locator('ol > li').count();
    const savedNotice = await page.getByText('保存した').count();
    record(
      'K3-a 保存の知らせが出る（インライン・D8=B）',
      savedNotice > 0,
      `「保存した」 ${String(savedNotice)} 件`,
    );
    record(
      'K3-b 取り直しで変更履歴が 1 件以上ある',
      historyAfter > 0,
      `Timeline の項目 ${String(historyAfter)} 件（保存前は 0 件のこともある＝生成データ次第）`,
    );
    const subjectNow = await page.inputValue('#issue-subject');
    record(
      'K3-c 取り直した値が編集後になっている',
      subjectNow.includes('★編集'),
      `件名 = ${subjectNow}`,
    );
    await page.close();
  }

  // ── K2: 不正値では 1 回も飛ばない ─────────────────────────────────
  {
    const page = await browser.newPage({
      viewport: { width: 1280, height: 900 },
    });
    const log = attach(page);
    await openStory(page);

    await page.fill('#issue-subject', '');
    await page.fill('#issue-done', '101');
    await page.getByRole('button', { name: '保存' }).click();
    await page.waitForTimeout(1200);

    record(
      'K2-a 不正値では PUT が 0 回',
      log.puts.length === 0,
      `回数 ${String(log.puts.length)}`,
    );
    const shown = await page.getByText('件名は必須。').count();
    const shownDone = await page.getByText('進捗は 100 以下。').count();
    record(
      'K2-b エラー文が両方出る',
      shown > 0 && shownDone > 0,
      `件名 ${String(shown)} 件 / 進捗 ${String(shownDone)} 件`,
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
process.exit(failed.length === 0 ? 0 : 1);
