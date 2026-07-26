import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Label } from '@/components/Display/Label';
import { Input } from '@/components/TextInput/Input';

// 表示プリミティブだが formBound=true（部品カタログ 表1）。役割は Display のまま。
const meta = {
  title: 'Display/Label',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Label,
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-sm">
      <Label htmlFor="subject">件名</Label>
      <Input id="subject" placeholder="ログイン画面の表示崩れ" />
    </div>
  ),
};
