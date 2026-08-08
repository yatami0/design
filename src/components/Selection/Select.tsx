'use client';

// 製品層（既定値ラッパー）— 手8d H8D-04（設計 §3.1・判定規則 DR-0070 の ①Yes ②Yes）
//
// 🟥 **素通しから昇格した最初の 1 件。**6 周とも同じ場所で幅が className に書かれた
//    （r1 `w-48` → r3/r6 `w-field-md` → r4/r5 は DSL の `class=` 事故）。
//    → 幅を **prop で引き取り、`className` は型から消す**（Polaris `Box` の padding と同型）。
//
// 🟦 **昇格させるのは `SelectTrigger` だけ。**他のパーツは引き取るべき見た目の選択が
//    まだ 1 つも特定できていない（逸脱の実測 0 回）ので素通しのまま再輸出する。
//    設計 §2「作らないもの」。🆕 回数は判断の条件ではない（DR-0077）。
// 🟥 素材層（src/components/ui/select.tsx）は 1 行も触らない。
import type * as React from 'react';

import {
  SelectContent as UiSelectContent,
  SelectTrigger as UiSelectTrigger,
} from '@/components/ui/select';

import { FIELD_WIDTH, type FieldWidth } from '@/components/Layout/tokens';

// 素通しの再輸出（`export *` を明示列挙に割った＝手8d D3=A）。
// 🟨 上流が部品を増やしたらここに足す。窓口を 1 本に保つための手間（手3 D2=A）。
export {
  Select,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectValue,
} from '@/components/ui/select';

export interface SelectTriggerProps extends Omit<
  React.ComponentProps<typeof UiSelectTrigger>,
  'className'
> {
  /**
   * フィールドの幅。語彙は `--container-field-*`（DR-0061）。
   * 未指定は上流の既定（内容なり＝`w-fit`）。
   */
  width?: FieldWidth;
}

// className: 🟥 受けない（Omit で型から消す）。
//   幅以外の見た目の需要が 2 回出たら、そのとき語彙を足す（規則①）。
export function SelectTrigger({ width, ...props }: SelectTriggerProps) {
  return (
    <UiSelectTrigger
      {...(width === undefined ? {} : { className: FIELD_WIDTH[width] })}
      {...props}
    />
  );
}

// ── リストの位置決め（DR-0089）─────────────────────────────────────
// 🟥 **prop を作らない。**「ドロップダウンはアンカーに重ねない」は工場の規定であって
//    画面ごとの選択ではない。→ `position` と `align` を型から消し、既定を固定する。
//
// 実測（tmp/select-position-probe.mjs・2026-08-08）:
//   ・上流既定の `item-aligned` はトリガ 32px のうち **30px を隠す**（＝重なる）
//   ・`popper` にすると重なりは 0、`align="start"` で左端が **0px 一致**
//   ・上流既定の `align="center"` は popper だと **左へ 6px はみ出す**
//     （item-aligned では align 自体が無視されるので、これまで一度も作用していなかった）
export type SelectContentProps = Omit<
  React.ComponentProps<typeof UiSelectContent>,
  'className' | 'position' | 'align'
>;

export function SelectContent(props: SelectContentProps) {
  return <UiSelectContent position="popper" align="start" {...props} />;
}
