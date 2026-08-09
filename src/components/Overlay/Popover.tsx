// 製品層 — 手3 D1=(c) / D2=A
// 画面と story はここから import する（D3=B・no-restricted-imports で強制）。
//
// ★★★ 🆕 **部品3 C3-03（2026-08-09・D10=B）: 素通しから昇格した 2 件目**（1 件目は `Select`）。
//
// 🟥 **発端は完成バーの面②**——`DatePicker/Open` が **`aria-dialog-name`** で落ちた。
//    `PopoverContent` は Radix の `role="dialog"` を出すが、**名前を 1 つも持たない。**
//    ★ **`Popover` を開く story がこれまで 1 本も無かった**（`Popover/Default` は閉じたまま、
//    `PeriodSelect/Custom` も開かない）＝ **閉じた popover は DOM を持たず axe の対象が 0 件。**
//    🟥 **「対象 0 件で緑」の 17 例目**——工程3 から出荷していた部品が、一度も測られていなかった。
//
// 🟥 **名前に既定を持てない**（中身を決めるのは使う側）ので、**型で要求する**——
//    `aria-label` を必須にし、**書き忘れを `tsc` が落とす**（面⑤「型の閉じ」）。
//    ★ **文書に「名前を付けること」と書くのは 16 回踏んだ形。**
// 🟦 **素材層（src/components/ui/popover.tsx）は 1 行も触らない**（`Select.tsx` と同じ手）。
import type * as React from 'react';

import { PopoverContent as UiPopoverContent } from '@/components/ui/popover';

// 素通しの再輸出（`export *` を明示列挙に割った＝ `Select.tsx` D3=A と同じ）。
// 🟨 上流が部品を増やしたらここに足す。窓口を 1 本に保つための手間（手3 D2=A）。
export {
  Popover,
  PopoverAnchor,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';

export interface PopoverContentProps extends Omit<
  React.ComponentProps<typeof UiPopoverContent>,
  'aria-label'
> {
  /**
   * 🟥 **必須。**`role="dialog"` は**内容から名前を取らない**ので、
   * 書かないと支援技術に「ダイアログ」としか読まれない（axe `aria-dialog-name`・serious）。
   * 🟨 `PopoverTitle` を置いても解決しない——上流の `PopoverTitle` は `data-slot` 付きの
   * `<div>` で、`aria-labelledby` を配線していない（実測・2026-08-09）。
   */
  'aria-label': string;
}

export function PopoverContent(props: PopoverContentProps) {
  return <UiPopoverContent {...props} />;
}
