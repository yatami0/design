// 製品層（自作）— 工程4 D6/D7=A（★ Q3 の検体 2/2）
//
// ★ 🟥 **役割 9 カテゴリに席が無い部品の 3 件目**（`Field` / `DescriptionList` に続く・指摘 14）。
//    DataDisplay に置いた根拠は `DescriptionList` と同じ——**Ant Design は `Timeline` を
//    `group: Data Display` に置いている**（実測は実行記録 §工程4 P4-05）。
//
// 🟦 **判定（DR-0088 の 2 問）**: ① 「出来事が時系列に連なる」は他所でも意味が通る（コア候補）→
//    ② **中身は有限の語で言えない**（誰が・いつ・何をしたかは自由）→ **コアは器**。
//    軌道（縦線と点）と、見出し・添え字・本文の**置き場**だけを持つ。
// 🟨 **合成方針 1**（製品層の部品設計 §8）: `Timeline` + `TimelineItem` の compound を作らず、
//    **閉じた単一部品 ＋ 宣言的な events**。`DataGrid` の `columns` と同じ形に揃えた。
// 🟨 **色（tone）は付けていない**——この工程の利用者（変更履歴）が要求していないため
//    （[DR-0077](../../../docs/DR/DR-0077-abolish-the-two-occurrence-rule.md) 後の言い方: 回数ではなく需要が無いのが理由）。
//    要求が出たら `StatusPill` の `StatusTone` を 1 語ずつ昇格させる（DR-0088「語彙は固定ではない」）。
import type * as React from 'react';

import { cn } from '@/lib/utils';

import { STACK_GAP } from '../Layout/tokens';

export interface TimelineEvent {
  /** React の key。 */
  key: string;
  /** 見出し（誰が・何を）。**部品合成の口**——`Link` などを差してよい。 */
  title: React.ReactNode;
  /** 添え字（いつ）。1 行に収まる短い文字列を想定する。 */
  meta?: string;
  /**
   * 添える明細（何が変わったか）を 1 行ずつ。
   * 🟥 **書式（小さく・muted）はここが持つ。**最初は `children` に画面が
   *    `className="text-label"` を書いていた——**合成方針 4「className 文字列は
   *    ReactNode の口を通さない」を自分で破っていた**（工程4 Q4 で 1 件として捕まえた）。
   *    → 口を**文字列の配列**に変えて、書式の管轄をコアへ戻した。
   */
  details?: string[];
  /** 本文（自由なもの）。**部品合成の口。** */
  children?: React.ReactNode;
}

export interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <ol className={cn('flex flex-col', STACK_GAP.md)}>
      {events.map((event) => (
        <li key={event.key} className={cn('flex flex-col', STACK_GAP.sm)}>
          <div className="flex flex-wrap items-center gap-inline-sm">
            <span
              aria-hidden
              className="size-dot shrink-0 rounded-full bg-muted-foreground"
            />
            <span className="font-emphasis">{event.title}</span>
            {event.meta !== undefined && (
              <span className="text-label text-muted-foreground">
                {event.meta}
              </span>
            )}
          </div>
          {event.details !== undefined && event.details.length > 0 && (
            <div className={cn('flex flex-col', STACK_GAP.sm)}>
              {event.details.map((line) => (
                <span key={line} className="text-label text-muted-foreground">
                  {line}
                </span>
              ))}
            </div>
          )}
          {event.children}
        </li>
      ))}
    </ol>
  );
}
