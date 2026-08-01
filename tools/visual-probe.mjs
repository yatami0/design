// tools/visual-probe.mjs — 手5 H5-07 の判定 3 段目を機械側から支える計測器。
//
// 🟥 **これはゲートではない。**「壊れたら赤くする」ものではなく、
//    「**実際に描画された値を読む**」ための道具。手2b D10 で外した
//    `@storybook/addon-vitest`（＝テストランナー・未決 #14）とは別物。
//
// なぜ要るか:
//   判定の 3 段目（目視）は人の仕事だが、**人が見た印象と実際の描画値がずれる**ことがある。
//   0.8px の角丸差（狙い 8px / 実効 7.2px）は目では判定しづらい。
//   → **人は「見てどう感じたか」を、機械は「実際に何 px だったか」を出し、突き合わせる。**
//
// 使い方:
//   pnpm build-storybook && node tools/visual-probe.mjs
//   → tmp/visual-probe/*.png（スクリーンショット）
//     tmp/visual-probe/measured.json / measured.md（実測値）
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { chromium } from 'playwright';

const ROOT = 'storybook-static';
const OUT = 'tmp/visual-probe';
const PORT = 61006;

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

/** storybook-static を配る最小サーバ（依存を増やさないため自前）。 */
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
 * 計測対象。
 * `sel` は story 内の CSS セレクタ、`props` は読み取る計算済みプロパティ。
 * `expect` は「そうなっているはず」の値——ここが実測とずれたら発見。
 */
