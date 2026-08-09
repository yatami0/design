// 完成バー — 「開いた」ことの主張（部品4 C4-04・2026-08-09・D4=C の**動的側**）
//
// ★★★ 🟥 **なぜ要るか**: 閉じた overlay は DOM を持たないので、
//    面①（描画された）も 面②（a11y）も 面④（語彙の効果）も **全部「対象 0 件で緑」になる**
//    （[DR-0096](../../docs/DR/DR-0096-overlays-that-no-story-opens-are-invisible-to-every-check.md)）。
//    🟥 **`Popover` は工程3 から 2 日間、名前の無い `role="dialog"` を出荷していた。**
//
// 🟥 **主張を書くだけでは閉じない。**「開いた story がある」ことは動的には測れない——
//    **story を書かなければ、検査すべきものが存在しないから。**
//    → **2 段にする**: 本ファイル（動的＝ 主張が真か）＋ `tools/opened-overlay-check.mjs`（静的＝ 主張があるか）。
//    ★ **片方だけだと、この repo が 17 回踏んだ形をそのまま再生産する**——
//    静的だけなら「書いてあるが開いていない」を通し（面① が実際にそうだった）、
//    動的だけなら「書かなければ 0 件で緑」になる。
//
// 🟥 **`?.` を使わない**（[バー §5](../../docs/部品の完成バー.md)）——
//    `document.querySelector(…)?.…` は要素が無いと `undefined` を返し、**expect が通ってしまう。**
import { expect, userEvent, waitFor } from 'storybook/test';

/**
 * **portal に出た中身が実在し、大きさを持っている**ことを主張する。
 *
 * @param slot 素材層の `data-slot` をそのまま書く（例: `'dropdown-menu-content'`）。
 *   🟥 **ここに書いた文字列が静的側の検体になる**（`tools/opened-overlay-check.mjs` が
 *   素材層の `data-slot="…-content"` と突き合わせる）。**変数に逃がさない。**
 * @returns 開いた中身の要素（さらに主張を重ねたいとき用）
 */
export const expectOpened = async (slot: string): Promise<HTMLElement> => {
  const selector = `[data-slot="${slot}"]`;

  // 🟥 **待つ。**portal は click の同期処理では出ない（[DR-0094] と同じ形の罠）。
  await waitFor(async () => {
    await expect(document.querySelectorAll(selector).length).toBe(1);
  });

  const found = document.querySelector<HTMLElement>(selector);
  if (found === null) {
    throw new Error(
      `開いた story: ${selector} が document に無い（トリガは動いたが中身が出ていない）`,
    );
  }

  // 🟥 **「在る」だけでは足りない**——面① と同じ判定（大きさ 0 は描かれていないのと同じ）。
  const box = found.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) {
    throw new Error(
      `開いた story: ${selector} は document に在るが大きさが 0（${String(box.width)}×${String(box.height)}）`,
    );
  }

  return found;
};

/**
 * トリガを引いて開く。**`element.click()` を使わない**——
 * 🟥 **Radix `Select` は `pointerdown` で開く**ので、生の `click()` では開かない（実測・C4-02）。
 * `userEvent` はポインタ列（pointerdown → mousedown → … → click）を発火する。
 */
export const triggerOf = (root: HTMLElement, slot: string): HTMLElement => {
  const found = root.querySelector<HTMLElement>(`[data-slot="${slot}"]`);
  if (found === null) {
    throw new Error(
      `開いた story: トリガ [data-slot="${slot}"] が描画されていない`,
    );
  }
  return found;
};

/**
 * ★★★ 🟥 **axe が測れなかったものを測る**（部品4 D7=C・2026-08-09）。
 *
 * **背景**: modal な overlay を開くと Radix は `hideOthers()` で **document の残り全部に
 * `aria-hidden="true"` を付ける**。その中にはトリガ（focusable）が残るので、
 * axe は **`aria-hidden-focus`（serious）** を出す。
 *
 * 🟥 **これは検査器の限界であって部品の欠陥ではない**——
 * `axe-core@4.12.1` の `isModalOpen()` は **`dialog, [role=dialog], [aria-modal=true]` しか見ない**（ソース実測）。
 * `role="menu"`（`DropdownMenu`）と `role="listbox"`（`Select`）は modal と認識されない。
 * 🟨 **`Sheet` は `role="dialog"` なので認識されるが、今度は判定を放棄して `incomplete` になる**
 * ＝ **どちらにしても axe は「閉じ込められているか」を答えていない。**
 *
 * ★★ **だから rule を外すなら、引き換えにこれを測る。**
 * **外すだけなら「消した」**——[部品1 D3](../../docs/手順/部品1_完成バーを機械で閉じる.md) が
 * `color-contrast` を外したときも、**数える場所を移した**のであって消してはいない。
 *
 * @param content `expectOpened` が返した「開いた中身」
 */
export const expectFocusTrapped = async (
  content: HTMLElement,
): Promise<void> => {
  const inside = () =>
    document.activeElement !== null && content.contains(document.activeElement);

  // ① 開いた直後、フォーカスは中身の中にある
  await waitFor(async () => {
    await expect(inside()).toBe(true);
  });

  // ② Tab を打っても外へ出ない（＝ `aria-hidden` の側には到達できない）
  //    🟨 3 回で足りる根拠: 実測で `DropdownMenu` / `Select` / `Sheet` とも
  //       1 回目から中身に留まる。回数を増やしても情報が増えない。
  for (let i = 0; i < 3; i++) {
    await userEvent.tab();
    await expect(inside()).toBe(true);
  }
};

/**
 * 🟥 **`aria-hidden-focus` を story 単位で外すための parameters**（D7=C）。
 * **必ず `expectFocusTrapped` と対で使う。**片方だけなら、それは無効化ではなく削除。
 */
export const FOCUS_TRAPPED_A11Y = {
  a11y: { options: { rules: { 'aria-hidden-focus': { enabled: false } } } },
};
