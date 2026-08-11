import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/components/Action/Button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/Navigation/Breadcrumb';
import { PageHeader } from '@/patterns/PageHeader';

// 工程3 D5=C — AppShell に props を足す代わりの「画面の頭」。
// 持っているのは並びと間隔だけ。見出しの中身・戻り先は画面（題材）の知識。
const meta = {
  title: '③ Patterns/PageHeader',
  component: PageHeader,
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { title: 'チケット一覧' },
};

export const WithBreadcrumbAndActions: Story = {
  args: {
    title: 'チケット一覧',
    breadcrumb: (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">プロジェクト</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>チケット一覧</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    ),
    actions: <Button>新しいチケット</Button>,
  },
};
