import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/Layout/Card';
import { Button } from '@/components/Action/Button';

/**
 * shadcn で唯一の Layout 部品（Box / Stack / Grid / Container / Spacer / Section は無い。DR-0012）。
 * ★ `[--card-spacing: --spacing(4)]` という **component token** を持つ唯一の部品でもある（DR-0022）。
 *   手3 でここを `--spacing-inset-md` に向け替えられれば、Card だけは部品を触らずに semantic 層へ載る。
 */
const meta = {
  title: '② 素材層/Layout/Card',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Card,
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>チケット #1024</CardTitle>
        <CardDescription>ログイン画面の表示崩れ</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body">担当: 未割当 / 期限: 未設定</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">詳細</Button>
      </CardFooter>
    </Card>
  ),
};

/** data-size=sm で --card-spacing が --spacing(3) に切り替わる（component token の実演） */
export const Sizes: Story = {
  render: () => (
    <div className="flex gap-stack-lg">
      <Card className="w-64">
        <CardHeader>
          <CardTitle>default</CardTitle>
          <CardDescription>--card-spacing = --spacing(4)</CardDescription>
        </CardHeader>
      </Card>
      <Card className="w-64" data-size="sm">
        <CardHeader>
          <CardTitle>sm</CardTitle>
          <CardDescription>--card-spacing = --spacing(3)</CardDescription>
        </CardHeader>
      </Card>
    </div>
  ),
};
