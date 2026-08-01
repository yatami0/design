// 手5 案2 — 判定軸カタログ（観点 I）。★ 重点
//
// 🟥 **最初は 3 群をただ並べただけで観点が伝わらなかった**（ユーザー指摘 2026-07-27）。
//    「どれとどれを、どのプロパティで比べるか」を名指ししていなかったため。
//    → **同じ役割のものを 2 つ選び、1 つのプロパティだけを見る**形に組み替えた。
//
// 解説（詳細版）: https://claude.ai/code/artifact/6646b4ea-43f5-433a-89c3-5305f42ecbc0
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/Action/Button';
import { Badge } from '@/components/Communication/Badge';
import { StatusPill } from '@/components/DataDisplay/StatusPill';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/DataDisplay/Table';
import { Card } from '@/components/Layout/Card';
import { Stack } from '@/components/Layout/Stack';
import { Checkbox } from '@/components/Selection/Checkbox';
import { Pair, Viewpoint } from './_spec';

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
          code: 'rounded-lg → var(--radius-apple-m)',
          note: 'semantic 語彙を経由するので、トークンを動かすと 12px へ追従した。',
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
        look="「エラー」バッジと「緊急」ピルの面の濃さ。同じ赤なのに濃さが違う。これは値のずれではなく、作り方そのものが違うことの現れ。"
        left={{
          tag: 'vendor',
          name: 'Badge — destructive',
          code: 'bg-destructive/20',
          note: '「意味色 + 不透明度」で作る。色は #ff3b30 に追従したが、20% はクラス名に焼き込み。',
          demo: <Badge variant="destructive">エラー</Badge>,
        }}
        right={{
          tag: 'own',
          name: 'StatusPill — danger',
          code: 'bg-fill-danger → --color-fill-danger',
          note: '専用の tint 色を直接参照する。実測 rgba(255,59,48,0.16)。',
          demo: <StatusPill tone="danger">緊急</StatusPill>,
        }}
      />

      <Pair
        n={3}
        title="「面の内側の余白」の取り方"
        prop="padding"
        look="余白そのものより「語彙の名前で説明できるか」。Card は「inset-md だから 16px」と言えるが、Table は「p-2 だから 8px」としか言えない。見た目は同じでも、意味が乗っているかが違う。"
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
          note: '用途名の語彙を経由する。実測 16px。',
          demo: (
            <Card>
              <Stack gap="sm">
                <span className="text-label">inset-md</span>
              </Stack>
            </Card>
          ),
        }}
      />

      <Pair
        n={4}
        title="wrapped は vendor と own のどちら寄りか"
        prop="複数"
        look="Button を vendor 群と own 群の間に置いて眺める。見た目は vendor 寄り（角丸も高さも素材のまま）で、足した 1 点だけが own 寄りのはず。そう見えるなら「ラッパーは薄い」ことの実証。🟥 ここだけは判断が要る——vendor 寄り / own 寄り / どちらとも言えない のどれか。"
        left={{
          tag: 'wrapped が足した 1 点',
          name: 'Button の当たり判定',
          code: 'pointer-coarse:after:-inset-(--spacing-hit-expand)',
          note: '製品層が書いた唯一の行。semantic 語彙を参照している＝ own の性質。（タッチ環境でしか出ないので画面上は見えない）',
          demo: <Button>default</Button>,
        }}
        right={{
          tag: 'wrapped の中身',
          name: 'Button の角丸・高さ・色',
          code: 'rounded-[min(var(--radius-md),12px)] / h-8',
          note: '全部 shadcn のまま。任意値も高さの直書きも残っている＝ vendor の性質。',
          demo: (
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">outline</Button>
              <Button variant="destructive">destructive</Button>
            </div>
          ),
        }}
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
