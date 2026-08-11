'use client';

// Pattern の振る舞い — 手4 D5
//
// 思想③「この層でも状態を持つ振る舞いは Components 層と同じく hook へ寄せる」に従い、
// **どの行が選ばれているか**を Pattern 本体から切り出す。
// [DR-0035] で Sidebar の state を素材のままにしたのとは別の話——こちらは**自分で書く状態**。
import { useCallback, useState } from 'react';

export interface ListDetail<T> {
  selected: T | null;
  open: boolean;
  select: (item: T) => void;
  onOpenChange: (open: boolean) => void;
}

/**
 * 一覧 + 詳細シートの開閉。
 * 🟦 shadcn の Overlay 部品は制御 props（`open` / `onOpenChange`）を素通しするので、
 *    返り値をそのまま `<Sheet {...}>` に渡せる（[部品カタログ 表4] の結論）。
 */
export function useListDetail<T>(): ListDetail<T> {
  const [selected, setSelected] = useState<T | null>(null);

  const select = useCallback((item: T) => {
    setSelected(item);
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    if (!next) setSelected(null);
  }, []);

  return { selected, open: selected !== null, select, onOpenChange };
}
