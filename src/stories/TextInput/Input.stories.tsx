import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from '@/components/TextInput/Input';

const meta = {
  title: 'TextInput/Input',
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: '件名で検索' } };

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-sm">
      <Input placeholder="通常" />
      <Input placeholder="無効" disabled />
      <Input placeholder="不正" aria-invalid />
      <Input value="読み取り専用" readOnly />
    </div>
  ),
};
