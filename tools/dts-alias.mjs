// 手6 — 宣言ファイルの `@/` エイリアスを相対パスへ書き換える。
//
// なぜ要るか: `tsc` は `paths` エイリアスを出力に書き戻さない（既知の仕様）。
// /design-sync の converter は公開コンポーネントを **`.d.ts` の値 export** から数えるが、
// その解決に使う ts-morph の Project には `paths` が設定されていない（`lib/dts.mjs` の
// `projectFor`）。したがって `export { Button } from '@/components/Action/Button'` は
// 解決できず、部品が 1 件も見つからない。
//
// 🟥 これは「生成物の手直し」ではなく**ライブラリビルドの一工程**（tsc-alias 相当）。
//    毎回 `pnpm build:types` から自動で走る。実測の経緯は docs/実行記録.md §手6。
//
// 使い方: node tools/dts-alias.mjs [outDir=dist/types]

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, posix, relative, resolve, sep } from 'node:path';

const outDir = resolve(process.argv[2] ?? 'dist/types');

/** outDir 配下の .d.ts を再帰的に集める。 */
function collect(dir) {
  const found = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) found.push(...collect(full));
    else if (name.endsWith('.d.ts')) found.push(full);
  }
  return found;
}

/** `@/x/y` を、その .d.ts から見た相対指定子へ。 */
function toRelative(fromFile, aliasPath) {
  const target = join(outDir, aliasPath);
  let rel = relative(join(fromFile, '..'), target).split(sep).join(posix.sep);
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

const files = collect(outDir);
let rewritten = 0;
let hits = 0;

for (const file of files) {
  const before = readFileSync(file, 'utf8');
  // from '@/…' / import('@/…') / declare module '@/…' を一括で拾う
  const after = before.replace(
    /(['"])@\/([^'"]+)\1/g,
    (_m, quote, aliasPath) => {
      hits += 1;
      return `${quote}${toRelative(file, aliasPath)}${quote}`;
    },
  );
  if (after !== before) {
    writeFileSync(file, after);
    rewritten += 1;
  }
}

console.log(
  `dts-alias: ${rewritten}/${files.length} files rewritten (${hits} specifiers)`,
);

// 書き換え漏れがあれば失敗させる（「対象 0 件で緑」を作らないため）。
const leftover = collect(outDir).filter((f) =>
  /(['"])@\//.test(readFileSync(f, 'utf8')),
);
if (leftover.length > 0) {
  console.error(
    `dts-alias: ${leftover.length} file(s) still contain '@/' specifiers:`,
  );
  for (const f of leftover.slice(0, 10))
    console.error(`  ${relative(process.cwd(), f)}`);
  process.exit(1);
}