const TARGETS = [
  {
    id: '★-review-b-角丸--default',
    label: 'B 角丸',
    obs: 'B',
    full: true,
    measure: [
      {
        name: 'rounded-sm',
        sel: '.rounded-sm',
        props: ['borderTopLeftRadius'],
        expect: '8px',
      },
      {
        name: 'rounded-md',
        sel: '.rounded-md',
        props: ['borderTopLeftRadius'],
        expect: '8px',
      },
      {
        name: 'rounded-lg',
        sel: '.rounded-lg',
        props: ['borderTopLeftRadius'],
        expect: '12px',
      },
      {
        name: 'rounded-xl',
        sel: '.rounded-xl',
        props: ['borderTopLeftRadius'],
        expect: '18px',
      },
      {
        name: 'rounded-2xl',
        sel: '.rounded-2xl',
        props: ['borderTopLeftRadius'],
        expect: '18px',
      },
      {
        name: 'rounded-4xl (pill)',
        sel: '.rounded-4xl',
        props: ['borderTopLeftRadius'],
        expect: '980px',
      },
    ],
  },
  {
    id: '★-review-a-状態面--default',
    label: 'A 状態面',
    obs: 'A',
    full: true,
    measure: [
      {
        name: 'bg-destructive/10',
        sel: '.bg-destructive\\/10',
        props: ['backgroundColor'],
        expect: 'destructive を 10% で混ぜた色',
      },
      {
        name: 'bg-destructive/20',
        sel: '.bg-destructive\\/20',
        props: ['backgroundColor'],
        expect: '20%',
      },
      {
        name: 'bg-muted/50',
        sel: '.bg-muted\\/50',
        props: ['backgroundColor'],
        expect: '50%',
      },
      {
        name: 'StatusPill danger（自作・比較対象）',
        sel: '[data-slot="badge"].bg-fill-danger',
        props: ['backgroundColor'],
        expect: '--color-fill-danger = rgba(255,59,48,.16)',
      },
      // 🟥 **模型ではなく実物の Input で測る。**目視で「エラー時のフォーカスリングも
      //    ブランド色に見える」という所見が出たが、素の div にリングを当てた検体では
      //    「focus-visible と aria-invalid が重なったときの勝敗」を再現できていない（OBS-0009 §1）。
      {
        name: '実物 Input（通常・フォーカス時）',
        sel: '[data-probe="input-plain"]',
        props: ['boxShadow', 'borderColor'],
        focus: true,
        expect: 'ring-ring/50 = ブランド青 #005fa2 の 50%',
      },
      {
        name: '実物 Input aria-invalid（フォーカスなし）',
        sel: '[data-probe="input-invalid"]',
        props: ['boxShadow', 'borderColor'],
        expect: 'ring-destructive/20 = 赤 20%',
      },
      {
        name: '🟥 実物 Input aria-invalid ＋ フォーカス（競合）',
        sel: '[data-probe="input-invalid-focus"]',
        props: ['boxShadow', 'borderColor'],
        focus: true,
        expect:
          'CSS 順序で後ろの aria-invalid:ring-destructive/20 が勝つはず＝赤',
      },
    ],
  },
  {
    id: '★-review-c-影--default',
    label: 'C 影',
    obs: 'C',
    full: true,
    measure: [
      {
        name: 'shadow-sm',
        sel: '.shadow-sm',
        props: ['boxShadow'],
        expect: 'apple --shadow-1',
      },
      {
        name: 'shadow-md',
        sel: '.shadow-md',
        props: ['boxShadow'],
        expect: 'apple --shadow-1（sm と同一になるはず）',
      },
      {
        name: 'shadow-lg',
        sel: '.shadow-lg',
        props: ['boxShadow'],
        expect: 'apple --shadow-2',
      },
    ],
  },
  {
    id: '★-review-d-タイポ--default',
    label: 'D タイポ',
    obs: 'D',
    full: true,
    measure: [
      {
        name: 'font-medium',
        sel: '.font-medium',
        props: ['fontWeight'],
        expect: '600',
      },
      {
        name: 'font-normal',
        sel: '.font-normal',
        props: ['fontWeight'],
        expect: '400',
      },
      {
        name: 'text-body',
        sel: '.text-body',
        props: ['fontSize'],
        expect: '17px',
      },
      {
        name: 'text-table',
        sel: '.text-table',
        props: ['fontSize'],
        expect: '15px',
      },
      {
        name: 'text-label',
        sel: '.text-label',
        props: ['fontSize'],
        expect: '13px',
      },
    ],
  },
  {
    id: '★-review-i-層の比較--default',
    label: 'I 層の比較',
    obs: 'I',
    full: true,
    measure: [
      {
        name: 'ペア1 vendor Checkbox の角丸',
        sel: '[data-slot="checkbox"]',
        props: ['borderTopLeftRadius'],
        expect: '4px（生値・動かない）',
      },
      {
        name: 'ペア1 own Card の角丸',
        sel: '[data-slot="card"]',
        props: ['borderTopLeftRadius'],
        expect: '18px（card.tsx は rounded-xl）',
      },
      {
        name: 'ペア2 vendor Badge destructive の面',
        sel: '[data-slot="badge"].bg-destructive\\/10',
        props: ['backgroundColor'],
        expect: 'destructive 10%（badge.tsx の実体は /10）',
      },
      {
        name: 'ペア2 own StatusPill danger の面',
        sel: '[data-slot="badge"].bg-fill-danger',
        props: ['backgroundColor'],
        expect: '--color-fill-danger = rgba(255,59,48,0.16)',
      },
      {
        name: 'ペア3 vendor Table セルの padding',
        sel: '[data-slot="table-cell"]',
        props: ['paddingLeft', 'paddingTop'],
        expect: '直書き（p-2 系）',
      },
      {
        name: 'ペア3 own Card の padding',
        sel: '[data-slot="card"]',
        props: ['paddingLeft', 'paddingTop'],
        expect: '🟥 card.tsx の root は py- だけ。px- は CardContent 側',
      },
    ],
  },
  {
    id: '★-review-e·f-オーバーレイ--default',
    label: 'E·F オーバーレイ',
    obs: 'EF',
    full: false,
    // オーバーレイは開かないと出ない。Dialog を開いてから測る。
    open: 'Dialog を開く',
    measure: [
      {
        name: 'dialog overlay の背景',
        sel: '[data-slot="dialog-overlay"]',
        props: ['backgroundColor'],
        expect: 'rgba(0,0,0,.4) = --color-scrim',
      },
      {
        name: 'dialog overlay の blur',
        sel: '[data-slot="dialog-overlay"]',
        props: ['backdropFilter'],
        expect: 'blur(0px) または none（V1）',
      },
      {
        name: 'dialog content の角丸',
        sel: '[data-slot="dialog-content"]',
        props: ['borderTopLeftRadius'],
        expect: '18px（apple l）',
      },
    ],
  },
  {
    id: '④-templates-appshell--default',
    label: '④ AppShell',
    obs: 'H',
    full: true,
    measure: [
      {
        name: 'sidebar の面',
        sel: '.bg-sidebar',
        props: ['backgroundColor'],
        expect: '#003a63（tmp brand-navy）',
      },
      {
        name: 'sidebar の前景',
        sel: '.text-sidebar-foreground',
        props: ['color'],
        expect: 'rgba(255,255,255,.92)',
      },
      {
        name: 'nav-item（見た目も 44px・DR-0034）',
        sel: '[data-slot="sidebar-menu-button"]',
        props: ['minHeight'],
        expect: '44px',
      },
    ],
  },
  {
    // 🟥 DR-0053 が見つけた「Card の直下に children を置くと左右の余白がゼロ」の直しを、
    //    目視ではなく機械で確かめる検体。`CardContent` を通したら px が出るはず。
    id: '④-templates-appshell--card-surfaces',
    label: '④ AppShell — CardSurfaces',
    obs: 'H',
    full: true,
    measure: [
      {
        name: 'Card root（px は持たないまま）',
        sel: '[data-slot="card"]',
        props: ['paddingLeft', 'paddingTop'],
        expect: 'paddingLeft: 0px / paddingTop: 16px（card.tsx は py- だけ）',
      },
      {
        name: '🆕 CardContent（左右の余白はここが持つ）',
        sel: '[data-slot="card-content"]',
        props: ['paddingLeft', 'paddingRight'],
        expect: '16px / 16px = px-(--card-spacing)',
      },
    ],
  },
  {
    id: '③-patterns-listdetail--default',
    label: '③ ListDetail',
    obs: '-',
    full: true,
    measure: [],
  },
  {
    id: '①-tokens-tokens--colors',
    label: 'Tokens 色',
    obs: '-',
    full: true,
    measure: [],
  },
];

