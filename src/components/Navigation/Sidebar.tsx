// 製品層（既定値ラッパー）— 手3 D1=(c) / D6=A（DR-0035）/ D7（DR-0034）
//
// 🟦 **状態は shadcn のまま使う。**useState / cookie 永続 / Cmd+B / レスポンシブ分岐は
//    1 行も書き写さない（DR-0035）。切り出す動機だった lint は成立せず（赤 17 件のうち
//    11 件は任意値）、React の作法上も layout state を Context で配るのは定石。
//
// 上書きするのは 1 点だけ: **nav-item の min-height を 44px にする**。
// tmp-admin §4.2 が `--touch-min` を名指しで適用している唯一の箇所なので、
// ここは当たり判定ではなく**見た目でも**下限を守る（DR-0034）。
import type * as React from 'react';

import { SidebarMenuButton as UiSidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export * from '@/components/ui/sidebar';

/** nav-item。tmp-admin §4.2「nav-item は min-height `--touch-min`」の受け皿。 */
export function SidebarMenuButton({
  className,
  ...props
}: React.ComponentProps<typeof UiSidebarMenuButton>) {
  return (
    <UiSidebarMenuButton
      className={cn('min-h-(--spacing-touch-min)', className)}
      {...props}
    />
  );
}
