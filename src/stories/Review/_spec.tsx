// 手5 案2 — 判定軸カタログの共通部品。
//
// 🟦 **ファイル名が `_` 始まりなのは意図的。**`.storybook/main.ts` の glob は
//    `**/*.stories.@(ts|tsx)` なので、本ファイルは story として拾われない。
//
// 🟥 **これは製品層ではない。**判定のための計測用の目盛りなので、
//    `src/components/` には置かない（役割 9 カテゴリのどれでもない）。
//    ここだけは「見出しと目盛り」を書くために素の Tailwind を使う。

/** 1 検体。左に実物、右に「何であるべきか」を書く。 */
export function Spec({
  label,
  expect,
  flag,
  children,
}: {
  /** 検体の名前（クラス名やトークン名をそのまま書く） */
  label: string;
  /** 差し替え後にどうなっているべきか */
  expect: string;
  /** 🟥 = 追従しない／取り残し ・ 🟨 = 部分追従 ・ 🟦 = 追従する */
  flag: '🟦' | '🟨' | '🟥';
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-border py-3">
      <div className="flex w-40 shrink-0 items-center justify-center">
        {children}
      </div>
      <div className="min-w-0">
        <p className="font-mono text-xs break-all">
          {flag} {label}
        </p>
        <p className="text-muted-foreground text-xs">{expect}</p>
      </div>
    </div>
  );
}

/** 検体の束。見出しと注意書きを持つ。 */
export function Group({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h3 className="font-emphasis text-heading mb-1">{title}</h3>
      {note !== undefined && (
        <p className="text-muted-foreground mb-2 max-w-prose text-sm">{note}</p>
      )}
      <div className="border-border border-t">{children}</div>
    </section>
  );
}

/** 目盛り。差し替え後に「そうなっているはずの値」を実寸で置く参照用。 */
export function Ruler({ px, label }: { px: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* 🟥 参照用の実寸なので inline style で書く。トークンではなく「物差し」。 */}
      <div
        className="bg-muted border-border size-16 border"
        style={{ borderRadius: `${String(px)}px` }}
      />
      <span className="text-muted-foreground font-mono text-xs">{label}</span>
    </div>
  );
}
