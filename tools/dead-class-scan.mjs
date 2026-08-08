// A の波及範囲を数える。全 story の全要素を走り、
// 「語彙を教えた twMerge なら畳まれるのに、DOM には両方残っている」箇所を数える。
//
// 使い方: cn() を **塞ぐ前の状態に戻してから** 実行する（＝赤を測る）。
// 塞いだ後に実行すると 0 件になるのが正しい（対照）。
import { chromium } from 'playwright';
import { extendTailwindMerge } from 'tailwind-merge';

const BASE = 'http://127.0.0.1:61007';
const TOKEN_SCALES = {
  spacing: [
    'inset-xs',
    'inset-sm',
    'inset-md',
    'inset-lg',
    'stack-sm',
    'stack-md',
    'stack-lg',
    'inline-sm',
    'inline-md',
    'touch-min',
    'hit-expand',
    'gutter',
    'row',
    'dot',
  ],
  container: ['content', 'wide', 'field-sm', 'field-md', 'field-lg'],
  color: [
    'success',
    'warning',
    'fill-success',
    'fill-warning',
    'fill-danger',
    'fill-neutral',
  ],
  text: ['body', 'table', 'label', 'emphasis', 'heading'],
  'font-weight': ['emphasis'],
};
const merge = extendTailwindMerge({ extend: { theme: TOKEN_SCALES } });
const VOCAB = new Set(Object.entries(TOKEN_SCALES).flatMap(([, vals]) => vals));

const index = await (await fetch(`${BASE}/index.json`)).json();
const stories = Object.values(index.entries).filter((e) => e.type === 'story');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const hits = [];

for (const s of stories) {
  if (s.title.startsWith('★ Probe')) continue;
  try {
    await page.goto(
      `${BASE}/iframe.html?id=${encodeURIComponent(s.id)}&viewMode=story`,
      {
        waitUntil: 'networkidle',
        timeout: 20000,
      },
    );
    await page.waitForTimeout(120);
  } catch {
    continue;
  }
  const found = await page.evaluate(() =>
    [...document.querySelectorAll('*')]
      .map((el) => (typeof el.className === 'string' ? el.className : ''))
      .filter(Boolean),
  );
  for (const cls of found) {
    const merged = merge(cls);
    if (merged === cls) continue;
    // 落ちたクラスのうち、語彙由来のものが絡む衝突だけを数える
    const dropped = cls
      .split(/\s+/)
      .filter((c) => !merged.split(/\s+/).includes(c));
    const survivors = merged.split(/\s+/);
    const involvesVocab = [...dropped, ...survivors].some((c) =>
      [...VOCAB].some((v) => c.endsWith(`-${v}`)),
    );
    if (!involvesVocab) continue;
    hits.push({
      story: s.title + ' / ' + s.name,
      dropped: dropped.join(' '),
      kept: survivors
        .filter((c) => [...VOCAB].some((v) => c.endsWith(`-${v}`)))
        .join(' '),
    });
  }
}

// 同じ (dropped, kept) の組を数える
const tally = new Map();
for (const h of hits) {
  const k = `${h.dropped}  →落ちる／残る→  ${h.kept}`;
  if (!tally.has(k)) tally.set(k, { count: 0, stories: new Set() });
  tally.get(k).count++;
  tally.get(k).stories.add(h.story);
}

console.log(
  `走査 story: ${String(stories.length)}／該当要素: ${String(hits.length)} 件`,
);
for (const [k, v] of [...tally.entries()].sort(
  (a, b) => b[1].count - a[1].count,
)) {
  console.log(`\n${String(v.count)} 件  ${k}`);
  for (const st of [...v.stories].slice(0, 6)) console.log(`      - ${st}`);
}
await browser.close();
