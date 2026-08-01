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

// ── ③ Patterns ─────────────────────────────────────────────────
export { EmptyState } from '@/patterns/EmptyState';
export { ListDetail } from '@/patterns/ListDetail';

// ── ④ Templates ────────────────────────────────────────────────
export { AppShell } from '@/templates/AppShell';

// ── Provider（部品ではなく「動くための前提条件」＝ DR-0037）──────
export { AppProviders } from '@/components/providers';

// ── 型（design agent が読む API 契約 `.d.ts` の材料）─────────────
export type { BoxProps } from '@/components/Layout/Box';
export type { ContainerProps } from '@/components/Layout/Container';
export type { GridProps } from '@/components/Layout/Grid';
export type { InlineProps } from '@/components/Layout/Inline';
export type { SectionProps } from '@/components/Layout/Section';
export type { SpacerProps } from '@/components/Layout/Spacer';
export type { StackProps } from '@/components/Layout/Stack';
export type { DataGridProps } from '@/components/DataDisplay/DataGrid';
export type {
  StatusPillProps,
  StatusTone,
} from '@/components/DataDisplay/StatusPill';
export type { EmptyStateProps } from '@/patterns/EmptyState';
export type { ListDetailProps } from '@/patterns/ListDetail';
export type { AppShellProps, NavItem } from '@/templates/AppShell';
