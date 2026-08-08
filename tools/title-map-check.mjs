// tools/title-map-check.mjs — 工程4 D4=B。`/design-sync` の 4 本目の入口を守る検査。
//
// 🟥 **なぜ要るか**（[DR-0091](../docs/DR/DR-0091-claude-design-is-a-fourth-shipping-entrance.md)）:
//    出荷の入口は 4 本ある。3 本（JS の到達可能性・dts の `include`・`publicDir`）は
//    `src/index.ts` と `vite.config.ts` が機械で決めるが、**4 本目（Claude Design）だけは
//    story の `title` で決まり、`.design-sync/config.json` の `titleMap` に手で書く。**
//    [DR-0087](../docs/DR/DR-0087-fetching-belongs-to-the-subject-layer.md) の lint 2 本はこの経路を 1 行も見ていない。
//
// 🟨 **K7 の実測（工程4）**: 足し忘れた title は converter の警告に `[TITLE_UNMAPPED]` として出る
//    ——**静かに湧くのではない。**だから A（手で足す）でも一応守れる。
//    それでも本検査を置くのは、**警告は人が見落とすから**であって、壊れるからではない。
//
// 🟥 **これはゲートではない**（`pnpm lint` 等には入れない）。同期は人が打つ操作なので、
//    **打つ前に人が回すもの**。ゲートに入れると「同期しない日も赤い」状態を作る。
//
// 使い方: pnpm build-storybook && node tools/title-map-check.mjs
import { readFile } from 'node:fs/promises';

/** 出荷しない棚。ここに居る story は `titleMap` で明示的に `null` にする。 */
const SUBJECT_SHELVES = ['⑤ 題材', '★ Review'];

const config = JSON.parse(await readFile('.design-sync/config.json', 'utf8'));
const index = JSON.parse(await readFile('storybook-static/index.json', 'utf8'));

const titles = new Set(
  Object.values(index.entries).map((entry) => entry.title),
);

/**
 * `titleMap` の key の作り方。
 * 🟥 **実測で分かったこと（工程4 K7）**: 棚を落とした葉の名前**から空白を除いたもの**。
 *    既存 6 件は `A状態面` のように空白が無く、story の title は `★ Review/A 状態面`。
 *    **空白を落とさずに突き合わせると、生きている 6 件を「死んでいる」と誤判定する**
 *    ——本検査を書いた最初の版が実際にそう報告した。
 */
function leafKey(title) {
  return (title.split('/').at(-1) ?? title).replace(/\s+/gu, '');
}

const problems = [];

for (const title of titles) {
  const shelf = SUBJECT_SHELVES.find((prefix) => title.startsWith(prefix));
  if (shelf === undefined) continue;
  const leaf = leafKey(title);
  if (!(leaf in config.titleMap)) {
    problems.push(
      `🟥 出荷しない棚の story が titleMap に無い: "${title}"（key = "${leaf}"）`,
    );
  } else if (config.titleMap[leaf] !== null) {
    problems.push(
      `🟥 出荷しない棚なのに titleMap が null でない: "${leaf}" → ${JSON.stringify(config.titleMap[leaf])}`,
    );
  }
}

// 逆向き: titleMap に書いたのに story がもう無い（消し忘れ）。
for (const key of Object.keys(config.titleMap)) {
  const found = [...titles].some((title) => leafKey(title) === key);
  if (!found) {
    problems.push(`🟨 titleMap の key に対応する story が無い: "${key}"`);
  }
}

if (problems.length === 0) {
  console.log(
    `🟦 OK — 出荷しない棚の story はすべて titleMap で除外されている（story ${String(titles.size)} 題）`,
  );
  process.exit(0);
}
for (const problem of problems) console.log(problem);
process.exit(1);
