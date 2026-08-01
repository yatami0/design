// 製品層 Layout の「取れる値」— 手3 D11=A（DR-0032）
//
// 🟥 ここが枠の実体。**props で受けられる値を有限集合にする**ことで、
//    `gap-7`(28px) や `w-99`(396px) が入り込む余地を型の段階で消す。
//    lint（no-restricted-syntax）は補助であって、主はこの union。
//
// クラス名は**静的な文字列**として持つ。テンプレート結合にすると
// Tailwind の静的抽出が効かず、クラスが生成されない。

import type * as React from 'react';

/** 面の内側（padding）。tokens.css の --spacing-inset-* に対応。 */
export const INSET = {
  none: '',
  xs: 'p-inset-xs',
  sm: 'p-inset-sm',
  md: 'p-inset-md',
  lg: 'p-inset-lg',
} as const;
export type Inset = keyof typeof INSET;

/** 縦の要素間（gap）。tokens.css の --spacing-stack-* に対応。 */
export const STACK_GAP = {
  none: '',
  sm: 'gap-stack-sm',
  md: 'gap-stack-md',
  lg: 'gap-stack-lg',
} as const;
export type StackGap = keyof typeof STACK_GAP;

/** 横の要素間（gap）。tokens.css の --spacing-inline-* に対応。 */
export const INLINE_GAP = {
  none: '',
  sm: 'gap-inline-sm',
  md: 'gap-inline-md',
} as const;
export type InlineGap = keyof typeof INLINE_GAP;

/** 縦方向の空き（Spacer の高さ）。 */
export const STACK_SIZE = {
  sm: 'h-stack-sm',
  md: 'h-stack-md',
  lg: 'h-stack-lg',
} as const;
export type StackSize = keyof typeof STACK_SIZE;

/** 段組みの列数。**数ではなく段組みの定義**なので primitive ではない。 */
export const COLUMNS = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  6: 'grid-cols-6',
  12: 'grid-cols-12',
} as const;
export type Columns = keyof typeof COLUMNS;

/** 最大幅。H3-03 で新設した語彙（→ Q1 の答え）。 */
export const WIDTH = {
  content: 'max-w-content',
  wide: 'max-w-wide',
  full: 'max-w-full',
} as const;
export type Width = keyof typeof WIDTH;

/** 交差軸の揃え。値ではなく配置の指定。 */
export const ALIGN = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const;
export type Align = keyof typeof ALIGN;

/** 主軸の配置。 */
export const JUSTIFY = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const;
export type Justify = keyof typeof JUSTIFY;

/**
 * 🟥 逃げ道は `Box` の className 1 箇所だけ（DR-0032）。
 * 他の Layout 部品は className / style を受け取らない型にしてある。
 */
export type NoStyleProps = Omit<
  React.ComponentProps<'div'>,
  'className' | 'style'
>;
