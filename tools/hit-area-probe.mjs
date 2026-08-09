// tools/hit-area-probe.mjs — 部品3 C3-06（面⑥・当たり判定 44px）の計測器。
//
// 🟥 **これはゲートではない**（D8=A・落とさない）。**[OBS-0008](../docs/OBS/OBS-0008_当たり判定44pxをどう扱うか.md)
//    への入力を作るための道具。**バーは面⑥ を「👁 人」に置いており、**axe は 24px（AA）しか測らない**
//    （[DR-0034](../docs/DR/DR-0034-touch-target-visual-32-hit-44.md)）＝ **「a11y が緑だから当たり判定も大丈夫」は成り立たない。**
//
// 🟥 **`hasTouch: true` で開く**——`Button` の当たり判定拡張は `pointer-coarse:` に閉じてあるので
//    （手3 D7=B+D+F）、**マウス文脈で測ると拡張が効かない**（[DR-0049](../docs/DR/DR-0049-hit-area-reaches-44px-only-at-default-size.md) と同じ手法）。
//
// 使い方:
//   pnpm build-storybook && node tools/hit-area-probe.mjs
//   → tmp/hit-area/measured.json / measured.md
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const ROOT = 'storybook-static';
const OUT = 'tmp/hit-area';
const PORT = 61008;
const TARGET = 44; // Apple HIG / WCAG 2.5.5（AAA）

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

/**
 * 当たり判定の実寸を返す。
 * 🟥 **見た目の矩形（`getBoundingClientRect`）だけでは足りない**——`Button` は
 *    `::after` を `-inset-(--spacing-hit-expand)` で広げているので、**擬似要素の分を足す。**
 */
const MEASURE = (selector) => {
  const nodes = [...document.querySelectorAll(selector)];
  return nodes.map((el) => {
    const box = el.getBoundingClientRect();
    const after = getComputedStyle(el, '::after');
    const grow = (value) => {
      const n = Number.parseFloat(value);
      return Number.isFinite(n) && value !== 'auto' ? -n : 0;
    };
    const dx = grow(after.left) + grow(after.right);
    const dy = grow(after.top) + grow(after.bottom);
    const has = after.content !== 'none' && after.position === 'absolute';
    return {
      text: (el.textContent ?? '').trim().slice(0, 12),
      w: Math.round(box.width * 100) / 100,
      h: Math.round(box.height * 100) / 100,
      hitW: Math.round((box.width + (has ? dx : 0)) * 100) / 100,
      hitH: Math.round((box.height + (has ? dy : 0)) * 100) / 100,
    };
  });
};

const TARGETS = [
  {
    id: '②-製品層・自作-selection-datepicker--open',
    label: 'DatePicker/Open（開いたカレンダー）',
    groups: [
      {
        name: '日付セル',
        sel: '[data-slot="popover-content"] button[data-day]',
      },
      {
        name: '月送り',
        sel: '[data-slot="popover-content"] button.rdp-button_previous, [data-slot="popover-content"] button.rdp-button_next',
      },
      { name: 'トリガ', sel: '[data-slot="date-picker-trigger"]' },
    ],
  },
];

const server = await serve();
const browser = await chromium.launch();
// 🟥 hasTouch なしで測ると pointer-coarse: の拡張が 1 件も効かない
const page = await browser.newPage({
  hasTouch: true,
  viewport: { width: 900, height: 900 },
});

const result = [];
for (const target of TARGETS) {
  await page.goto(
    `http://localhost:${String(PORT)}/iframe.html?id=${target.id}&viewMode=story`,
    { waitUntil: 'networkidle' },
  );
  // play（クリックして開く）が終わるのを待つ
  await page.waitForSelector('[data-slot="popover-content"]', {
    timeout: 10000,
  });
  await page.waitForTimeout(300);
  for (const group of target.groups) {
    const rows = await page.evaluate(MEASURE, group.sel);
    result.push({ target: target.label, group: group.name, rows });
  }
}

await browser.close();
server.close();

await mkdir(OUT, { recursive: true });
await writeFile(`${OUT}/measured.json`, JSON.stringify(result, null, 2));

const lines = ['# 当たり判定の実測（部品3 C3-06・面⑥）', ''];
lines.push(
  `基準: **${String(TARGET)}px**（Apple HIG / WCAG 2.5.5 AAA）。24px（AA）は axe が見る。`,
  '',
);
lines.push('| 対象 | 群 | 個数 | 見た目 w×h | 当たり判定 w×h | 44px 未達 |');
lines.push('| --- | --- | --- | --- | --- | --- |');
for (const r of result) {
  const first = r.rows[0];
  const under = r.rows.filter((x) => x.hitW < TARGET || x.hitH < TARGET).length;
  lines.push(
    `| ${r.target} | ${r.group} | ${String(r.rows.length)} | ${first === undefined ? '—' : `${String(first.w)}×${String(first.h)}`} | ${first === undefined ? '—' : `${String(first.hitW)}×${String(first.hitH)}`} | **${String(under)} / ${String(r.rows.length)}** |`,
  );
}
await writeFile(`${OUT}/measured.md`, `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
