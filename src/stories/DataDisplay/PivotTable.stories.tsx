// 工程5 — ピボット表（コア）。**新設の理由は「`DataGrid` で書けなかったから」ではない。**
// 書けたものが読めなかった 4 点（セル単位の符号化 / 行ヘッダの固定 / 合計行 / 列見出しの強弱）。
//
// 🟨 D6=B: story のデータは**この中にインラインで置く**（`src/lib/fixtures/` へは足さない）。
//    共有する相手がここしか無い（工程4 D10 の申し送りの条件「コアの story が MSW を要求したとき」に当たらない）。
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';

import {
  PivotTable,
  PIVOT_INTENSITIES,
  type PivotCell,
  type PivotColumn,
  type PivotIntensity,
  type PivotRow,
} from '@/components/DataDisplay/PivotTable';

const DATES = ['8/3', '8/4', '8/5', '8/6', '8/7', '8/8', '8/9'];

const columns: PivotColumn[] = [
  ...DATES.map((date, index): PivotColumn => ({
    key: date,
    header: date,
    // 末尾 2 本は土日に見立てる（何が非稼働日かは使う側の知識）
    ...(index >= 5 ? { muted: true } : {}),
  })),
  { key: 'total', header: '合計' },
];

function row(key: string, header: string, hours: (number | null)[]): PivotRow {
  const cells = new Map<string, PivotCell>();
  let total = 0;
  hours.forEach((value, index) => {
    const date = DATES[index];
    if (value === null || date === undefined) return;
    total += value;
    cells.set(date, {
      value: String(value),
      intensity:
        value < 2 ? 'low' : value < 4 ? 'mid' : value < 6 ? 'high' : 'peak',
    });
  });
  cells.set('total', { value: String(total) });
  return { key, header, cells };
}

const rows: PivotRow[] = [
  row('sato', '佐藤 花子', [7.5, 6, 3.5, 1.5, 8, null, null]),
  row('tanaka', '田中 太郎', [2, 4.5, null, 7, 5.5, null, 3]),
  row('suzuki', '鈴木 一郎', [null, 1, 2.5, 4, 6.5, null, null]),
];

const footer: PivotRow = {
  key: 'total',
  header: '合計',
  cells: new Map<string, PivotCell>(
    [...DATES, 'total'].map((key) => {
      let sum = 0;
      for (const r of rows) sum += Number(r.cells.get(key)?.value ?? 0);
      return [key, { value: String(sum) }];
    }),
  ),
};

const meta = {
  title: '② 製品層・自作/DataDisplay/PivotTable',
  component: PivotTable,
  tags: ['own'],
} satisfies Meta<typeof PivotTable>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 行 × 列の交点。合計行は `footer`（`rows` に混ぜない＝行の意味を壊さない）。 */
export const Default: Story = {
  args: { columns, rows, corner: '担当', footer, scrollLabel: 'ピボット' },
};

/** 行が 0 件のとき。空状態は Pattern 側が持つ（部品は器だけ）。 */
export const Empty: Story = {
  args: {
    columns,
    rows: [],
    corner: '担当',
    empty: <p>対象が無い</p>,
  },
};

/**
 * ★★ **完成バー 面④（語彙の効果）＋ K3。**
 *
 * 🟥 **`intensity` は「クラス名が境界を越えない」設計**（先例: `DataGrid` の `CELL_KIND`）——
 * 利用側が書けるのは 5 語だけで、`bg-warning/30` は部品の内側にある。
 * ★ **だから効いているかは利用側からは一切見えない**。対応表を 1 語壊しても型も lint も緑のまま通る。
 *
 * 🟥 **[DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md) の宿題**——
 * **「指定したか」ではなく「効いたか」を実効色で読む。**
 */
