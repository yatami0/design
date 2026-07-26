// 手5 案1 — 棚の穴を塞ぐ（2/2）。
// ④ Templates 層。手4 で作ったが story が無く、**本体アプリ（pnpm dev）でしか
// 見られない状態**だった。サイドバー込みの全体像は手5 の観点 H（V5 on-dark の隔離）
// の判定に要る（→ Storybookの設計と目視観点.md §3）。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/Action/Button';
import { Inline } from '@/components/Layout/Inline';
import { Section } from '@/components/Layout/Section';
import { AppShell } from '@/templates/AppShell';

const meta = {
  title: 'Templates/AppShell',
  component: AppShell,
  // 🟦 own: ④ 層の自作。tmp-admin §4.1「面は 3 層」を構造として写したもの
  tags: ['own'],
  parameters: {
    // 全画面の骨格なので Storybook の余白を外す
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * tmp-admin §4.1 の「面は 3 層」— 濃紺サイドバー（chrome）／キャンバス／白カード。
 *
 * 🟥 **目視の観点 H（V5）**: on-dark が `--sidebar-*` 名前空間に隔離できているか。
 * ① サイドバーが紺 `#003a63`・アクセントが空色 `#009fe8` になっているか
 * ② **本文側（キャンバス）に濃紺が漏れていないか**
 * ③ nav-item の高さが 44px を保っているか（観点 J・製品層ラッパーが当てている）
 */
export const Default: Story = {
  args: {
    brand: 'Redmine',
    nav: [
      { key: 'issues', label: 'チケット', active: true },
      { key: 'projects', label: 'プロジェクト' },
      { key: 'reports', label: 'レポート' },
    ],
    children: (
      <Section heading="チケット一覧" gap="md">
        <Inline justify="between">
          <span className="text-label text-muted-foreground">3 件</span>
          <Button>新規チケット</Button>
        </Inline>
      </Section>
    ),
  },
};
