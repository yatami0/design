// 手5 — 判定軸カタログの共通部品（観点テンプレート）。
//
// 🟦 **これが「私と Claude の認識を合わせる」仕掛けの本体。**
//    Review の story は必ず先頭に <Viewpoint obs="X" /> を置く。すると同じ画面に
//      ① 観点の定義（何を見るのか）
//      ② 期待（そうなっているはずの値）
//      ③ **Claude が Playwright で測った実測値**
//    が並び、その下に**現物**が置かれる。
//    → 人は現物を、機械は数字を、**同じ画面で**突き合わせられる。
//
// 🟦 ファイル名が `_` 始まりなのは意図的。`.storybook/main.ts` の glob は
//    `**/*.stories.@(ts|tsx)` なので、本ファイルは story として拾われない。
//
// 🟥 **これは製品層ではない。**判定のための目盛りなので `src/components/` には置かない
//    （役割 9 カテゴリのどれでもない）。ここだけは素の Tailwind と inline style を使う。
import measuredJson from './_measured.json';

/**
 * `_measured.json` は `tools/visual-probe.mjs` が毎回書き出すので、
 * 中身によって推論が揺れる（例: 全件 `got` が埋まると `string | null` にならない）。
 * **形は 1 箇所で固定する。**
 */
interface Specimen {
  obs: string;
  name: string;
  expect: string;
  got: string | null;
  ok: boolean;
}
const measured = measuredJson as { measuredAt: string; specimens: Specimen[] };

/** 観点の定義。ID は HTML アーティファクトのチェックリストと 1:1 で対応する。 */
export const VIEWPOINTS = {
  A: {
    title: '状態面の色 — 不透明度だけが取り残されている',
    q: 'Q3',
    pri: true,
    look: '「色は合っているのに濃さが違う」が見えるか。shadcn は状態面を「意味色 + 不透明度」で 3 段作り、tmp-admin は「専用 tint 色」で 1 段しか持たない。値ではなく機構の食い違いなので、調整で直るのか作りを変えないと無理なのかを判断してほしい。',
  },
  B: {
    title: '角丸 — 27 箇所は届き、7 箇所が取り残された',
    q: 'Q2',
    pri: true,
    look: '取り残しの実効値は 7.2px（狙い 8px）と 16.8px（狙い 18px）。この 1px 未満の差が目で分かるか——分からないなら「取り残し 7 箇所」の重みは下がる。あわせて Checkbox は生値 4px なので動いていない。',
  },
  C: {
    title: '影 — 3 段を 2 段に潰した',
    q: 'Q1',
    pri: false,
    look: '段の区別が失われて平坦に見えないか。DropdownMenu だけが md と lg の 2 段階を使い分けていたので、そこが潰れると階層が読めなくなる可能性がある。',
  },
  D: {
    title: 'weight — font-medium が 500 から 600 へ',
    q: 'Q1',
    pri: false,
    look: 'V3「強調は weight 600 ⇔ 400 のコントラスト」が出ているか。逆に太くなりすぎて画面がうるさくなっていないか——15 箇所が同時に太くなる。',
  },
  EF: {
    title: 'blur とスクリム — 奥行きの作り方が変わった',
    q: 'Q1 / Q2',
    pri: false,
    look: 'blur を消した（V1）ぶん、奥行きはスクリムの濃さだけで作ることになる。10% → 40% は 4 倍。背後の文字が鮮明に読めるか、そして暗くなりすぎていないか。',
  },
  H: {
    title: 'サイドバー — on-dark が隔離できているか',
    q: 'Q1',
    pri: false,
    look: 'V5「on-dark は --sidebar-* 名前空間に隔離」が成立しているか。とくに本文側に濃紺が漏れていないか。8 変数の 1:1 対応は手2 で「最大の符合」と記録した箇所。',
  },
  I: {
    title: '層の比較 — vendor と own で追従の質に差が出るか',
    q: 'Q6',
    pri: true,
    look: 'own が綺麗に追従し vendor が取り残されるなら、製品層を作った意味が実証されたことになる。差が出ないなら製品層の存在意義を問い直す材料になる。wrapped がどちら寄りかも見てほしい。',
  },
  J: {
    title: '当たり判定 44px — 拡張量が全サイズ一律',
    q: 'Q7',
    pri: false,
    look: '🟥 実測で 4 サイズ中 2 つが 44px に届いていないことが判明済み（OBS-0008 で積んだ）。ここは「直すか、要求しないと決めるか」の判断待ち。',
  },
} as const satisfies Record<
  string,
  { title: string; q: string; pri: boolean; look: string }
>;

/**
 * 観点カード。story の先頭に置く。
 * 実測値は `tools/visual-probe.mjs` が書き出した `_measured.json` から引く。
 */
export function Viewpoint({ obs }: { obs: keyof typeof VIEWPOINTS }) {
  const v = VIEWPOINTS[obs];
  const rows = measured.specimens.filter((s) => s.obs === obs);
  // 🟥 ok = false は 2 種類ある: ① 要素が取れなかった ② 測れたが期待を満たさない
  const ng = rows.filter((r) => !r.ok).length;

  return (
    <section className="border-border mb-8 border-b pb-6">
      <p className="text-muted-foreground font-mono text-xs">
        観点 {obs} ／ {v.q} {v.pri ? '／ ★ 重点' : ''}
      </p>
      <h2 className="font-emphasis text-heading mt-1 mb-2">{v.title}</h2>
      <p className="mb-4 max-w-prose text-sm">
        <span className="font-emphasis">🟥 目で確かめたいこと：</span>
        {v.look}
      </p>

      {rows.length > 0 && (
        <div className="border-border border">
          <p className="bg-muted/50 border-border text-muted-foreground border-b px-3 py-1 font-mono text-xs">
            Claude が Playwright で測った値（{rows.length} 検体
            {ng > 0 ? ` ／ 🟥 ${String(ng)} 件が期待どおりでない` : ''}）・
            {measured.measuredAt.slice(0, 10)} 時点
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-border text-muted-foreground border-b text-left">
                <th className="p-2 font-normal">検体</th>
                <th className="p-2 font-normal">期待</th>
                <th className="p-2 font-normal">実測</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {rows.map((r) => (
                <tr
                  key={r.name}
                  className="border-border border-b last:border-0"
                >
                  <td className="p-2 align-top">
                    {r.ok ? '🟦' : '🟥'} {r.name}
                  </td>
                  <td className="text-muted-foreground p-2 align-top">
                    {r.expect}
                  </td>
                  <td className="p-2 align-top">
                    {r.got ?? '要素が取れなかった'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/** 1 検体。左に実物、右に「何であるべきか」を書く。 */
export function Spec({
  label,
  expect,
  flag,
  children,
}: {
  label: string;
  expect: string;
  /** 🟥 = 追従しない／取り残し ・ 🟨 = 部分追従 ・ 🟦 = 追従する */
  flag: '🟦' | '🟨' | '🟥';
  children: React.ReactNode;
}) {
  return (
    <div className="border-border flex items-start gap-4 border-b py-3">
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
