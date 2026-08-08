// 製品層（素通しの再輸出）— 工程4 D6/D8 / 手3 D1=(c) / D2=A
// 既定値の上書きが要らない部品は、窓口を 1 本にするためだけに通す。
// 画面と story はここから import する（D3=B・no-restricted-imports で強制）。
//
// 🟨 工程4 D8=B: 保存の成否は**画面内のインライン表示**で見せる。Toast は採らない——
//    shadcn の `sonner` が `next-themes` を引き、工程1 で外した Next が戻るため
//    （実測は docs/実行記録.md §工程4 P4-01）。需要が消えたわけではないので、
//    「今は作らない理由」として残す（DR-0077 後の様式＝回数ではなく中身の理由）。
// 🟨 `alertVariants`（cva の実体）は通さない——variants の合成はコアの内部実装で、
//    外に出すと className の逃げ道になる（DR-0071 の「閉じた製品層」を保つ）。
export { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
