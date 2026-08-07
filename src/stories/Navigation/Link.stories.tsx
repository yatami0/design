import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Link } from '@/components/Navigation/Link';
import { Stack } from '@/components/Layout/Stack';

// 手8d H8D-06 — 面④b（`a { color: var(--primary) }` が 4/6 周）を引き取る部品。
//
// 🟥 **story が無いとカードが出ない**（手6 の実測: カードの数を決めるのは export ではなく story）。
//    部品を足しても棚に並べなければ、7 周目の design agent からは**存在しないのと同じ**。
const meta = {
  title: '② 製品層・自作/Navigation/Link',
  // 🟦 own: 素材層に対応物が無い（shadcn は Button の link variant しか持たない）
  tags: ['own'],
  component: Link,
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { href: '#', children: 'チケット #1024 を開く' },
};

/** 色調は semantic 色 1 語だけ。`className` は型に無い。 */
export const Tones: Story = {
  args: { href: '#', children: 'primary（既定）' },
  render: (args) => (
    <Stack gap="sm" align="start">
      <Link {...args} />
      <Link href="#" tone="muted">
        muted（補助的なリンク）
      </Link>
    </Stack>
  ),
};

/** 外部リンク。`target` と `rel` は部品側が付ける（呼び出し側は書かない）。 */
export const External: Story = {
  args: { href: 'https://example.com', external: true, children: '外部の資料' },
};
