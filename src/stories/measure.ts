// 完成バー 面④（語彙の効果）の測り方 — 部品1 B1-06b（2026-08-09）
//
// 🟥 **なぜ共通化するか**: 13 部品に同じ形を手で書くと、**1 箇所ずつ違う抜け方**をする。
//    とくに `?.` は危ない——`root.querySelector(…)?.getBoundingClientRect().width` は
//    **要素が無いと `undefined` を返し、`expect(undefined).not.toBe(...)` が通る。**
//    これは「対象 0 件で緑」の play 版。**見つからなければ throw する**形に閉じる。
//
// 🟥 **`waitFor` は各 story 側に置く**（ここには置かない）。
//    CSS が当たる前に読むと素の HTML の値が出る（[DR-0094]）——**待つのは呼ぶ側の責任**で、
//    ここで隠すと「待っているつもりで待っていない」が起きたときに追えなくなる。

/** `data-testid` で 1 件だけ引く。**無ければ throw**（undefined を返さない）。 */
export const el = (root: HTMLElement, testId: string): HTMLElement => {
  const found = root.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
  if (found === null) {
    throw new Error(`面④: [data-testid="${testId}"] が描画されていない`);
  }
  return found;
};

/** 実効スタイル（`getComputedStyle`）。 */
export const styleOf = (
  root: HTMLElement,
  testId: string,
): CSSStyleDeclaration => getComputedStyle(el(root, testId));

/** 実寸（`getBoundingClientRect`）。 */
export const boxOf = (root: HTMLElement, testId: string): DOMRect =>
  el(root, testId).getBoundingClientRect();

/**
 * ★★★ **クラスではなくトークンと突き合わせる。**
 *
 * 🟥 **story に `'6px'` と生値を書いてはいけない**（B1-06b で実際に踏んだ）。
 *    `tokens.css` の宣言を読んで `--spacing-inline-sm` = `calc(--spacing * 1.5)` = 6px と
 *    書いたら、実効値は **4px** だった——**`tmp-admin.css` が `:root:root` の詳細度で
 *    上書きしている**（[DR-0005](../../docs/DR/DR-0005-token-ownership-and-two-stage.md)
 *    「値は tmp-admin を引き継ぐ」＝ **仕様どおり**）。
 *    ★ **生値を書くと、二重管理を 1 つ増やしたうえで、手5 のトークン差し替えのたびに
 *    story が壊れる**——**差し替えられることこそがこの repo の主目的**（[DR-0078]）なのに。
 *
 * → **主張を「このクラスはこのトークンを指している」に絞る。**
 *    値そのものの妥当性は ① 層の話であって面④ の話ではない。
 *
 * 🟨 `getPropertyValue` は**宣言のまま**返す（`calc(var(--spacing) * 1.5)` のことがある）ので、
 *    probe に載せて**計算後**の値を読む。
 */
const resolveRaw = (customProperty: string): string => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(customProperty)
    .trim();
  if (raw === '') {
    throw new Error(`面④: ${customProperty} が :root で解決できない`);
  }
  return raw;
};

const withProbe = <T>(
  root: HTMLElement,
  apply: (probe: HTMLElement) => void,
  read: (style: CSSStyleDeclaration) => T,
): T => {
  const probe = document.createElement('span');
  probe.style.position = 'absolute';
  probe.style.visibility = 'hidden';
  apply(probe);
  root.appendChild(probe);
  const value = read(getComputedStyle(probe));
  probe.remove();
  return value;
};

/** 長さトークン（`--spacing-*` / `--container-*` / `--text-*`）の実効値。 */
export const resolveLength = (
  root: HTMLElement,
  customProperty: string,
): string =>
  withProbe(
    root,
    (probe) => {
      probe.style.display = 'block';
      probe.style.width = resolveRaw(customProperty);
    },
    (style) => style.width,
  );

/** 色トークン（`--color-*`）の実効値。`color` と同じ形式に正規化して返す。 */
export const resolveColor = (
  root: HTMLElement,
  customProperty: string,
): string =>
  withProbe(
    root,
    (probe) => {
      probe.style.color = resolveRaw(customProperty);
    },
    (style) => style.color,
  );
