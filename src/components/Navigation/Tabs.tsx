// 製品層（素通しの再輸出）— 工程3 D4=B / 手3 D1=(c) / D2=A
// 既定値の上書きが要らない部品は、窓口を 1 本にするためだけに通す。
// 画面と story はここから import する（D3=B・no-restricted-imports で強制）。
// 🟨 `tabsListVariants`（cva の実体）は通さない——variants の合成はコアの内部実装で、
//    外に出すと className の逃げ道になる（DR-0071 の「閉じた製品層」を保つ）。
export { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
