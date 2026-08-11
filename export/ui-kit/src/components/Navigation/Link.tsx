// 製品層（自作）— 手8d H8D-06（設計 §3.4・判定規則 DR-0070 の ①Yes ②Yes）
//
// 🟥 **部品が無いから生 CSS が出ていた面**（④b・4/6 周）。
//    生成物は毎回 `<style>` に `a { color: var(--primary) }` を書いていた。
//
// 🆕 **原因は「誰も色を当てていない」ことだった**——Tailwind Preflight が
//    `a { color: inherit; text-decoration: inherit }` で**リンクの見た目を意図的に剥がす**
//    （"Reset links to optimize for opt-in styling instead of opt-out"）。
//    手8d H8D-01 で、配布 CSS の実物にもこの規則が載っていることを確認済み。
//    → **剥がされた見た目を足し直す部品**がこれ。同じ `<style>` に出ていた
//      `html,body{margin:0}`（面④a）とは**原因が逆**なので、対処も別（そちらは §3.3 の宣言）。
import type * as React from 'react';

import { cn } from '@/lib/utils';

/** 色調。semantic 色 1 語だけを指す（パレット色は書かない）。 */
export type LinkTone = 'primary' | 'muted';

const TONE: Record<LinkTone, string> = {
  primary: 'text-primary',
  muted: 'text-muted-foreground',
};

export interface LinkProps extends Omit<
  React.ComponentProps<'a'>,
  'className' | 'style'
> {
  href: string;
  /** 色調。既定 'primary'。 */
  tone?: LinkTone;
  /** 外部リンク。`target` と `rel` は部品側が付ける。 */
  external?: boolean;
  children: React.ReactNode;
}

// className / style: 🟥 受けない（Omit で型から消す）。
// 🟨 下線のオフセットは当てない（手8d D11=(b)）——`underline-offset-4` は数値の段で、
//    語彙が無い。lint の正規表現には引っかからないが、**通ることと正しいことは別**。
export function Link({
  href,
  tone = 'primary',
  external = false,
  children,
  ...props
}: LinkProps) {
  return (
    <a
      href={href}
      className={cn(TONE[tone], 'hover:underline focus-visible:underline')}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...props}
    >
      {children}
    </a>
  );
}
