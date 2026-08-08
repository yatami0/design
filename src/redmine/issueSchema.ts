// 題材（Redmine）— 編集の検証（工程4 D9=B・★ Q2）
//
// ★★ 🟥 **ここに置く理由**: 「件名は必須」「進捗は 0〜100 の 5 刻み」は **Redmine の制約**で、
//    Redmine を知らない repo では意味が通らない（[DR-0088](../../docs/DR/DR-0088-core-subject-boundary-is-decided-by-two-questions.md) の問 1 → 題材）。
//    コアが持つのは「**エラーをどう見せるか**」だけ（`FormField` の `error` は**ただの文字列**）。
// 🟥 **コアはこのファイルを見られない**——`src/components/**` `src/patterns/**` `src/templates/**`
//    からの `zod` import は lint が止める（工程4 D12・ユーザー判断「UI はできるだけ純粋に保つ」）。
//
// 出典: Redmine Issues API <https://www.redmine.org/projects/redmine/wiki/Rest_Issues>
//       進捗率の刻みは Redmine の管理設定（`issue_done_ratio`）で、既定の UI は 10% 刻み。
//       🟨 **API 自体は 0〜100 の整数を受ける**ので、ここでは整数・範囲までを検証する
//       （刻みまで縛ると実 API より厳しくなり、[DR-0086](../../docs/DR/DR-0086-redmine-has-no-baseline-for-evm.md)「モックは実 API が返せるものしか返さない」の
//       逆側——「実 API が受けるものを受けない」になる）。
import { z } from 'zod';

import type { IssueEdit } from './convert';

/** 件名の上限。Redmine の `issues.subject` は varchar(255)。 */
const SUBJECT_MAX = 255;

export const issueEditSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, '件名は必須。')
    .max(SUBJECT_MAX, `件名は ${String(SUBJECT_MAX)} 文字まで。`),
  description: z.string(),
  statusId: z.number().int(),
  priorityId: z.number().int(),
  assigneeId: z.number().int().nullable(),
  doneRatio: z
    .number()
    .int('進捗は整数で。')
    .min(0, '進捗は 0 以上。')
    .max(100, '進捗は 100 以下。'),
  notes: z.string(),
}) satisfies z.ZodType<IssueEdit>;

/**
 * 上の `satisfies z.ZodType<IssueEdit>` が縛る範囲——🟥 **赤テストで実測した（工程4 P4-06）。**
 *
 * | 壊し方 | `tsc` | |
 * | --- | --- | --- |
 * | フィールドを 1 つ**消す** | 🟦 赤（TS1360） | 効く |
 * | フィールドの**型を変える** | 🟦 赤（TS1360） | 効く |
 * | フィールドを 1 つ**足す** | 🟥 **緑のまま** | **効かない** |
 *
 * 🟥 **「足す」側が抜けているのは構造的部分型のため**（余分なプロパティを持つ型も
 *    `IssueEdit` に代入可能）。**最初は「増減したら赤になる」と書いていたが、
 *    赤テストを打ったら主張の半分が偽だった**——[DR-0090](../../docs/DR/DR-0090-token-classes-were-silently-dropped-by-tailwind-merge.md) と同じ形
 *    （書いたつもりで作用が無い）を、今回は**書いた直後に測って捕まえた**。
 * 🟨 実害は小さい（余ったフィールドは `toIssuePatch` が読まないので黙って無視される）が、
 *    **守られていないことを知っていて書く**のと知らずに書くのは別。
 */
export type IssueEditInput = z.infer<typeof issueEditSchema>;
