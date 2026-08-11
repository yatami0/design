// 手6 — /design-sync の converter へ渡すライブラリ entry（`cfg.entry`）。
//
// なぜ要るか: converter は「顧客がすでにビルドしたもの」＝ `dist/` をバンドルする設計だが、
// 本 repo は `build: next build` の Next.js アプリで `exports` も `dist/` も持たない。
// → 1 周目は **TS ソースを直接 entry に渡す**（converter の bundler は tsconfig の
//   `paths` を解決するプラグインを持っているので `@/` 形式のまま通る）。
//   実測の経緯は docs/実行記録.md §手6、判断は docs/手順/手6_ClaudeDesignへの同期.md D1。
//
// 🟥 **ここに素材層（`@/components/ui/**`）を直接並べない。**
//    同期範囲は手6 D2＝「① Tokens ＋ 製品層 ＋ ③ ＋ ④」で、素材層 16 件は出さない
//    （出すと手3 D3=B「画面は製品層しか見ない」が境界の向こうで破れる）。
//    素材層は製品層の内部実装としてバンドルには入るが、**export はしない**。

// ── ② 製品層・ラッパー ──────────────────────────────────────────
export { Button, buttonVariants } from '@/components/Action/Button';
// Sidebar は shadcn の面をそのまま持ち上げる（SidebarProvider 等が AppShell に要る）
export * from '@/components/Navigation/Sidebar';

// ── ② 製品層・自作（Layout 8 + DataDisplay 2）────────────────────
export { Box } from '@/components/Layout/Box';
export { Container } from '@/components/Layout/Container';
export { Grid } from '@/components/Layout/Grid';
export { Inline } from '@/components/Layout/Inline';
export { Section } from '@/components/Layout/Section';
export { Spacer } from '@/components/Layout/Spacer';
export { Stack } from '@/components/Layout/Stack';
export { DataGrid } from '@/components/DataDisplay/DataGrid';
export { StatusPill } from '@/components/DataDisplay/StatusPill';
// 工程4 D6/D7=A: 詳細画面の 2 部品。🟥 役割 9 カテゴリに席が無く、
// Ant Design の `group: Data Display` を根拠に DataDisplay へ置いた（指摘 14）
export { DescriptionList } from '@/components/DataDisplay/DescriptionList';
export { Timeline } from '@/components/DataDisplay/Timeline';
// 🆕 工程5 D1=B → 新設 / D5=A: ピボット表。🟥 **役割 9 カテゴリに席が無い 4 件目**（指摘 15）。
//    語彙定数（濃淡の 5 語）も API の一部（`PERIOD_PRESETS` と同じ扱い）
export {
  PivotTable,
  PIVOT_INTENSITIES,
} from '@/components/DataDisplay/PivotTable';
// 手8d H8D-06: 面④b（`a { color: var(--primary) }` が 4/6 周）を部品に引き取る
export { Link } from '@/components/Navigation/Link';
// 工程3 D3=C: 期間の語彙（有限 union）＋ 逃げ道（custom）を対で持つ。語彙定数も API の一部
export {
  PeriodSelect,
  PERIOD_PRESETS,
} from '@/components/Selection/PeriodSelect';
// 部品3 C3-02（D2=B / D3=B）: 上流に実装が無い初めての部品（`date-picker` はレジストリ 404）。
// 🟥 素材の `calendar` はここからしか出荷物に到達しない——**`Calendar` 単体は出さない**（D3=B）。
export {
  DatePicker,
  DATE_PICKER_MODES,
} from '@/components/Selection/DatePicker';

// ── ③ Patterns ─────────────────────────────────────────────────
export { EmptyState } from '@/patterns/EmptyState';
// 工程3 D5=C: AppShell に props を足す代わりの「画面の頭」
export { PageHeader } from '@/patterns/PageHeader';
// 工程3 D2=C: 帯の見た目はコア、何で絞るかは画面（題材）が差す
export { FilterBar, FilterField } from '@/patterns/FilterBar';
// 工程4 D1=B: フォームの器。🟥 **値は持たない**——react-hook-form / zod は題材が持つ
//    （ユーザー判断「UI はできるだけ純粋に保つ」。D12 の lint が機械で守る）
export { FormLayout, FormField } from '@/patterns/FormLayout';
export { ListDetail } from '@/patterns/ListDetail';
// 🟥 振る舞い hook。これを出さないと `ListDetail` は `state` を作れず**使えない**
//    （conventions header の validate 工程が捕まえた）。`use*` は converter の
//    `isComponentName` が部品から除くので、カードは増えない。
export { useListDetail } from '@/patterns/useListDetail';

// ── ④ Templates ────────────────────────────────────────────────
export { AppShell } from '@/templates/AppShell';

// ── Provider（部品ではなく「動くための前提条件」＝ DR-0037）──────
export { AppProviders } from '@/components/providers';

