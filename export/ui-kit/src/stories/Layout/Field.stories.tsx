import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/Layout/Field';
import { Input } from '@/components/TextInput/Input';
import { Textarea } from '@/components/TextInput/Textarea';

/**
 * 部品3 C3-05 — 🟥 **工程4 から出荷していたのに story が 1 本も無かった 3 件の 3 つ目。**
 *
 * ★★ 🟥 **`Field` は単体では意味を持たない**（「フォーム 1 枠の器」）——
 * **この story が測っているのは `Field` なのか、中に入れた `Input` なのか。**
 * 答えは **`Field` が持つのは「並べ方」だけ**（`orientation` と、ラベル / 説明 / エラーの席）で、
 * **中身の見た目は中身の部品が持つ**。→ **面④ の対象は `orientation` の 1 語だけ**。
 *
 * 🟦 **`Field` は [DR-0092](../../../docs/DR/DR-0092-the-core-holds-the-vessel-not-the-state.md)
 * の「器」そのもの**——`FieldError` は `errors?: Array<{ message?: string }>` を受けるだけで、
 * **`react-hook-form` を 1 行も import していない**（工程4 D1=B の裏づけ）。
 *
 * | 面 | 扱い |
 * | --- | --- |
 * | `default` / `invalid` | ★ story で持つ（`invalid` は `FieldError` を出した状態） |
 * | `disabled` | ★ **持つ**——`data-disabled` が**子孫のラベルまで**効く（`group-data-[disabled=true]/field`） |
 * | `overflow` | ★ **持つ**——説明文とエラー文が長いとき |
 * | `hover` / `focus-visible` | 🟨 **対象外**——**器はフォーカスを受けない**（受けるのは中身の `Input`） |
 * | `loading` / `empty` | 🟨 **対象外**——非同期もデータも受けない |
 */
const meta = {
  title: '② 素材層/Layout/Field',
  // 🟦 vendor: 中身は素材そのまま。製品層は窓口を 1 本にするためだけに通している
  tags: ['vendor'],
  component: Field,
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel htmlFor="f-subject">件名</FieldLabel>
      <Input id="f-subject" placeholder="ログイン後に一覧が空になる" />
      <FieldDescription>255 文字以内。</FieldDescription>
    </Field>
  ),
};

/**
 * 語彙 prop `orientation`（`vertical` / `horizontal` / `responsive`）。
 * 🟨 **`fieldVariants` は shadcn の cva 由来**なので面④ の機械測定からは外す（部品1 D12=B）。
 */
export const Orientation: Story = {
  render: () => (
    <FieldGroup>
      <Field orientation="vertical">
        <FieldLabel htmlFor="f-v">縦（既定）</FieldLabel>
        <Input id="f-v" placeholder="vertical" />
      </Field>
      <Field orientation="horizontal">
        <FieldLabel htmlFor="f-h">横</FieldLabel>
        <Input id="f-h" placeholder="horizontal" />
      </Field>
    </FieldGroup>
  ),
};

/** 面③ `invalid` — 器が持つのは**エラー文の席**だけで、検証そのものは持たない。 */
export const Invalid: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="f-done">進捗</FieldLabel>
      <Input id="f-done" defaultValue="130" aria-invalid />
      <FieldError errors={[{ message: '0 から 100 の範囲で指定する' }]} />
    </Field>
  ),
};

/** 面③ `disabled` — `data-disabled` はラベルと説明にも効く（器の側の面）。 */
export const Disabled: Story = {
  render: () => (
    <Field data-disabled="true">
      <FieldLabel htmlFor="f-disabled">担当</FieldLabel>
      <Input id="f-disabled" placeholder="変更できない" disabled />
      <FieldDescription>閉じたチケットの担当は変更できない。</FieldDescription>
    </Field>
  ),
};

/** 面③ `overflow` — 説明とエラーが長いとき。 */
export const Overflow: Story = {
  render: () => (
    <Field data-invalid="true">
      <FieldLabel htmlFor="f-desc">説明</FieldLabel>
      <Textarea
        id="f-desc"
        placeholder="再現手順・期待・実際を書く"
        aria-invalid
      />
      <FieldDescription>
        再現手順は番号つきで、期待と実際を分けて書く。添付が必要なときは
        チケットを保存してから追加する。テンプレートはプロジェクトの Wiki
        にある。
      </FieldDescription>
      <FieldError
        errors={[
          { message: '説明は必須である' },
          { message: '再現手順が含まれていない' },
        ]}
      />
    </Field>
  ),
};
