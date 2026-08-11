// 製品層 Layout — 縦積み。手3 D11=A（DR-0032）
import type * as React from 'react';

import { cn } from '@/lib/utils';

import {
  ALIGN,
  INSET,
  STACK_GAP,
  type Align,
  type Inset,
  type NoStyleProps,
  type StackGap,
} from './tokens';

export interface StackProps extends NoStyleProps {
  /** 縦の要素間。--spacing-stack-* だけを取る。 */
  gap?: StackGap;
  /** 面の内側。 */
  inset?: Inset;
  align?: Align;
}

export function Stack({
  gap = 'md',
  inset = 'none',
  align = 'stretch',
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        STACK_GAP[gap],
        INSET[inset],
        ALIGN[align],
      )}
      {...props}
    />
  );
}