// ── ② 素材層 16 件（手7 D5=A で追加。手6 D2 の 2 周目）──────────
//
// 🟥 **1 周目は意図的に渡していなかった。**手3 D3=B（画面は製品層しか見ない）を
//    境界の向こうでも守れるかを見るため。**その結果 Q4 に実害が出た**——
//    `Card` が無いので design agent が `Box` + `bg-card rounded-md border` で
//    カード面を手組みし、宣言語彙の外に出た 3 語がそこに集中した（実行記録 §手7 Q4）。
// → **足りない部品を足すのが先**と判断した（ユーザー判断 2026-08-02・手7 D5 を B → A へ変更）。
//
// 🟥 **import 元は製品層の再輸出**（`@/components/<役割>/…`）であって
//    `@/components/ui/**` ではない。窓口は 1 本に保つ（手3 D2=A・no-restricted-imports）。
// 🟨 `export *` にしているのは、複合部品が部分（`DialogContent` 等）を必要とするため。
//    **カードの数を決めるのは export ではなく story**（手6 で `Sidebar` の `export *` が
//    カード 1 枚だったのと同じ）。素材層 16 件には story が 1 本ずつある。
export * from '@/components/Communication/Badge';
export * from '@/components/Communication/Empty';
export * from '@/components/Communication/Skeleton';
export * from '@/components/DataDisplay/Table';
export * from '@/components/Display/Label';
export * from '@/components/Display/Separator';
export * from '@/components/Layout/Card';
export * from '@/components/Navigation/Pagination';
// 工程3 D4=B: 共通シェルの素材（tabs / breadcrumb）。calendar は PeriodSelect の内部実装なので出さない
export * from '@/components/Navigation/Tabs';
export * from '@/components/Navigation/Breadcrumb';
export * from '@/components/Overlay/Dialog';
export * from '@/components/Overlay/DropdownMenu';
export * from '@/components/Overlay/Popover';
export * from '@/components/Overlay/Sheet';
export * from '@/components/Overlay/Tooltip';
export * from '@/components/Selection/Checkbox';
export * from '@/components/Selection/Select';
export * from '@/components/TextInput/Input';
// 工程4 D6: 編集の素材（textarea / field / alert）。
// 🟨 `field` は「フォーム 1 枠の器」で、役割カテゴリは Layout に置いた（D14=A・Card の先例）
export * from '@/components/TextInput/Textarea';
export * from '@/components/Layout/Field';
export * from '@/components/Communication/Alert';
// 部品2 C2-03（D1=A）: 役割 9 カテゴリの欠落のうち、**レジストリの依存が 0 の 5 件**。
// 🟦 題材の需要から逆算したのではなく、[部品カタログ](../docs/部品カタログ.md) の
//    9 カテゴリの穴を埋めた（部品1 D1 = C → B の B）。**この repo で初めての「充足駆動」。**
export * from '@/components/Selection/RadioGroup';
export * from '@/components/Selection/Switch';
export * from '@/components/Selection/Slider';
export * from '@/components/Communication/Progress';
export * from '@/components/Display/Avatar';

// ── 型（design agent が読む API 契約 `.d.ts` の材料）─────────────
export type { BoxProps } from '@/components/Layout/Box';
export type { ContainerProps } from '@/components/Layout/Container';
export type { GridProps } from '@/components/Layout/Grid';
export type { InlineProps } from '@/components/Layout/Inline';
export type { SectionProps } from '@/components/Layout/Section';
export type { SpacerProps } from '@/components/Layout/Spacer';
export type { StackProps } from '@/components/Layout/Stack';
// 🟥 手8d H8D-05: `ColumnDef` の素通しをやめ、自層の型で出し直した（DR-0072）
export type {
  DataGridProps,
  DataGridColumn,
  DataGridColumnKind,
} from '@/components/DataDisplay/DataGrid';
export type { LinkProps, LinkTone } from '@/components/Navigation/Link';
export type {
  PeriodSelectProps,
  PeriodPreset,
  PeriodRange,
} from '@/components/Selection/PeriodSelect';
export type {
  DatePickerProps,
  DatePickerSingleProps,
  DatePickerRangeProps,
  DatePickerMode,
  DateRange,
} from '@/components/Selection/DatePicker';
export type {
  StatusPillProps,
  StatusTone,
} from '@/components/DataDisplay/StatusPill';
export type {
  DescriptionListProps,
  DescriptionListItem,
  DescriptionListColumns,
  DescriptionListOrientation,
} from '@/components/DataDisplay/DescriptionList';
export type {
  TimelineProps,
  TimelineEvent,
} from '@/components/DataDisplay/Timeline';
export type {
  PivotTableProps,
  PivotColumn,
  PivotRow,
  PivotCell,
  PivotIntensity,
} from '@/components/DataDisplay/PivotTable';
export type { EmptyStateProps } from '@/patterns/EmptyState';
export type { FormLayoutProps, FormFieldProps } from '@/patterns/FormLayout';
export type { PageHeaderProps } from '@/patterns/PageHeader';
export type { FilterBarProps, FilterFieldProps } from '@/patterns/FilterBar';
export type { ListDetailProps } from '@/patterns/ListDetail';
export type { ListDetail as ListDetailState } from '@/patterns/useListDetail';
export type { AppShellProps, NavItem } from '@/templates/AppShell';
