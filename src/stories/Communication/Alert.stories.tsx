import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/Communication/Alert';
import { Stack } from '@/components/Layout/Stack';

/**
 * 部品3 C3-05 — 🟥 **工程4 から出荷していたのに story が 1 本も無かった 3 件の 1 つ。**
 *
 * ★★ **バーの全面が「対象 0 件で緑」だった**（[台帳 §4](../../../docs/部品の完成バー_台帳.md)）——
 * `src/index.ts` で export しているのに story が無く、**バーは story を通してしか部品を見られない。**
 * 🟥 **「出荷部品 44 件」という数え方自体が story を数えている**（[DR-0091](../../../docs/DR/DR-0091-claude-design-is-a-fourth-shipping-entrance.md)）＝
 * **この 3 件はどの数え方からも落ちていた。**
 *
 * | 面 | 扱い |
 * | --- | --- |
 * | `default` | ★ story で持つ |
 * | `overflow` | ★ **持つ**——本文が長いときに崩れないか（`Alert` は文章を受ける唯一の Communication 部品） |
 * | `hover` / `focus-visible` / `disabled` | 🟨 **対象外**——**操作を受けない**（`role` も持たない静的な帯） |
 * | `invalid` | 🟨 **対象外**——入力を受けない。**「異常」は `variant="destructive"` という語彙のほう**（面④） |
 * | `loading` / `empty` | 🟨 **対象外**——非同期もデータも受けない |
 */
const meta = {
  title: '② 素材層/Communication/Alert',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Alert,
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Alert>
      <AlertTitle>保存した</AlertTitle>
      <AlertDescription>変更はチケットに反映されている。</AlertDescription>
    </Alert>
  ),
};

/**
 * 語彙 prop `variant`（`default` / `destructive`）。
 *
 * 🟨 **面④ の機械測定からは外している**——`alertVariants` は **shadcn の cva 由来**で、
 * [DR-0090](../../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md)
 * の失敗経路（`tw-merge.ts` への登録漏れ）を**持たない**（部品1 D12=B と同じ判断）。
 */
export const Variants: Story = {
  render: () => (
    <Stack gap="sm">
      <Alert>
        <AlertTitle>保存した</AlertTitle>
        <AlertDescription>変更はチケットに反映されている。</AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertTitle>読み込みに失敗した</AlertTitle>
        <AlertDescription>
          ネットワークに繋がらない。時間をおいて試す。
        </AlertDescription>
      </Alert>
    </Stack>
  ),
};

/** 面③ `overflow` — 長文で崩れないか。 */
export const Overflow: Story = {
  render: () => (
    <Alert variant="destructive">
      <AlertTitle>
        検証に失敗した項目が複数あるため、この内容では保存できない
      </AlertTitle>
      <AlertDescription>
        件名は 255 文字以内である必要がある。進捗は 0 から 100 の範囲で、10
        刻みでのみ指定できる。開始日は期限より後に置けない。
        担当者はこのプロジェクトのメンバーから選ぶ必要がある。
      </AlertDescription>
    </Alert>
  ),
};
