// 製品層（配線）— 手3 D10=A（DR-0037）
//
// **Provider は「部品」ではなく「部品が動くための前提条件」。**
// 前提条件はその部品を供給する層が面倒を見るべきで、使う側に押し付けない。
// だから役割 9 カテゴリのどれにも属さず、製品層の直下に置く。
//
// アプリ層は `<AppProviders>` を 1 つ書くだけでよい（Provider hell を作らない）。
// 🟨 中身が増えるのは手4（Patterns / Templates）。ここでは場所を確定させるだけ。
import type * as React from 'react';

import { SidebarProvider } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider>{children}</SidebarProvider>
    </TooltipProvider>
  );
}
