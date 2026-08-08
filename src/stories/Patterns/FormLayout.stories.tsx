// 工程4 D1=B — ③ Patterns。フォームの器。
//
// ★★ 🟥 **この story は `react-hook-form` も `zod` も使わない**——器が本当に
//    「ただのデータ」だけで動くことの証拠になる（使えてしまったら D1=B は成立していない）。
//    値の管理は題材の画面が持つ（`src/redmine/screens/IssueDetail.tsx`）。
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@/components/Action/Button';
import { Alert, AlertTitle } from '@/components/Communication/Alert';
import { Input } from '@/components/TextInput/Input';
import { Textarea } from '@/components/TextInput/Textarea';
import { FormField, FormLayout } from '@/patterns/FormLayout';

const meta = {
  title: '③ Patterns/FormLayout',
  component: FormLayout,
  tags: ['own'],
} satisfies Meta<typeof FormLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 既定。必須の印・説明文・送信行の並びは器が持つ。 */
export const Default: Story = {
  args: {
    actions: <Button type="submit">保存</Button>,
    children: (
      <>
        <FormField label="件名" htmlFor="s-subject" required>
          <Input id="s-subject" defaultValue="監査ログの使い方を案内する" />
        </FormField>
        <FormField
          label="説明"
          htmlFor="s-description"
          description="再現手順と期待動作を書く。"
        >
          <Textarea id="s-description" />
        </FormField>
      </>
    ),
  },
};

/** エラー。**ただの文字列**を渡すだけ——検証の仕組みは器の外にある。 */
export const WithError: Story = {
  args: {
    actions: <Button type="submit">保存</Button>,
    children: (
      <FormField label="件名" htmlFor="e-subject" required error="件名は必須。">
        <Input id="e-subject" defaultValue="" />
      </FormField>
    ),
  },
};

/** 保存の知らせ（D8=B・Toast ではなく画面内）。 */
export const WithNotice: Story = {
  args: {
    notice: (
      <Alert>
        <AlertTitle>保存した</AlertTitle>
      </Alert>
    ),
    actions: <Button type="submit">保存</Button>,
    children: (
      <FormField label="件名" htmlFor="n-subject" required>
        <Input id="n-subject" defaultValue="監査ログの使い方を案内する" />
      </FormField>
    ),
  },
};
