'use client';

// ③ Patterns 層 — フォームの器（工程4 D1=B・★ Q1 / Q2 の検体）
//
// ★★ 🟥 **コアは「値」を持たない。**編集の状態管理（react-hook-form）と
//    バリデーション（zod）は**題材の画面**が持ち、ここへは**ただのデータ**として降りてくる
//    （ユーザー判断 2026-08-08「UI はできるだけ純粋に保つ」・手順書 §2 D1=B）。
//    → このファイルは `react-hook-form` / `zod` を 1 行も import しない。
//      **機械で守っている**（工程4 D12: コア 3 層で状態ライブラリの import を lint が止める）。
//
// 🟦 **コアが持つのは見た目の管轄権だけ**（DR-0070）——
//    ラベルの位置・必須の印・説明文とエラー文の置き場・送信行の並び。
// 🟨 **Q1 の判定**: この器の props に「ラベル / 必須 / 説明 / エラー / 子」以外が生えたら、
//    D1=B で収まっていない徴候。生えた props はそのまま数える（P4-04 / P4-07）。
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/Layout/Field';
import { Inline } from '@/components/Layout/Inline';
import { Stack } from '@/components/Layout/Stack';

export interface FormLayoutProps {
  /** `FormField` を並べる。縦の間隔はフォームが持つ。 */
  children: React.ReactNode;
  /** 送信・取消などの操作。並びと間隔はフォームの管轄。 */
  actions?: React.ReactNode;
  /** 保存の成否など、フォーム全体に掛かる知らせ（`Alert` を差す・D8=B）。 */
  notice?: React.ReactNode;
  /**
   * ブラウザ既定の送信を止めるのは呼び出し側の責務。
   * 🟨 `FormEventHandler` は @types/react 19 で deprecated（"doesn't actually exist"）。
   *    `SubmitEventHandler` が正——lint（`no-deprecated`）が実装中に捕まえた。
   */
  onSubmit?: React.SubmitEventHandler<HTMLFormElement>;
}

export function FormLayout({
  children,
  actions,
  notice,
  onSubmit,
}: FormLayoutProps) {
  return (
    <form onSubmit={onSubmit} noValidate>
      <Stack gap="lg">
        {notice}
        <FieldGroup>{children}</FieldGroup>
        {actions !== undefined && (
          <Inline gap="sm" justify="end">
            {actions}
          </Inline>
        )}
      </Stack>
    </form>
  );
}

export interface FormFieldProps {
  /** 枠の見出し。 */
  label: string;
  /** コントロールの `id`。`<label for>` と結ぶ。 */
  htmlFor: string;
  /** 必須の印を出すか。**印の形（記号・色・位置）はコアが決める。** */
  required?: boolean;
  /** 補足。エラーが出ているときも消さない（入力の指針なので）。 */
  description?: string;
  /**
   * エラー文。🟥 **ただの文字列**——検証の仕組み（zod / rhf）は知らない。
   * 未指定・空文字はエラー無しと同義。
   */
  error?: string;
  /** コントロール 1 個（製品層の `Input` / `Textarea` / `Select` など）。 */
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  description,
  error,
  children,
}: FormFieldProps) {
  const invalid = error !== undefined && error !== '';
  return (
    <Field data-invalid={invalid || undefined}>
      <FieldLabel htmlFor={htmlFor}>
        {label}
        {required && (
          <span aria-hidden className="text-destructive">
            *
          </span>
        )}
      </FieldLabel>
      {children}
      {description !== undefined && (
        <FieldDescription>{description}</FieldDescription>
      )}
      {invalid && <FieldError errors={[{ message: error }]} />}
    </Field>
  );
}
