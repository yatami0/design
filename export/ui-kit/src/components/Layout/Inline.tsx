// 製品層 Layout — 横並び。手3 D11=A（DR-0032）
//
// 🟨 思想の欠落リスト（部品カタログ 表3）には無いが、Stack だけでは横方向が組めず
//    実装中に必要になった。**足した事実を Q1 の観測として記録する。**
import type * as React from 'react';

import { cn } from '@/lib/utils';

import {
  ALIGN,
  INLINE_GAP,
  INSET,
  JUSTIFY,
  type Align,
  type InlineGap,
  type Inset,
  type Justify,
  type NoStyleProps,
} from './tokens';

export interface InlineProps extends NoStyleProps {
  gap?: InlineGap;
  inset?: Inset;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
}

export function Inline({
  gap = 'md',
  inset = 'none',
  align = 'center',
  justify = 'start',
  wrap = false,
  ...props
}: InlineProps) {
  return (
    <div
      className={cn(
        'flex',
        wrap && 'flex-wrap',
        INLINE_GAP[gap],
        INSET[inset],
        ALIGN[align],
        JUSTIFY[justify],
      )}
      {...props}
    />
  );
}
