// 製品層（既定値ラッパー）— 手3 D1=(c) / 部品2 D8=A
//
// 🟥 **5 件のうち素通しにできなかった 1 件。**バー（面②）が C2-05 で落とした:
//    素材の `Slider` は Root / Track / Range / Thumb を **1 関数の中で閉じて**いて、
//    `<Slider aria-label="…">` は Root の `<span>` に載るだけ。名前が要るのは
//    `span[role="slider"]`（= thumb）のほうなので、**型は受け、lint も story も緑で、
//    作用だけが無かった**＝ [DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md) と同じ形。
//
// 🟥 **製品層で組み直す案（D8=B）は機械が拒んだ。**素材の className をそのまま
//    持ち上げると `size-3`（数値の段）と `transition-[color,box-shadow]`（任意値）が
//    **製品層では違法**になる（手3 D4=B′）。**同じ文字列が素材層では合法で製品層では違法**——
//    直すには ① 層に 12px の語彙を足すことになり、この回が持てる判断ではない。
//    → **素材層を 2 箇所だけ触った**（記録は docs/実行記録.md §部品2）。
//
// 🟦 **ここで `label` を必須にするのは [DR-0070](../../../docs/DR/DR-0070-product-layer-boundary-rule.md)**——
//    **単体で置いても壊れないのが自己完結した部品の責務。**素材側は `aria-label` が
//    optional なままなので、**省いた瞬間に名前の無い slider が出荷できてしまう。**
//    部品1 B1-05 の `PeriodSelect`（既定の `aria-label`）と同じ処置。
import type * as React from 'react';

import { Slider as UiSlider } from '@/components/ui/slider';

export interface SliderProps extends Omit<
  React.ComponentProps<typeof UiSlider>,
  'aria-label' | 'aria-labelledby'
> {
  /**
   * 🟥 **必須。**摘みに付くアクセシブルな名前。
   * 摘みが複数のときは素材側が ` (1/2)` のような添字を足す。
   */
  label: string;
}

export function Slider({ label, ...props }: SliderProps) {
  return <UiSlider aria-label={label} {...props} />;
}
