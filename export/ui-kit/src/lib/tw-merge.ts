// ① Tokens 層の語彙を tailwind-merge に教える。
//
// なぜ要るか（実測で分かった）:
//   `cn()` = clsx + twMerge。twMerge は **既定のスケールに無い値を「幅クラス」だと判定できない**。
//   `twMerge('w-fit w-field-md')` は **両方を残す**（対照: `w-fit w-full` / `w-fit w-48` /
//   `w-fit w-[192px]` はいずれも畳む）。両方が同じ詳細度で当たるので、
//   あとは CSS の出力順で決まり——**`w-fit` が勝つ**。
//
//   → 素材層が `cn("… w-fit …", className)` と書いている部品では、
//     製品層が語彙クラスを className で渡しても **無言で無効になる**。
//     `SelectTrigger` の `width` prop（手8d H8D-04）は 3 語とも一度も効いていなかった。
//
// 🟥 これは「対象 0 件で緑」の prop 版。**prop は存在し、型も通り、lint も緑で、作用だけが無い。**
//
// 🟨 ここが tokens.css @theme の写しである以上、**二重管理になる**。
//    語彙を足したらここにも足す（漏れると「効かない prop」が静かに増える）。
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * tokens.css の `@theme` が宣言している用途名。名前空間 → twMerge の theme キー:
 *   `--spacing-*`     → spacing（p / m / gap / w / h / size …）
 *   `--container-*`   → container（w / max-w）
 *   `--color-*`       → color（bg / text / border / ring …）
 *   `--text-*`        → text（font-size）
 *   `--font-weight-*` → font-weight
 *
 * 🟥 `--card-spacing` は @theme の外（component token の向け替え・DR-0036）なので対象外。
 */
export const TOKEN_SCALES = {
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

/**
 * 語彙を教え込んだ twMerge。`cn()` はこれを使う。
 * 🟨 `extend`（既定に足す）であって `override` ではない——shadcn の素の値は生かす。
 */
export const twMerge = extendTailwindMerge({ extend: { theme: TOKEN_SCALES } });
