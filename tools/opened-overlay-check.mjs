// tools/opened-overlay-check.mjs — 「開いた story」を機械で要求する（部品4 C4-04・D4=C の**静的側**）
//
// ★★★ 🟥 **[DR-0096](../docs/DR/DR-0096-overlays-that-no-story-opens-are-invisible-to-every-check.md) が
//    「未検討」と書いた唯一の項に答える検査。**
//    「開閉を持つ部品の一覧を機械が知る方法」＝ **素材層で `Primitive.Portal` を使っているファイル**。
//
// 🟥 **なぜ静的側が要るか**: 「開いた story がある」ことは**動的には測れない**——
//    **story を書かなければ、検査すべき対象が存在しないから。**
//    `src/stories/opened.ts`（動的側）は「書いた主張が真か」しか言えない。
//    ★ **片方だけだと、この repo が 17 回踏んだ形をそのまま再生産する。**
//
// 🟥 **この検査自身が「対象 0 件で緑」にならないようにする**——
//    ① portal を持つ素材が 0 件なら**失敗**（走査が壊れた合図）
//    ② 素材から `data-slot="…-content"` を取り出せなければ**失敗**
//
// 使い方: node tools/opened-overlay-check.mjs
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const UI_DIR = 'src/components/ui';
const STORY_DIR = 'src/stories';

/** 再帰的に .stories.tsx を集める。 */
async function storyFiles(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await storyFiles(path)));
    else if (entry.name.endsWith('.stories.tsx')) out.push(path);
  }
  return out;
}

// ── ① 開閉を持つ部品の一覧を機械が引く ────────────────────────────
// 🟨 判定は「`Primitive.Portal` を使っている」——**portal に出る＝ 閉じている間 DOM を持たない**
//    という、DR-0096 が名指しした性質そのもので引く。名前の一覧を手で持たない。
const uiFiles = (await readdir(UI_DIR)).filter((f) => f.endsWith('.tsx'));
const required = new Map(); // slot -> 素材ファイル
for (const file of uiFiles) {
  const src = await readFile(join(UI_DIR, file), 'utf8');
  if (!/Primitive\.Portal/.test(src)) continue;
  const slots = [...src.matchAll(/data-slot="([a-z-]+-content)"/g)].map(
    (m) => m[1],
  );
  if (slots.length === 0) {
    console.error(
      `🟥 ${file} は Portal を使っているが data-slot="…-content" が見つからない（走査が壊れている）`,
    );
    process.exit(1);
  }
  for (const slot of slots) required.set(slot, file);
}

if (required.size === 0) {
  console.error(
    '🟥 portal を持つ素材が 1 件も見つからない。走査が壊れている（「対象 0 件で緑」の再生産）',
  );
  process.exit(1);
}

// ── ② 主張を含む story があるか ────────────────────────────────
// 🟨 `expectOpened('<slot>')` の**文字列リテラル**を探す。変数に逃がすと検体が消えるので、
//    `src/stories/opened.ts` の JSDoc に「変数に逃がさない」と書いてある。
//
// 🆕 ★★★ 🟥 **2026-08-09（部品5 D11=A）: コメントを先に落とす。**
//    **初版はソースをそのまま grep していたので、JSDoc に書いた `expectOpened('sheet-content')` が
//    主張として数えられた。**実測（部品5 C5-05）——
//    `Sidebar.stories.tsx` の説明文にこの文字列を書いただけで担当が奪われ、
//    🟥 **`Sheet.stories.tsx` の本物の主張を消しても検査は緑のままだった。**
//    ★★ **「無いことを落とす検査」が、書けば通る形だった**——
//    **部品4 C4-04 の「詰まったら」欄が名指しした「grep が当たるかどうかに落ちると脆い」が
//    1 回で現実になった。**
//
//    🟨 **限界も書いておく**: 文字列リテラルの中の `//` や `/* */` も落とす。
//    story ファイルで実害が出るのは URL 等だが、**落とした結果 `expectOpened('…')` が
//    増えることはない**（減る方向にしか効かない）ので、**偽の緑は作らない。**
const stripComments = (src) =>
  src.replaceAll(/\/\*[\s\S]*?\*\//g, '').replaceAll(/\/\/[^\n]*/g, '');

const files = await storyFiles(STORY_DIR);
const claimed = new Map(); // slot -> story ファイル
for (const path of files) {
  const src = stripComments(await readFile(path, 'utf8'));
  for (const m of src.matchAll(/expectOpened\(\s*'([a-z-]+)'\s*\)/g)) {
    if (!claimed.has(m[1])) claimed.set(m[1], path);
  }
}

const missing = [...required.entries()].filter(([slot]) => !claimed.has(slot));

console.log(
  `開閉を持つ素材 ${String(required.size)} 件（Primitive.Portal で判定）`,
);
for (const [slot, file] of required) {
  const story = claimed.get(slot);
  console.log(
    `  ${story === undefined ? '🟥' : '🟦'} ${slot.padEnd(24)} ${file.padEnd(20)} ${story ?? '**開いた story が無い**'}`,
  );
}

// 🟨 主張はあるが素材が無い＝ 素材の rename に story が追随していない合図。
const orphan = [...claimed.keys()].filter((slot) => !required.has(slot));
if (orphan.length > 0) {
  console.log(`\n🟨 素材に対応が無い主張: ${orphan.join(', ')}`);
}

if (missing.length > 0) {
  console.error(
    `\n🟥 開いた story を持たない部品が ${String(missing.length)} 件: ${missing.map(([s]) => s).join(', ')}`,
  );
  console.error(
    '   閉じた overlay は DOM を持たないので、面①・面②・面④ が全部「対象 0 件で緑」になる（DR-0096）。',
  );
  process.exit(1);
}

console.log('\n🟦 全件が「開いた story」を持っている');
