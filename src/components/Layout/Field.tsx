// 製品層（素通しの再輸出）— 工程4 D6 / ★ D14=A（役割カテゴリ）
//
// ★ 🟥 **役割 9 カテゴリに `Field` の席は無い**（工程4 Q3 の 3 件目・指摘 14）。
//    思想は Pattern として「フォームレイアウト」を持つが、**部品としての Field は無い**。
//    Layout に置くのは先例に倣ったもの——`Card` も shadcn 由来でこの棚に居る
//    （＝ Layout は「自作テンプレ」だけの棚ではない）。判断の経緯は手順書 §2 D14。
//
// 🟦 ★ **D1=B の裏づけがこのファイルにある**——shadcn の `FieldError` は
//    `errors?: Array<{ message?: string } | undefined>` を受けるだけで、
//    **`react-hook-form` を 1 行も import していない**。rhf の `FieldErrors` は
//    構造的にそのまま渡せるので、**コアは rhf を知らないまま器を提供できる。**
// 🟨 `fieldVariants` は上流も export していない（＝ className の逃げ道は元から無い）。
export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
} from '@/components/ui/field';
