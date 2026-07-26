// 製品層 Layout — 明示的な空き。手3 D11=A（DR-0032）
import type * as React from 'react';

import { STACK_SIZE, type NoStyleProps, type StackSize } from './tokens';

export interface SpacerProps extends Omit<NoStyleProps, 'children'> {
  size?: StackSize;
}

export function Spacer({ size = 'md', ...props }: SpacerProps) {
  return <div aria-hidden className={STACK_SIZE[size]} {...props} />;
}
