// ③ Templates 層 — ページ骨格（手4 D4=B）
//
// tmp-admin §4.1 の「面は 3 層」を骨格として写す:
//   濃紺サイドバー（chrome）／キャンバス／白カード
// 🟥 **値は流し込まない**（手5 まで shadcn 既定のまま）。ここで写すのは**構造だけ**。
//
// 🟨 **Q4 の判定は微妙。**Sidebar + SidebarInset の足し算に見えるが、
//    Template が持っているのは「**どの面をどこに置くか**」という 3 層の割り当てで、
//    これは部品側には書けない。→ 実行記録で判定する。
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/Navigation/Sidebar';
import { Container } from '@/components/Layout/Container';
import { Stack } from '@/components/Layout/Stack';

export interface NavItem {
  key: string;
  label: string;
  active?: boolean;
}

/**
 * ページ骨格。**画面はここから始める。**
 *
 * 🟦 **document reset（html / body の margin・padding）は配布 CSS の `@layer base` が保証する。**
 *    `AppShell` の外に `<style>` で reset を書く必要は無い。
 *
 * 手8d H8D-07（設計 §3.3・器は A ＝ 配布 CSS の base レイヤ）。
 * 🟥 **props も CSS も増えていない。増えたのは「保証の名乗り」だけ。**
 *    生成物は 5/6 周で `<style>` に `html,body{margin:0;padding:0}` を書いていたが、
 *    H8D-01 の赤テストで **Tailwind Preflight が `*` に `margin:0` を当てた状態で
 *    配布 CSS に載っている**ことを確認した（`*,:after,:before,::backdrop{…margin:0…}`）。
 *    → **欠けていたのは reset ではなく「保証されているという宣言」**だった。
 */
export interface AppShellProps {
  /** サイドバーの見出し（プロダクト名など）。 */
  brand: React.ReactNode;
  nav: NavItem[];
  children: React.ReactNode;
}

export function AppShell({ brand, nav, children }: AppShellProps) {
  return (
    <>
      {/* 面 1: chrome。前景・塗り・境界は --sidebar-* だけで構成される（tmp-admin §4.2） */}
      <Sidebar>
        <SidebarHeader>
          <Stack gap="none" inset="sm">
            <span className="text-emphasis font-emphasis">{brand}</span>
          </Stack>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.key}>
                  {/* nav-item の min-height 44px は製品層のラッパーが当てている（DR-0034） */}
                  <SidebarMenuButton isActive={item.active}>
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* 面 2: キャンバス。面 3（白カード）は中身の側が置く */}
      <SidebarInset>
        <Container width="wide">
          <Stack gap="lg" inset="lg">
            {children}
          </Stack>
        </Container>
      </SidebarInset>
    </>
  );
}
