'use client';

// 製品層（自作・合成）— 部品3 C3-02（D2=B / D3=B / D9=A）
//
// ★★ 🟥 **上流に実装が無い初めての部品。**shadcn の `date-picker` は
//    レジストリに存在せず（`https://ui.shadcn.com/r/styles/radix-nova/date-picker.json`
//    = **HTTP 404**・2026-08-09 実測）、docs のレシピ（Popover ＋ Calendar ＋ Button）しかない。
//    → 手3 D1=(c)「**欠落品** ＋ **既定値ラッパー**」のどちらでもない **第 3 の形＝合成**。
//
// 🟥 **`Calendar` 単体は export しない**（D3=B）。`classNames` を 20 個以上受ける
//    設定オブジェクトの塊で、**有限の語で言える形になっていない**——出すと使う側が
//    `classNames` を書き始め、DR-0032（props が主・className は受けない）と衝突する。
//    🟦 `calendar` が出荷物に到達するのはこのファイル経由だけ。
//
// 🟨 **`locale` は器で受ける**（D9=A・Q6）——言語は有限の語では言えない（DR-0088 の問②）。
//    🟥 **ただし既定の文言（`placeholder`）はコアが日本語で持っている**——
//    「単体で置いても壊れない」（DR-0070）を満たすには既定が要り、既定には言語が要る。
//    `PeriodSelect` の `aria-label = '期間'` に続く **2 例目**。実測の扱いは実行記録 §部品3。
//
// 🟥 依存は 1 件も増えていない（K3）——`react-day-picker` / `date-fns` は
//    **工程3 で `calendar` と一緒に `dependencies` に入っていた**（判断の記録なし）。
//    この部品の出荷でその 2 件が「使われる依存」として確定する（D4=A・ユーザー判断 2026-08-09）。
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/Action/Button';
import { FIELD_WIDTH, type FieldWidth } from '@/components/Layout/tokens';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/Overlay/Popover';
import { Calendar } from '@/components/ui/calendar';

/**
 * 選び方の語彙（有限集合）。
 *
 * 🟨 上流 `react-day-picker` は `multiple` も持つが**採らない**——
 *    5 画面のどこにも需要が無く、[完成バー §4](../../../docs/部品の完成バー.md) の
 *    面③ に「対象外」と書く理由すら書けない。**使われないまま語彙を定義する**のは、
 *    語彙が実在することの証明を放棄する形（DR-0077 後の様式＝回数ではなく中身の理由）。
 */
export const DATE_PICKER_MODES = ['single', 'range'] as const;
export type DatePickerMode = (typeof DATE_PICKER_MODES)[number];

/**
 * 範囲の実体。**両端が揃ったときだけ**外へ出す。
 * 🟨 `react-day-picker` の `DateRange` は `to` が optional だが、
 *    **片端だけの範囲は「まだ選んでいない」**であって値ではない（`PeriodRange` と同じ形）。
 */
export interface DateRange {
  from: Date;
  to: Date;
}

/** `Calendar` が受ける locale をそのまま通す（`react-day-picker` を製品層で名指ししない）。 */
type CalendarLocale = React.ComponentProps<typeof Calendar>['locale'];

interface DatePickerCommonProps {
  /** トリガの幅。語彙は `--container-field-*`（`SelectTrigger` と同じ口）。 */
  width?: FieldWidth;
  disabled?: boolean;
  /** 未選択のときの表示。**既定は日本語**（上のコメント参照）。 */
  placeholder?: string;
  /** 曜日名・月名の言語。未指定はブラウザ既定（D9=A）。 */
  locale?: CalendarLocale;
  /**
   * 支援技術に読ませる名前。未指定ならトリガの文言（選択値 or placeholder）が名前になる。
   * 🟦 `role="button"` は**内容から名前を取る**ので、`SelectTrigger`（combobox）と違い
   *    既定を持たなくても空にはならない（部品1 B1-05 の実測との差）。
   */
  'aria-label'?: string;
}

export interface DatePickerSingleProps extends DatePickerCommonProps {
  mode?: 'single';
  value?: Date;
  onValueChange?: (value: Date) => void;
}

export interface DatePickerRangeProps extends DatePickerCommonProps {
  mode: 'range';
  value?: DateRange;
  onValueChange?: (value: DateRange) => void;
}

export type DatePickerProps = DatePickerSingleProps | DatePickerRangeProps;

const PLACEHOLDER: Record<DatePickerMode, string> = {
  single: '日付を選ぶ',
  range: '範囲を選ぶ',
};

const fmt = (date: Date): string => format(date, 'yyyy-MM-dd');

const isRange = (props: DatePickerProps): props is DatePickerRangeProps =>
  props.mode === 'range';

export function DatePicker(props: DatePickerProps) {
  const {
    width,
    disabled = false,
    placeholder,
    locale,
    'aria-label': ariaLabel,
  } = props;
  const mode: DatePickerMode = props.mode ?? 'single';

  const label = isRange(props)
    ? props.value === undefined
      ? undefined
      : `${fmt(props.value.from)} 〜 ${fmt(props.value.to)}`
    : props.value === undefined
      ? undefined
      : fmt(props.value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          data-slot="date-picker-trigger"
          {...(width === undefined ? {} : { className: FIELD_WIDTH[width] })}
          {...(ariaLabel === undefined ? {} : { 'aria-label': ariaLabel })}
        >
          <CalendarIcon aria-hidden="true" />
          {label ?? placeholder ?? PLACEHOLDER[mode]}
        </Button>
      </PopoverTrigger>
      {/* 🟥 D10=B: `role="dialog"` は内容から名前を取らない。トリガの文言を名前に使う */}
      <PopoverContent align="start" aria-label={ariaLabel ?? PLACEHOLDER[mode]}>
        {isRange(props) ? (
          <Calendar
            mode="range"
            {...(props.value === undefined ? {} : { selected: props.value })}
            {...(locale === undefined ? {} : { locale })}
            onSelect={(next) => {
              if (next?.from !== undefined && next.to !== undefined) {
                props.onValueChange?.({ from: next.from, to: next.to });
              }
            }}
          />
        ) : (
          <Calendar
            mode="single"
            {...(props.value === undefined ? {} : { selected: props.value })}
            {...(locale === undefined ? {} : { locale })}
            onSelect={(next) => {
              if (next !== undefined) props.onValueChange?.(next);
            }}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