// 🟥 **story の id を打ち間違えると、全検体が `null` になるだけで止まらない。**
//    「要素が取れなかった」と区別がつかず、観点カードには 🟥 が並ぶだけになる。
//    🟥 **実際に踏んだ。**export 名 `CardSurfaces` をそのまま繋げた id を書いたが、
//    Storybook は kebab に割るので正しくは `--card-surfaces` だった。
//    → **測る前に id が実在するかを index.json と突き合わせる。**
const index = JSON.parse(
  await readFile(join(ROOT, 'index.json'), 'utf8'),
).entries;
const unknown = TARGETS.filter((t) => !(t.id in index));
if (unknown.length > 0) {
  console.error('🟥 存在しない story id:');
  for (const t of unknown) console.error(`   ${t.id}（${t.label}）`);
  process.exit(1);
}

const server = await serve();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
await mkdir(OUT, { recursive: true });

const results = [];

for (const t of TARGETS) {
  const url = `http://localhost:${String(PORT)}/iframe.html?id=${encodeURIComponent(t.id)}&viewMode=story`;
  await page.goto(url, { waitUntil: 'networkidle' });

  if (t.open) {
    // 🟥 1 件の失敗で全体を落とさない。開けなかったこと自体が観測なので記録して進む。
    try {
      await page.getByRole('button', { name: t.open }).click({ timeout: 5000 });
      await page.waitForTimeout(500);
    } catch {
      console.log(`  🟥 「${t.open}」を開けなかった`);
    }
  }

  const measured = [];
  for (const m of t.measure) {
    const got = await page.evaluate(
      ({ sel, props, focus }) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        // 🟥 **状態は当てないと出ない。**`:focus-visible` のリングは
        //    フォーカスしていない要素では読めない（Chromium はテキスト入力を
        //    常に focus-visible として扱うので `.focus()` で足りる）。
        if (focus) el.focus();
        const cs = getComputedStyle(el);
        const out = Object.fromEntries(props.map((p) => [p, cs[p]]));
        if (focus) el.blur();
        return out;
      },
      { sel: m.sel, props: m.props, focus: m.focus ?? false },
    );
    measured.push({ ...m, got });
  }

  const png = join(OUT, t.id.replace(/[^a-z0-9-]/gi, '_') + '.png');
  await page.screenshot({ path: png, fullPage: t.full });
  results.push({ ...t, png, measured });
  console.log(`✓ ${t.label}  →  ${png}`);
}

