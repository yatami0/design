// 製品層（自作）— 工程4 D6/D7=A（★ Q3 の検体 1/2）
//
// ★ 🟥 **役割 9 カテゴリに席が無い部品の 2 件目**（`Field` に続く・指摘 14）。
//    DataDisplay に置いたのは**由来の一次情報**による——思想は DataDisplay を
//    「Ant / Carbon の Data Display」由来と書いており、**Ant Design は `Descriptions` を
//    `group: Data Display` に置いている**（Table / List と同じ群・実測は実行記録 §工程4 P4-05）。
//
// 🟦 **判定（DR-0070 の見た目の管轄権）**: 「項目名と値をどう並べるか」——段組み・向き・
//    項目名の書式——は**コアの管轄**。何を並べるか（フィールドの選択と順序）は使う側の知識。
// 🟦 **判定（DR-0088 の 2 問）**: ① 他所でも意味が通る（コア候補）→ ② 並べ方の選択は
//    **有限の語で言える**（columns 3 語・orientation 2 語）→ **語彙としてコアが持つ。**
// 🟨 **合成方針 1・4**（製品層の部品設計 §8）: compound を新設せず、**閉じた単一部品 ＋ 宣言的な items**。
//    値は ReactNode を受ける「部品合成の口」（`StatusPill` などを差せる）。className は通さない。
import type * as React from 'react';

import { cn } from '@/lib/utils';

import {
  COLUMNS,
  FIELD_WIDTH,
  INLINE_GAP,
  STACK_GAP,
  type Columns,
} from '../Layout/tokens';

/** 段組みの列数。`Grid` と同じ語彙のうち、記述リストで意味が立つ 3 語だけ取る。 */
export type DescriptionListColumns = Extract<Columns, 1 | 2 | 3>;

/** 項目名と値の向き。 */
export type DescriptionListOrientation = 'vertical' | 'horizontal';

export interface DescriptionListItem {
  /** React の key。 */
  key: string;
  /** 項目名。 */
  term: string;
  /**
   * 値。**部品合成の口**（製品層の部品設計 §8-4）——`StatusPill` などを差してよい。
   * 🟥 className 文字列はこの口を通さない。
   */
  description: React.ReactNode;
}

export interface DescriptionListProps {
  items: DescriptionListItem[];
  /** 段組み。既定は 1 列（狭い面でも壊れない側に倒す）。 */
  columns?: DescriptionListColumns;
  /** 項目名を値の上に置く（vertical）か、左に置く（horizontal）か。 */
  orientation?: DescriptionListOrientation;
}

export function DescriptionList({
  items,
  columns = 1,
  orientation = 'vertical',
}: DescriptionListProps) {
  return (
    <dl className={cn('grid', COLUMNS[columns], STACK_GAP.md)}>
      {items.map((item) => (
        <div
          key={item.key}
          className={
            orientation === 'vertical'
              ? cn('flex flex-col', STACK_GAP.sm)
              : cn('flex', INLINE_GAP.md)
          }
        >
          <dt
            className={cn(
              'text-label text-muted-foreground',
              orientation === 'horizontal' && cn('shrink-0', FIELD_WIDTH.sm),
            )}
          >
            {item.term}
          </dt>
          <dd>{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}
