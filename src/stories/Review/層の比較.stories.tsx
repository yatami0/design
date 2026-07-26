// 手5 案2 — 判定軸カタログ（観点 I）。★ 重点
// vendor（素材そのまま）/ wrapped（既定値ラッパー）/ own（自作）を**同じ画面に**並べる。
//
// 🟥 **これは製品層の存在意義そのものへの問い。**
//    own が綺麗に追従し vendor が取り残されるなら、手3 の D1=(c) が実証されたことになる。
//    差が出ないなら、製品層を作った意味を問い直す材料になる。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from '@/components/Action/Button';
import { Badge } from '@/components/Communication/Badge';
import { Skeleton } from '@/components/Communication/Skeleton';
import { StatusPill } from '@/components/DataDisplay/StatusPill';
import { Card } from '@/components/Layout/Card';
import { Grid } from '@/components/Layout/Grid';
import { Inline } from '@/components/Layout/Inline';
import { Stack } from '@/components/Layout/Stack';
import { Checkbox } from '@/components/Selection/Checkbox';
import { Input } from '@/components/TextInput/Input';
import { Viewpoint, Group } from './_spec';

const meta = {
  title: '★ Review/I 層の比較',
  tags: ['review'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 棚には 3 種類のものが同じ階層に並んでいる。**由来の違いが追従の質に出るか。**
 *
 * | タグ | 数 | 中身 | 期待 |
 * | --- | --- | --- | --- |
 * | `vendor` | 16 | 素材そのまま（窓口を 1 本にするためだけに通している） | 🟨 shadcn の書き方次第 |
 * | `wrapped` | 2 | 既定値だけ上書き（Button・Sidebar） | 🟦 追従するはず |
 * | `own` | 10 | 自作（Layout 9 + StatusPill） | 🟦 **必ず追従するはず** |
 */
export const Default: Story = {
  render: () => (
    <div className="max-w-3xl">
      <Viewpoint obs="I" />
      <Group
        title="🟨 vendor（16 件）— 素材そのまま"
        note="製品層は再輸出しているだけで、中身は shadcn が書いたコード。任意値・不透明度修飾・variant がそのまま残っている＝追従は shadcn の書き方次第。"
      >
        <div className="py-4">
          <Stack gap="sm">
            <Inline gap="md">
              <Badge>ラベル</Badge>
              <Badge variant="destructive">エラー</Badge>
              <Badge variant="secondary">補助</Badge>
            </Inline>
            <Inline gap="md">
              <Checkbox />
              <span className="text-body">
                Checkbox — 角丸は rounded-[4px] の生値。🟥 動かない
              </span>
            </Inline>
            <Input placeholder="Input — 面は bg-input/30、リングは ring-ring/50" />
            <Skeleton className="h-4 w-64" />
          </Stack>
        </div>
      </Group>

      <Group
        title="🟦 wrapped（2 件）— 既定値だけ上書きしたラッパー"
        note="素材を包んで既定値を足しただけ。Button は当たり判定 44px を、Sidebar は nav-item の min-height を足している。中身は素材のままなので、追従の質は vendor に近いはず。"
      >
        <div className="py-4">
          <Inline gap="md">
            <Button>default</Button>
            <Button variant="outline">outline</Button>
            <Button variant="secondary">secondary</Button>
            <Button variant="destructive">destructive</Button>
          </Inline>
        </div>
      </Group>

      <Group
        title="🟦 own（10 件）— 自作。semantic 語彙しか使っていない"
        note="Layout 9 件 + StatusPill。Box への逃げは 0 回。数値の段もパレット色も 1 つも書いていないので、理屈の上では 100% 追従するはず。"
      >
        <div className="py-4">
          <Stack gap="md">
            <Inline gap="md">
              <StatusPill tone="success">解決</StatusPill>
              <StatusPill tone="warning">進行中</StatusPill>
              <StatusPill tone="danger">緊急</StatusPill>
              <StatusPill tone="neutral">新規</StatusPill>
            </Inline>
            <Grid columns={3} gap="md">
              <Card>
                <span className="text-body">
                  Card — inset は --card-spacing
                </span>
              </Card>
              <Card>
                <span className="text-body">
                  レイヤ外から semantic へ向け替え済み
                </span>
              </Card>
              <Card>
                <span className="text-body">部品は 1 行も触っていない</span>
              </Card>
            </Grid>
          </Stack>
        </div>
      </Group>

      <Group
        title="🟥 見てほしいこと"
        note="① own の 3 群だけが綺麗に tmp-admin の見た目になっているか ② vendor に「色は合っているが濃さ・角丸が違う」ものが混じっているか ③ wrapped は vendor と own のどちら寄りか。③ が vendor 寄りなら『ラッパーは薄すぎる』という判断材料になる。"
      >
        <div className="py-2" />
      </Group>
    </div>
  ),
};
