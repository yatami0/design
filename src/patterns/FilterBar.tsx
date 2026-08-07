// ③ Patterns 層 — フィルタ帯（工程3 D2=C・★ Q1 の検体）
//
// 🟥 **コアが持つのは「帯」の見た目だけ**——並び・間隔・折返し・ラベルの付き方。
//    **何で絞るか**（ステータス / 担当者 / プロジェクト…）は題材の知識で、
//    画面が `FilterField` の中身として差す。コアに選択肢を入れた瞬間、
//    出荷物が Redmine を知る（D2 の A 却下理由）。
// 🟨 Q1 の判定: 画面側に見た目の指定（幅・間隔・折返し）が 1 つも漏れなければ「部品」。
//    漏れた項目はそのまま「部品にならなかった理由」として数える（P3-05 / P3-07）。
import { Inline } from '@/components/Layout/Inline';
import { Stack } from '@/components/Layout/Stack';

export interface FilterBarProps {
  /** `FilterField` を並べる。折返し・間隔は帯が持つ。 */
  children: React.ReactNode;
}

export function FilterBar({ children }: FilterBarProps) {
  return (
    <Inline gap="md" align="end" wrap>
      {children}
    </Inline>
  );
}

export interface FilterFieldProps {
  /** 枠の見出し。ラベルの置き方（上・小さく・muted）は帯の管轄。 */
  label: string;
  /** コントロール 1 個（Select・Input など製品層の部品）。 */
  children: React.ReactNode;
}

export function FilterField({ label, children }: FilterFieldProps) {
  return (
    <Stack gap="sm">
      <span className="text-label text-muted-foreground">{label}</span>
      {children}
    </Stack>
  );
}
