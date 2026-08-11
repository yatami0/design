'use client';

// 製品層（自作）— 期間セレクタ（工程3 D3=C / D13=A・Q2 の検体）
//
// 🟥 **有限語彙と無限集合が同居する初めての props。**語彙（preset の union）を閉じる代わりに、
//    逃げ道（`custom` ＋ range）を**同じ部品の中に対で持つ**（DR-0063: 禁止は代替と対でしか効かない）。
// 🟥 **プリセットが実際にいつからいつまでかは知らない。**「今週」の起点・四半期の定義は
//    題材の知識（src/redmine/period.ts の対応表）。コアは語彙と器だけ。
// 🟨 範囲の入力を内蔵するのは D13=A——外に出すと
//    「語彙は部品・逃げ道は画面」に割れ、画面ごとの再発明が起きる。
//
// ★★ 🆕 **部品3 C3-04（2026-08-09）: 内蔵の中身が Popover ＋ Calendar の手組みから
//    `DatePicker` に替わった**（D6=A・Q2）。**D13=A の判断は変えていない**——
//    「範囲の入力はこの部品が持つ」は据え置きで、**持ち方が手組みから部品の利用に変わった**だけ。
//    🟥 **D13=A が想定していた選択肢は「部品が内蔵する / 画面が組む」の 2 つ**で、
//    **「部品が別の部品を使う」は選択肢に無かった**（外に出す先が画面しかなかったため）。
import { DatePicker, type DateRange } from '@/components/Selection/DatePicker';
import { Inline } from '@/components/Layout/Inline';
import { type FieldWidth } from '@/components/Layout/tokens';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Selection/Select';

/**
 * 期間の語彙（有限集合）。`custom` が逃げ道。
 * 🟨 `all`（絞らない）は最初の利用者（チケット一覧・P3-07）が要求して 1 語増えた——
 *    一覧は「期間で絞らない」が既定で、EVM / 稼働表では「全期間」として意味を持つ（Q2 の実測）。
 */
export const PERIOD_PRESETS = [
  'all',
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
  all: '全期間',
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
  /**
   * 支援技術に読ませる名前。既定は「期間」。
   * 🟥 **既定を持つ理由**: `role="combobox"` は**内容から名前を取らない**ので、
   *    トリガに「今週」と見えていても名前は空になる（部品1 B1-05 の実測）。
   *    **単体で置いても壊れない**のが自己完結した製品層の部品の責務（DR-0070）。
   *    `FilterField` などが別の見出しを付けるときだけ上書きする。
   */
  'aria-label'?: string;
}

export function PeriodSelect({
  value,
  onValueChange,
  range,
  onRangeChange,
  width = 'md',
  'aria-label': ariaLabel = '期間',
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
        <SelectTrigger width={width} aria-label={ariaLabel}>
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
        <DatePicker
          mode="range"
          {...(range === undefined ? {} : { value: range })}
          onValueChange={(next: DateRange) => {
            onRangeChange?.(next);
          }}
        />
      )}
    </Inline>
  );
}
