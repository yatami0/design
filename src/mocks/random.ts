// 工程2 — 決定論的な乱数（手順書 D5=B）。
//
// 🟥 **`Math.random()` も `Date.now()` も使わない。**story が実行のたびに変わると
//    見た目の比較ができず、[DR-0076](../../docs/DR/DR-0076-capture-the-run-not-just-the-output.md)
//    が問題にした「観測の揺れ」を自分で作ることになる。
// 🟥 **faker は入れない。**外部依存を増やす判断は工場の段取り §2 (b) と同じ重さがあり、
//    この工程では負わない。要るのは 10 行の線形合同法だけ。

/** 線形合同法（Numerical Recipes の係数）。同じ seed からは必ず同じ列が出る。 */
export function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

/** 0 以上 max 未満の整数。 */
export function randomInt(rng: () => number, max: number): number {
  return Math.floor(rng() * max);
}

/** 配列から 1 つ選ぶ。空配列は設定ミスなので投げる（黙って undefined を返さない）。 */
export function pick<T>(rng: () => number, values: readonly T[]): T {
  const value = values[randomInt(rng, values.length)];
  if (value === undefined) {
    throw new Error('pick: 空の配列からは選べない');
  }
  return value;
}

/** `YYYY-MM-DD` に日数を足す。基準日は定数で渡す（現在時刻を読まない）。 */
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 2 つの日付の差（日数）。 */
export function diffDays(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00Z`).getTime();
  const b = new Date(`${to}T00:00:00Z`).getTime();
  return Math.round((b - a) / 86_400_000);
}

/** 土日か。🟥 **祝日は Redmine の API に無い**（データモデル §4 ④）。 */
export function isWeekend(date: string): boolean {
  return [0, 6].includes(new Date(`${date}T00:00:00Z`).getUTCDay());
}

/** `YYYY-MM-DD` を Redmine の timestamp 形式にする。 */
export function atNoon(date: string): string {
  return `${date}T12:00:00Z`;
}