// ── Q7: 当たり判定 44px（未決 #23・4 回持ち越した唯一の未計測）─────────────
// 🟥 `@media (pointer: coarse)` で限定しているので、**タッチを模さないと 32px のまま**。
//    Playwright は hasTouch でポインタ種別を切り替えられる。
const touchCtx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
const touchPage = await touchCtx.newPage();
await touchPage.goto(
  `http://localhost:${String(PORT)}/iframe.html?id=②-製品層・ラッパー-action-button--sizes&viewMode=story`,
  { waitUntil: 'networkidle' },
);
const hit = await touchPage.evaluate(() => {
  // 🟥 拡張量は **全サイズ一律** で ::after の inset。サイズごとに届くかが変わる。
  const rows = [...document.querySelectorAll('[data-slot="button"]')].map(
    (el) => {
      const box = el.getBoundingClientRect();
      const cs = getComputedStyle(el, '::after');
      const inset =
        cs.inset && cs.inset !== 'auto' ? parseFloat(cs.inset) : null;
      const eff = inset === null ? null : box.height + 2 * Math.abs(inset);
      return {
        ラベル: (el.textContent ?? '').trim(),
        見た目: `${String(Math.round(box.height))}px`,
        inset: cs.inset,
        当たり判定:
          eff === null ? '(::after 無し)' : `${String(Math.round(eff))}px`,
        '44px 到達': eff !== null && eff >= 44,
      };
    },
  );
  return { 'pointer:coarse か': matchMedia('(pointer: coarse)').matches, rows };
});
await touchPage.screenshot({ path: join(OUT, 'q7-touch-button.png') });
await touchCtx.close();
console.log('\nQ7（pointer: coarse）:', JSON.stringify(hit, null, 2));
await writeFile(join(OUT, 'q7.json'), JSON.stringify(hit, null, 2));

await browser.close();
server.close();

await writeFile(join(OUT, 'measured.json'), JSON.stringify(results, null, 2));

// 🟦 **認識合わせの核心。**実測値を story 側へ渡し、観点カードが
//    「期待 / 実測 / 一致」を Storybook の画面上に出せるようにする。
//    → 人は現物を、機械は数字を、**同じ画面で**突き合わせられる。
const specimens = [];
for (const r of results) {
  for (const m of r.measured) {
    const got = m.got
      ? Object.entries(m.got)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' / ')
      : null;
    specimens.push({
      obs: r.obs ?? '-',
      name: m.name,
      expect: m.expect,
      got,
      ok: got !== null,
    });
  }
}
for (const row of hit?.rows ?? []) {
  specimens.push({
    obs: 'J',
    name: `Button ${row.ラベル}`,
    expect: '当たり判定 44px 以上',
    got: `見た目 ${row.見た目} + inset ${row.inset} × 2 = ${row.当たり判定}`,
    ok: row['44px 到達'],
  });
}
await writeFile(
  'src/stories/Review/_measured.json',
  JSON.stringify({ measuredAt: new Date().toISOString(), specimens }, null, 2) +
    '\n',
);
console.log(
  `観点カード用 → src/stories/Review/_measured.json（${String(specimens.length)} 検体）`,
);

const md = results
  .filter((r) => r.measured.length > 0)
  .map((r) => {
    const rows = r.measured
      .map((m) => {
        const got =
          m.got === null
            ? '🟥 **要素が見つからない**'
            : Object.entries(m.got)
                .map(([k, v]) => `${k}: \`${v}\``)
                .join(' / ');
        return `| ${m.name} | ${m.expect} | ${got} |`;
      })
      .join('\n');
    return `#### ${r.label}\n\n| 検体 | 期待 | **実測（getComputedStyle）** |\n| --- | --- | --- |\n${rows}\n`;
  })
  .join('\n');

await writeFile(join(OUT, 'measured.md'), md);
console.log(`\n実測値 → ${join(OUT, 'measured.md')}`);
