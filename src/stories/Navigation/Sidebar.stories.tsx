import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

/**
 * ★ 本 repo で最も重い部品。32 export・lint 赤 33 件のうち 17 件がここ（DR-0013）。
 *
 * ⚠ **唯一 state を内包する**（useState + createContext + Provider + cookie 永続 + Cmd/Ctrl+B）。
 *   思想「状態は role の外に出す」と正面から反しており、hook へ切り出すかは未決 #2（手3）。
 *   → story を書くには `SidebarProvider` が必須で、**Tooltip と同じく「配線が要る部品」**（Q3）。
 *
 * ★ 手5 の判定対象が 2 種類ある:
 *   1. `--sidebar-*` 8 色 … tmp-admin V5 とほぼ 1:1 で写せる＝**変わるはず**
 *   2. `--sidebar-width` … 値が `sidebar.tsx` の **TS 定数 "16rem"**（CSS に無い）＝**変わらないはず**（DR-0022）
 */
const meta = {
  title: 'Navigation/Sidebar',
  component: Sidebar,
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <span className="text-emphasis font-emphasis">Redmine</span>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>チケット</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive>一覧</SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>自分の担当</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          <SidebarGroup>
            <SidebarGroupLabel>設定</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>プロジェクト</SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="p-inset-lg">
          <SidebarTrigger />
          <p className="text-body">本文領域（SidebarInset）</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  ),
};
