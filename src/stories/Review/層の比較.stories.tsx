// 手5 案2 — 判定軸カタログ（観点 I）。★ 重点
//
// 🟥 **最初は 3 群をただ並べただけで観点が伝わらなかった**（ユーザー指摘 2026-07-27）。
//    「どれとどれを、どのプロパティで比べるか」を名指ししていなかったため。
//    → **同じ役割のものを 2 つ選び、1 つのプロパティだけを見る**形に組み替えた。
//
// 解説（詳細版）: https://claude.ai/code/artifact/6646b4ea-43f5-433a-89c3-5305f42ecbc0
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from '@/components/Communication/Badge';
import { StatusPill } from '@/components/DataDisplay/StatusPill';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/DataDisplay/Table';
import { Card, CardContent } from '@/components/Layout/Card';
import { Checkbox } from '@/components/Selection/Checkbox';
import { MachineOnly, Pair, Viewpoint } from './_spec';

const meta = {
  title: '★ Review/I 層の比較',
  tags: ['review'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **これは部品の良し悪しではなく、手3 の設計判断（D1 = 欠落品 + 既定値ラッパー）への問い。**
 *
 * 棚には 3 種類が並んでいる。
 * - `vendor` 16 — 素材そのまま（再輸出しているだけ）
 * - `wrapped` 2 — 素材に薄皮を 1 枚（足した 1 点だけが自分の持ち物）
 * - `own` 10 — 全部自分で書いた（semantic 語彙しか使っていない）
 */
export const Default: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Viewpoint obs="I" />

      <Pair
        n={1}
        title="「四角い小さなコントロール」の角丸"
        prop="border-radius"
        look="チェックボックスの角と、カードの角を並べて見る。チェックボックスだけ角が立って見えるはず——周りが 8〜12px になった中で 4px だけ取り残されている。"
        left={{
          tag: 'vendor',
          name: 'Checkbox',
          code: 'rounded-[4px]',
          note: 'shadcn が発明した生値。トークンを 1 つも経由しないので、何を差し替えても 4px のまま。',
          demo: <Checkbox />,
        }}
        right={{
          tag: 'own',
          name: 'Card',
          code: 'rounded-xl → var(--radius-apple-l)',
          note: 'semantic 語彙を経由するので、トークンを動かすと 18px へ追従した（実測 18px）。',
          demo: (
            <Card>
              <span className="text-label">カード</span>
            </Card>
          ),
        }}
      />

      <Pair
        n={2}
        title="「危険を表す薄い面」の作り方"
        prop="background-color"
        look="「エラー」バッジと「緊急」ピルの面の濃さ。🟦 **own（16%）のほうが濃い**——実測でそうなる。差が小さくて分かりにくいのは当然で、10% と 16% の差でしかない。見てほしいのは濃淡そのものより「**片方は不透明度で、もう片方は専用色で作られている**」こと。"
        left={{
          tag: 'vendor',
          name: 'Badge — destructive',
          code: 'bg-destructive/10',
          note: '「意味色 + 不透明度」で作る。色は #ff3b30 に追従したが、10% はクラス名に焼き込み（実測 alpha 0.1）。',
          demo: <Badge variant="destructive">エラー</Badge>,
        }}
        right={{
          tag: 'own',
          name: 'StatusPill — danger',
          code: 'bg-fill-danger → --color-fill-danger',
          note: '専用の tint 色を直接参照する。実測 rgba(255,59,48,0.16)＝ 16%。vendor の 10% より濃い。',
          demo: <StatusPill tone="danger">緊急</StatusPill>,
        }}
      />

      <Pair
        n={3}
        title="「面の内側の余白」の取り方"
        prop="padding"
        look="🟥 **左右の余白の有無を見る。**Card の root は py- だけで px- を持たない（横の余白は CardContent が持つ）ので、素の children を入れると左右がゼロになる——実測 paddingLeft: 0px。これは私の使い方の誤りで、観点 I とは別のバグ。**正しくは CardContent を使う。**そのうえで見てほしいのは「16px という値がどこから来たか説明できるか」——Card は --card-spacing → --spacing-inset-md と辿れるが、Table は p-2 で行き止まり。"
        left={{
          tag: 'vendor',
          name: 'Table のセル',
          code: 'p-2 / px-4 …（直書き）',
          note: 'shadcn は spacing を 132 箇所直書きしている。自前の semantic 語彙を 1 つも使わない。',
          demo: (
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>セル</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          ),
        }}
        right={{
          tag: 'own',
          name: 'Card / Stack',
          code: '--card-spacing → --spacing-inset-md',
          note: '用途名の語彙を経由する。実測 paddingTop: 16px / paddingLeft: 0px（横は CardContent が持つ）。',
          demo: (
            <Card>
              <CardContent>
                <span className="text-label">inset-md（CardContent 経由）</span>
              </CardContent>
            </Card>
          ),
        }}
      />

      <MachineOnly
        n={4}
        title="wrapped は vendor と own のどちら寄りか"
        why="🟥 **これは目では答えられない。**Button が足した唯一の 1 点は当たり判定の拡張で、`@media (pointer: coarse)` 限定なので**デスクトップの Storybook では発火しない**。画面上は素材そのままに見える——ユーザー指摘（2026-07-27）で判明した。"
        rows={[
          {
            label: 'Button の角丸',
            got: '12px',
            read: 'rounded-[min(var(--radius-md),12px)]。素材のまま＝ vendor の性質',
          },
          {
            label: 'Button の高さ',
            got: '32px',
            read: 'h-8 の直書き。素材のまま＝ vendor の性質',
          },
          {
            label: 'Button の当たり判定（pointer: coarse）',
            got: '見た目 + inset -6px × 2',
            read: '製品層が足した唯一の行。semantic 語彙を参照＝ own の性質。🟥 デスクトップでは発火しない',
          },
        ]}
        conclusion="**wrapped は「vendor の中身に own の薄皮が 1 枚」。**測れる 3 項目のうち 2 つが vendor の性質で、own の性質は 1 つだけ、しかもそれは目に見えない。→ **ラッパーは薄い**ことの実証。"
      />

      <section className="border-border mt-8 border-t pt-4">
        <h3 className="font-emphasis text-heading mb-2">
          どちらに転んでも意味がある
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border-border border-t-2 pt-2">
            <p className="font-emphasis mb-1 text-sm">差が見えた場合</p>
            <p className="text-muted-foreground text-sm">
              手3 の D1=(c)
              が実証された。「素材はそのまま使い、足りないものだけ自作する」
              という境界の引き方が、
              <b>トークン差し替えへの追従という形で報われた</b>ことになる。
            </p>
          </div>
          <div className="border-border border-t-2 pt-2">
            <p className="font-emphasis mb-1 text-sm">差が見えなかった場合</p>
            <p className="text-muted-foreground text-sm">
              <b>製品層の存在意義を問い直す材料になる。</b>25
              ファイル書いて追従の質が 変わらないなら、再輸出 16
              件はコストに見合っていないかもしれない。 否定的な結果ではなく、
              <b>境界の引き直しを促す観測</b>。
            </p>
          </div>
        </div>
      </section>
    </div>
  ),
};
