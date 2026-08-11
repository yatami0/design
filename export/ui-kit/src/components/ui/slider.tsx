import * as React from "react"
import { Slider as SliderPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

// 🟥 **部品2 D8=A で手を入れた 1 ファイル**（2026-08-09）。素材層の diff 0 行は
//    8 手＋工程0〜4 の連続記録だったが、ここで初めて破った。理由は 2 つとも
//    **上書きの口が無く、製品層からは塞げなかったから**（docs/手順/部品2_9カテゴリの充足.md D8）:
//      ① `aria-label` が Root に載るだけで thumb に届かない（axe `aria-input-field-name`）
//      ② thumb が `bg-white`（テーマを持たない不透明色。`.dark` でも白のまま）
//    🟦 変更は下の 2 箇所だけ。他は shadcn が吐いたまま。
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  "aria-label": ariaLabel,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-vertical:h-full data-vertical:min-h-40 data-vertical:w-auto data-vertical:flex-col",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative grow overflow-hidden rounded-full bg-muted data-horizontal:h-1 data-horizontal:w-full data-vertical:h-full data-vertical:w-1"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute bg-primary select-none data-horizontal:h-full data-vertical:w-full"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          // 変更 ①: 名前が要るのは `span[role="slider"]`（= thumb）のほう。
          //   Radix の既定は摘み 1 つだと undefined、2 つだと英語の Minimum / Maximum。
          //   ここでは渡された名前を使い、複数のときだけ機械的な添字を足す。
          aria-label={
            ariaLabel === undefined || _values.length === 1
              ? ariaLabel
              : `${ariaLabel} (${String(index + 1)}/${String(_values.length)})`
          }
          // 変更 ②: bg-white → bg-background（テーマに追随する面色）
          className="relative block size-3 shrink-0 rounded-full border border-ring bg-background ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 disabled:pointer-events-none disabled:opacity-50"
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
