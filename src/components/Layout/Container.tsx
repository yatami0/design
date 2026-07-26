// 製品層 Layout — 最大幅と中央寄せ。手3 D11=A（DR-0032）
//
// 🟥 **Q1 の答えが出た場所。**書こうとして初めて「最大幅の語彙が無い」ことが分かり、
//    tokens.css に --container-content / --container-wide / --spacing-gutter を新設した。
import type * as React from 'react';

import { cn } from '@/lib/utils';

import { WIDTH, type NoStyleProps, type Width } from './tokens';

export interface ContainerProps extends NoStyleProps {
  width?: Width;
  /** 画面端の余白（--spacing-gutter）を入れるか。 */
  gutter?: boolean;
}

export function Container({
  width = 'content',
  gutter = true,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn('mx-auto w-full', WIDTH[width], gutter && 'px-gutter')}
      {...props}
    />
  );
}
