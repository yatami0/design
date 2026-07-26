// 製品層 Layout — 格子。手3 D11=A（DR-0032）
import type * as React from 'react';

import { cn } from '@/lib/utils';

import {
  COLUMNS,
  INSET,
  STACK_GAP,
  type Columns,
  type Inset,
  type NoStyleProps,
  type StackGap,
} from './tokens';

export interface GridProps extends NoStyleProps {
  /** 列数。**値ではなく段組みの定義**なので primitive ではない。 */
  columns?: Columns;
  gap?: StackGap;
  inset?: Inset;
}

export function Grid({
  columns = 1,
  gap = 'md',
  inset = 'none',
  ...props
}: GridProps) {
  return (
    <div
      className={cn('grid', COLUMNS[columns], STACK_GAP[gap], INSET[inset])}
      {...props}
    />
  );
}
