'use client';

// 製品層（自作）— 期間セレクタ（工程3 D3=C / D13=A・Q2 の検体）
//
// 🟥 **有限語彙と無限集合が同居する初めての props。**語彙（preset の union）を閉じる代わりに、
//    逃げ道（`custom` ＋ range）を**同じ部品の中に対で持つ**（DR-0063: 禁止は代替と対でしか効かない）。
// 🟥 **プリセットが実際にいつからいつまでかは知らない。**「今週」の起点・四半期の定義は
//    題材の知識（src/redmine/period.ts の対応表）。コアは語彙と器だけ。
// 🟨 範囲の入力（Popover ＋ Calendar）を内蔵するのは D13=A——外に出すと
//    「語彙は部品・逃げ道は画面」に割れ、画面ごとの再発明が起きる。
import { format } from 'date-fns';

import { Button } from '@/components/Action/Button';
import { Inline } from '@/components/Layout/Inline';
import { type FieldWidth } from '@/components/Layout/tokens';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/Overlay/Popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Selection/Select';
import { Calendar } from '@/components/ui/calendar';

/** 期間の語彙（有限集合）。`custom` が逃げ道。 */
export const PERIOD_PRESETS = [
  'thisWeek',
  'thisMonth',
  'thisQuarter',
  'custom',
] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

function isPeriodPreset(value: string): value is PeriodPreset {
  return (PERIOD_PRESETS as readonly string[]).includes(value);
}

/** 期間の実体。`custom` のときだけ部品の外から与える。 */
export interface PeriodRange {
  from: Date;
  to: Date;
}

const PRESET_LABEL: Record<PeriodPreset, string> = {
  thisWeek: '今週',
  thisMonth: '今月',
  thisQuarter: '今四半期',
  custom: '期間を指定',
};

export interface PeriodSelectProps {
  value: PeriodPreset;
  onValueChange: (value: PeriodPreset) => void;
  /** `custom` のときの範囲。それ以外の値では無視される。 */
  range?: PeriodRange;
  onRangeChange?: (range: PeriodRange) => void;
  /** トリガの幅。語彙は `--container-field-*`（SelectTrigger と同じ口）。 */
  width?: FieldWidth;
}

export function PeriodSelect({
  value,
  onValueChange,
  range,
  onRangeChange,
  width = 'md',
}: PeriodSelectProps) {
  return (
    <Inline gap="sm">
      <Select
        value={value}
        onValueChange={(next) => {
          // 語彙の外は型だけでなく実行時にも通さない（Radix は string で返してくる）
          if (isPeriodPreset(next)) onValueChange(next);
        }}
      >
        <SelectTrigger width={width}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_PRESETS.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {PRESET_LABEL[preset]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">
              {range
                ? `${format(range.from, 'yyyy-MM-dd')} 〜 ${format(range.to, 'yyyy-MM-dd')}`
                : '範囲を選ぶ'}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(next) => {
                if (next?.from && next.to) {
                  onRangeChange?.({ from: next.from, to: next.to });
                }
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    </Inline>
  );
}
