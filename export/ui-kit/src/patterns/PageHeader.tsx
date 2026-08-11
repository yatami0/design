// ③ Patterns 層 — 画面の頭（工程3 D5=C）
//
// 🟥 **`AppShell` には足さない。**props を足すと「4 画面が全部同じ並び」だと
//    決めつけることになる（ガントは期間セレクタの置き場が違うかもしれない）。
//    画面が `AppShell` の children の先頭にこれを置く——AppShell の diff 0 行を保つ。
// 🟨 持っているのは「見出し・パンくず・右肩の操作」の**並びと間隔**だけ。
//    何を見出しにするか・どこへ戻るかは画面（題材）の知識。
import { Inline } from '@/components/Layout/Inline';
import { Stack } from '@/components/Layout/Stack';

export interface PageHeaderProps {
  /** 画面の見出し。1 画面に 1 つ（h1 で描画する）。 */
  title: string;
  /** パンくず。`Breadcrumb`（Navigation の窓口）を差す。 */
  breadcrumb?: React.ReactNode;
  /** 右肩の操作（ボタン・期間セレクタなど）。 */
  actions?: React.ReactNode;
}

export function PageHeader({ title, breadcrumb, actions }: PageHeaderProps) {
  return (
    <Stack gap="sm">
      {breadcrumb}
      <Inline justify="between" wrap>
        <h1 className="text-heading font-emphasis">{title}</h1>
        {actions}
      </Inline>
    </Stack>
  );
}
