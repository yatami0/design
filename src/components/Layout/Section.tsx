// 製品層 Layout — 区画（見出し + 本体）。手3 D11=A（DR-0032）
import type * as React from 'react';

import { cn } from '@/lib/utils';

import { STACK_GAP, type NoStyleProps, type StackGap } from './tokens';

export interface SectionProps extends NoStyleProps {
  /** 見出し。typography も semantic な用途名（--text-heading）だけを使う。 */
  heading?: React.ReactNode;
  gap?: StackGap;
}

export function Section({
  heading,
  gap = 'md',
  children,
  ...props
}: SectionProps) {
  return (
    <section className={cn('flex flex-col', STACK_GAP[gap])} {...props}>
      {heading !== undefined && (
        <h2 className="text-heading font-emphasis text-foreground">
          {heading}
        </h2>
      )}
      {children}
    </section>
  );
}
