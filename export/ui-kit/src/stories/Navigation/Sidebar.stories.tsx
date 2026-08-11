import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';

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
} from '@/components/Navigation/Sidebar';

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
  title: '② 製品層・ラッパー/Navigation/Sidebar',
  // 🟨 wrapped: 素材を包んで既定値だけ上書きした部品（手3 D1=(c)）
  tags: ['wrapped'],
  component: Sidebar,
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

const tree = (
  <>
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
  </>
);

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

/**
 * 🆕 **畳んだ状態**（部品5 C5-05・D1=C）。
 *
 * ★★ 🟥 **[OBS-0019](../../../docs/OBS/OBS-0019_storyが一度も描いていない状態をどこまで機械で要求するか.md) が名指しした 2 つの姿の 1 つ。**
 * 2026-07-26 から `Default`（デスクトップ・展開）**1 本だけ**で、
 * **`collapsed` は一度も描かれていなかった**＝ **バーの全面がこの姿を 1 度も見ていない。**
 *
 * 🟨 **開閉（overlay）とは別の形**——**閉じた overlay は DOM を持たない**が、
 * **`collapsed` は DOM が在って別の姿になる**（`data-state` が変わり、幅が 0 に落ちる）。
 * ★ **面③（状態面）に足すかは D8 で決める。**
 */
export const Collapsed: Story = {
  render: () => <SidebarProvider defaultOpen={false}>{tree}</SidebarProvider>,
  play: async () => {
    // 🟥 `?.` を使わない（バー §5）——無ければ undefined が返って expect が通ってしまう
    const root = document.querySelector('[data-slot="sidebar"]');
    if (root === null) throw new Error('Sidebar が描画されていない');
    await expect(root.getAttribute('data-state')).toBe('collapsed');
    await expect(root.getAttribute('data-collapsible')).toBe('offcanvas');
  },
};

/**
 * 🆕 **モバイルの姿**（部品5 C5-05・D6=B）。
 *
 * ★★★ 🟥 **着手前実測で分かったこと 3 つ**——
 * ① **道具は既に在った**（`@storybook/addon-vitest` は story の `globals.viewport` を読んで
 *    `page.viewport()` を実際に呼ぶ。**部品4 D1 は「viewport の道具を新設することになる」を理由に
 *    mobile を範囲外にしたが、その前提が誤りだった**）
 * ② 🟥 **mobile では `Sidebar` が 1 要素も描かれない**（`openMobile` の初期値は `false` で、
 *    **外から開く prop が無い**）。**それでも面① は緑**——`SidebarTrigger` が描かれているから。
 * ③ 🟥 **開くと portal に出るが、名乗るのは `data-slot="sidebar"`**（`sheet-content` ではない）
 *    ＝ **`tools/opened-overlay-check.mjs` の一覧にも `expectOpened('sheet-content')` にも掛からない。**
 *
 * 🟨 **台帳（`tools/a11y-scan.mjs`）はこの story を 1200×900 で測る**（D7=A）——
 * **バーが見る絵（320px）と台帳が見る絵（1200px）は違う。**
 */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1' } },
  render: () => <SidebarProvider>{tree}</SidebarProvider>,
  play: async ({ canvasElement }) => {
    // 🟥 開く前は「部品が 1 要素も無い」——これ自体が観測項目（Q4）
    await expect(
      document.querySelectorAll('[data-slot="sidebar"]').length,
    ).toBe(0);

    const trigger = canvasElement.querySelector<HTMLElement>(
      '[data-slot="sidebar-trigger"]',
    );
    if (trigger === null) throw new Error('SidebarTrigger が描画されていない');
    await userEvent.click(trigger);

    await waitFor(async () => {
      await expect(
        document.querySelectorAll('[data-slot="sidebar"][data-mobile="true"]')
          .length,
      ).toBe(1);
    });
    const panel = document.querySelector<HTMLElement>(
      '[data-slot="sidebar"][data-mobile="true"]',
    );
    if (panel === null)
      throw new Error('モバイルの Sidebar が portal に出ていない');
    // 🟥 大きさを持っているか（面① と同じ判定・在るだけでは足りない）
    const box = panel.getBoundingClientRect();
    await expect(box.width > 0 && box.height > 0).toBe(true);
  },
};
