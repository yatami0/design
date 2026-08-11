// ③ Patterns 層 — 空状態（手4 D5）
//
// 🟨 **Q4 の反例候補。**中身はほぼ素材の `Empty` の足し算で、
//    Pattern 層が持っているのは「**一覧が空のときは説明 + 主要操作を 1 つだけ出す**」という
//    規約だけ。**これは component の足し算で書ける**——実行記録に反例として残す。
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@/components/Communication/Empty';

export interface EmptyStateProps {
  title: string;
  description: string;
  /** 主要操作。**1 つだけ**（増やしたくなったら一覧側の設計を疑う） */
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action}
    </Empty>
  );
}
