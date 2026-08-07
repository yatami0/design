import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/Navigation/Tabs';

// 工程3 D4=B — 共通シェルの素材。4 ビュー（一覧 / ガント / EVM / 稼働表）の切り替えが本来の用途。
const meta = {
  title: '② 素材層/Navigation/Tabs',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Tabs,
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="list">
      <TabsList>
        <TabsTrigger value="list">一覧</TabsTrigger>
        <TabsTrigger value="gantt">ガント</TabsTrigger>
        <TabsTrigger value="evm">EVM</TabsTrigger>
        <TabsTrigger value="workload">稼働表</TabsTrigger>
      </TabsList>
      <TabsContent value="list">一覧ビュー（中身は画面が差す）</TabsContent>
      <TabsContent value="gantt">ガントビュー</TabsContent>
      <TabsContent value="evm">EVM ビュー</TabsContent>
      <TabsContent value="workload">稼働表ビュー</TabsContent>
    </Tabs>
  ),
};
