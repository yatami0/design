'use client';

// 製品層（🆕 部分ラッパー）— 手3 D1=(c) / D2=A ／ 🆕 工程5 D9=B
//
// 画面と story はここから import する（D3=B・no-restricted-imports で強制）。
//
// ★★★ 🆕 **工程5 D9=B: 素通しの再輸出をやめ、`Table` だけ自層で持つ。**
//
// 🟥 **理由（実測）**: 92 列のピボットで**初めて表が実際に横に溢れ**、
//    完成バーの面②（a11y）が `scrollable-region-focusable`（serious）で赤くなった——
//    **スクロールできる領域が、キーボードでは焦点を得られない**（マウスでしか最後の列に行けない）。
//
// ★★ **これは「対象 0 件で緑」の新しい形。**
//    規則はずっと axe の射程に在り、毎回走っていた。**溢れる DOM が 130 story に 1 つも無かっただけ。**
//    一覧（6 列）も同じ器を使っており、**同じ欠陥を持ったまま 130/130 緑だった。**
//
// 🟥 **なぜ素材層を直さないか**: 素材層 16 ファイルは `shadcn add` の 1 コミット以来
//    **1 度も書き換えられていない**（全ファイル履歴 1 件）。ここで折ると
//    「上流を差し替えたら消える修正」になる。先例は `SelectTrigger` の `width`（手8d）。
//
// 🟨 **代償（射程の外の 4 件目）**: スクロール器は素材層の `Table` の中に閉じ込められていて、
//    `className` は `<table>` へ流れる＝ **製品層から手が届かない。**
//    🟥 **包み直しでは解けない**——外側にもう 1 枚 `overflow-x-auto` を足しても、
//    内側の `table-container` が `w-full` で先に溢れるので、**赤くなるのは内側のまま。**
//    → **器のマークアップ 4 行を写すしかない**（上流更新時のドリフト源。写しはこのファイルだけ）。
import { cn } from '@/lib/utils';

export {
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export interface TableProps extends React.ComponentProps<'table'> {
  /**
   * 横スクロールする器に付ける名前。
   * 🟨 渡すと器が `role="region"` になる（**名前の無いランドマークは作らない**ので、
   *    渡さなければ焦点を得られるだけの器のまま）。
   */
  scrollLabel?: string;
}

/**
 * 表。素材層 `ui/table.tsx` の `Table` の写しに、**キーボードで焦点を得られる器**を足したもの。
 *
 * 🟥 **`tabIndex={0}` は「溢れたときだけ」には付けられない**——
 *    溢れているかは CSS レイアウト後にしか分からず、React は知らない。
 *    **常に付ける**（溢れていない器に焦点が当たるのは無害。逆は到達不能）。
 */
export function Table({ className, scrollLabel, ...props }: TableProps) {
  return (
    <div
      // 🟥 `data-slot` は素材層と同じ名前のまま（面① の紐づけ・dead-class-scan の口）
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
      tabIndex={0}
      {...(scrollLabel === undefined
        ? {}
        : { role: 'region', 'aria-label': scrollLabel })}
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
      />
    </div>
  );
}
