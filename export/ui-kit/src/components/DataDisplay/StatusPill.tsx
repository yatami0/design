// 製品層（自作）— 手4 H4-06
//
// 🟥 **shadcn の Badge では組めなかった。**variant は
//    default / secondary / destructive / outline / ghost / link の 6 つで、
//    **success / warning が無く、色ドットも持たない**（実測）。
//    tmp-admin §4.5 は「状態 = tint pill + 色ドット」を規定しているので自作する。
//
// 🟦 形は shadcn の destructive variant（`bg-destructive/10 text-destructive`）に揃えた。
//    トークンマッピング 表3 #8「発想は一致」を実装で確かめた形になる。
import { Badge } from '@/components/Communication/Badge';
import { cn } from '@/lib/utils';

export type StatusTone = 'success' | 'warning' | 'danger' | 'neutral';

/** tint（面）と前景。値は tokens.css の semantic 語彙だけを指す。 */
const TONE: Record<StatusTone, string> = {
  success: 'bg-fill-success text-success',
  warning: 'bg-fill-warning text-warning',
  danger: 'bg-fill-danger text-destructive',
  neutral: 'bg-fill-neutral text-muted-foreground',
};

const DOT: Record<StatusTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
  neutral: 'bg-muted-foreground',
};

export interface StatusPillProps {
  tone?: StatusTone;
  children: React.ReactNode;
}

export function StatusPill({ tone = 'neutral', children }: StatusPillProps) {
  return (
    <Badge variant="outline" className={cn('border-transparent', TONE[tone])}>
      <span aria-hidden className={cn('size-dot rounded-full', DOT[tone])} />
      {children}
    </Badge>
  );
}
