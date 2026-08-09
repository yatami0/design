import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from '@/components/TextInput/Input';

const meta = {
  title: '② 素材層/TextInput/Input',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { placeholder: '件名で検索' } };

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-stack-sm">
      <Input placeholder="通常" aria-label="通常" />
      <Input placeholder="無効" aria-label="無効" disabled />
      <Input placeholder="不正" aria-label="不正" aria-invalid />
      <Input value="読み取り専用" aria-label="読み取り専用" readOnly />
    </div>
  ),
};
