// 製品層（既定値ラッパー）— 手3 D1=(c) / D7=B+D+F（DR-0034）
//
// 見た目は nova の 32px（h-8）のまま、**当たり判定だけ 44px に広げる**。
//   - Apple HIG は「タップできる面積」を規定しており、見た目のサイズではない（DR-0030）
//   - WCAG 2.2 SC 2.5.8（AA）の 24px は 32px で既に満たしている。44px は SC 2.5.5（AAA）
//   - `pointer: coarse` に限定するので、マウス主体の管理画面では実質ノーコスト
//
// 🟥 素材層（src/components/ui/button.tsx）は 1 行も触らない。
import type * as React from 'react';

import { Button as UiButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * 当たり判定を上下左右に `--spacing-hit-expand`（6px）伸ばす。
 * 32 + 6 * 2 = 44px。値は書かず semantic トークンへの参照だけを持つ。
 */
const HIT_AREA =
  'pointer-coarse:relative pointer-coarse:after:absolute pointer-coarse:after:-inset-(--spacing-hit-expand)';

export function Button({
  className,
  ...props
}: React.ComponentProps<typeof UiButton>) {
  return <UiButton className={cn(HIT_AREA, className)} {...props} />;
}

export { buttonVariants } from '@/components/ui/button';
