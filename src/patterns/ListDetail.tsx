'use client';

// ③ Patterns 層 — 一覧 + 詳細（手4 D5）
//
// 🟦 **これは component の足し算では出ない**（→ Q4）。理由:
//   1. **状態の調整**が要る（どの行が選ばれているか）＝ hook との組
//   2. **DataGrid と Sheet という別カテゴリの部品を突き合わせる**規約が本体
//   3. tmp-admin §4.4「行アクション列を持たず、行そのものを押して詳細を右スライドで出す」
//      という**作り方の指針**であって、再利用されるのはコードではなく形
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/Overlay/Sheet';
import { Stack } from '@/components/Layout/Stack';

import type { ListDetail as ListDetailState } from './useListDetail';

export interface ListDetailProps<T> {
  state: ListDetailState<T>;
  /** 一覧側。`state.select` を行クリックに繋ぐのは呼び出し側の責務。 */
  list: React.ReactNode;
  /** 詳細シートの見出し。 */
  title: (item: T) => React.ReactNode;
  /** 詳細シートの中身。 */
  detail: (item: T) => React.ReactNode;
}

export function ListDetail<T>({
  state,
  list,
  title,
  detail,
}: ListDetailProps<T>) {
  return (
    <>
      {list}
      <Sheet open={state.open} onOpenChange={state.onOpenChange}>
        <SheetContent>
          {state.selected !== null && (
            <>
              <SheetHeader>
                <SheetTitle>{title(state.selected)}</SheetTitle>
              </SheetHeader>
              <Stack gap="md" inset="md">
                {detail(state.selected)}
              </Stack>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