export const Intensity: Story = {
  args: {
    columns: PIVOT_INTENSITIES.map((level): PivotColumn => ({
      key: level,
      header: level,
    })),
    rows: [
      {
        key: 'scale',
        header: '段階',
        cells: new Map<string, PivotCell>(
          PIVOT_INTENSITIES.map((level): [string, PivotCell] => [
            level,
            { value: level, intensity: level },
          ]),
        ),
      },
    ],
    corner: '語彙',
  },
  play: async ({ canvasElement }) => {
    await waitFor(async () => {
      await expect(canvasElement.querySelectorAll('tbody tr td').length).toBe(
        PIVOT_INTENSITIES.length,
      );
    });
    const cells = canvasElement.querySelectorAll('tbody tr td');
    const colorOf = (level: PivotIntensity): string => {
      const index = PIVOT_INTENSITIES.indexOf(level);
      const cell = cells[index];
      if (cell === undefined) {
        throw new Error(`面④: ${level} のセルが描画されていない`);
      }
      return getComputedStyle(cell).backgroundColor;
    };

    // 🟥 `none` は面を持たない
    await expect(colorOf('none')).toBe('rgba(0, 0, 0, 0)');

    // 🟥 K3: 段階の違う 4 セルは**全部違う実効色**（同じなら DR-0090 の再演）
    const painted = (['low', 'mid', 'high', 'peak'] as const).map(colorOf);
    await expect(new Set(painted).size).toBe(painted.length);
    for (const color of painted) {
      await expect(color).not.toBe('rgba(0, 0, 0, 0)');
    }

    // 🟥 段階は「色」ではなく「不透明度」で作っている＝ 色相は 1 つ（`--color-warning`）。
    //    不透明度が単調に増えることを実効値で確かめる（語の順序が絵の順序と一致している）。
    // 🟥 **実効色は `rgba()` では返ってこない**——Tailwind v4 は色を oklab で出すので
    //    `getComputedStyle` は `oklab(0.765 0.081 0.156 / 0.15)` を返す（初版はここで throw した）。
    //    ★ **投げてくれたから気づけた**（`measure.ts` の「見つからなければ throw」と同じ作法）。
    const alphaOf = (color: string): number => {
      const slash = /\/\s*([\d.]+%?)\s*\)/.exec(color);
      if (slash?.[1] !== undefined) {
        const raw = slash[1];
        return raw.endsWith('%') ? Number(raw.slice(0, -1)) / 100 : Number(raw);
      }
      const comma = /rgba\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\s*\)/.exec(color);
      if (comma?.[1] !== undefined) return Number(comma[1]);
      throw new Error(`面④: 不透明度が読めない ${color}`);
    };
    const alphas = painted.map(alphaOf);
    await expect(alphas[0]).toBeLessThan(alphas[1] ?? 0);
    await expect(alphas[1]).toBeLessThan(alphas[2] ?? 0);
    await expect(alphas[2]).toBeLessThan(alphas[3] ?? 0);
  },
};

/**
 * ★ **行ヘッダの固定**——`DataGrid` で破れた 2 点目。
 * 🟥 **実測で閉じる**: 右端までスクロールしても 1 列目が器の中に残っている
 * （`DataGrid` 版は画面外に出た・`tools/pivot-probe.mjs` K6-f）。
 */
export const StickyRowHeader: Story = {
  args: {
    columns: Array.from({ length: 60 }, (_, index): PivotColumn => {
      const key = `d${String(index)}`;
      return { key, header: `9/${String(index + 1)}` };
    }),
    rows: [
      {
        key: 'sato',
        header: '佐藤 花子',
        cells: new Map<string, PivotCell>(
          Array.from({ length: 60 }, (_, index): [string, PivotCell] => [
            `d${String(index)}`,
            { value: String((index % 8) + 1), intensity: 'mid' },
          ]),
        ),
      },
    ],
    corner: '担当',
    scrollLabel: '長いピボット',
  },
  play: async ({ canvasElement }) => {
    const box = canvasElement.querySelector<HTMLElement>(
      '[data-slot="table-container"]',
    );
    if (box === null) throw new Error('スクロール器が無い');
    await waitFor(async () => {
      await expect(box.scrollWidth).toBeGreaterThan(box.clientWidth);
    });
    // 🟦 D9=B の効果: 器がキーボードで焦点を得られる（axe scrollable-region-focusable）
    await expect(box.tabIndex).toBeGreaterThanOrEqual(0);

    box.scrollLeft = box.scrollWidth;
    await waitFor(async () => {
      await expect(box.scrollLeft).toBeGreaterThan(0);
    });
    const header = canvasElement.querySelector<HTMLElement>('tbody th');
    if (header === null) throw new Error('行ヘッダが無い');
    const headerRect = header.getBoundingClientRect();
    const boxRect = box.getBoundingClientRect();
    // 🟥 右端までスクロールしても、行ヘッダは器の左端に残っている
    await expect(headerRect.right).toBeGreaterThan(boxRect.left);
    await expect(headerRect.left).toBeLessThan(boxRect.left + 8);
  },
};
