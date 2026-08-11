// 製品層 Layout — 手3 D11=A（DR-0032）
//
// 🟨 **逃げ道はここ 1 つだけ。**他の Layout 部品は className / style を受け取らない。
//    Braid Design System の作法（上位部品は style 上書きを受けず、Box だけが例外）と同型。
//    🟥 逃げ道が広がると枠が形骸化するので、**Box の使用箇所数を実行記録に残す**。
import type * as React from 'react';

import { cn } from '@/lib/utils';

import { INSET, type Inset } from './tokens';

export interface BoxProps extends React.ComponentProps<'div'> {
  /** 面の内側（padding）。semantic な用途名のみ。 */
  inset?: Inset;
}

export function Box({ inset = 'none', className, ...props }: BoxProps) {
  return <div className={cn(INSET[inset], className)} {...props} />;
}
