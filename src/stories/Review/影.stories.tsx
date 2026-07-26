// 手5 案2 — 判定軸カタログ（観点 C）。
// shadcn の 3 段（sm/md/lg）を apple の 2 段（--shadow-1/2）へ多:1 で潰した。
// **段の区別が失われて平坦に見えないか**を、実際に使っている 7 箇所を並べて見る。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Viewpoint, Group, Spec } from './_spec';

const meta = {
  title: '★ Review/C 影',
  tags: ['review'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 影は `:root` に変数を出さない（**ビルド時解決**＝DR-0044）。
 * `@theme` の `--shadow-*` を書き換えると、生成 CSS の**規則そのもの**が変わる。
 * 手5 の 1 周目で **CSS 規則 707 件のうち変わった 4 件は全部これ**だった。
 */
export const Default: Story = {
  render: () => (
    <div className="bg-muted/30 max-w-3xl p-6">
      <Viewpoint obs="C" />
      <Group
        title="1. 差し替え後の 2 段"
        note="apple --shadow-1 = 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04) ／ --shadow-2 = 0 8px 30px rgba(0,0,0,.10)。素の shadcn は 3 段だった。"
      >
        <div className="flex flex-wrap items-center gap-8 py-6">
          <div className="bg-card flex size-24 items-center justify-center rounded-lg shadow-sm">
            <span className="font-mono text-xs">shadow-1</span>
          </div>
          <div className="bg-card flex size-24 items-center justify-center rounded-lg shadow-lg">
            <span className="font-mono text-xs">shadow-2</span>
          </div>
        </div>
      </Group>

      <Group
        title="2. 🟥 潰れた 3 段（sm と md が同じになった）"
        note="ここが観点。shadcn は sm / md / lg で 3 段の奥行きを作っていたが、apple は 2 段しか持たないので sm と md を --shadow-1 に寄せた。並べて区別がつかなくなっていないか。"
      >
        <div className="flex flex-wrap items-center gap-8 py-6">
          <div className="bg-card flex size-24 items-center justify-center rounded-lg shadow-sm">
            <span className="font-mono text-xs">sm</span>
          </div>
          <div className="bg-card flex size-24 items-center justify-center rounded-lg shadow-md">
            <span className="font-mono text-xs">md</span>
          </div>
          <div className="bg-card flex size-24 items-center justify-center rounded-lg shadow-lg">
            <span className="font-mono text-xs">lg</span>
          </div>
        </div>
      </Group>

      <Group
        title="3. 実際に使っている 7 箇所"
        note="🟥 DropdownMenu だけが md と lg の 2 段階を使い分けている。そこが潰れると階層が読めなくなる可能性がある。"
      >
        <Spec
          flag="🟦"
          label="dropdown-menu.tsx:46 shadow-md → shadow-1"
          expect="サブメニュー側"
        >
          <div className="bg-card size-16 rounded-lg shadow-md" />
        </Spec>
        <Spec
          flag="🟥"
          label="dropdown-menu.tsx:247 shadow-lg → shadow-2"
          expect="🟥 同じ部品の中で 2 段階。上と区別がつくか？"
        >
          <div className="bg-card size-16 rounded-lg shadow-lg" />
        </Spec>
        <Spec
          flag="🟦"
          label="popover.tsx:33 / select.tsx:72 shadow-md → shadow-1"
          expect="浮きもの 2 種。DropdownMenu の md と同じ影になる"
        >
          <div className="bg-card size-16 rounded-lg shadow-md" />
        </Spec>
        <Spec
          flag="🟦"
          label="sheet.tsx:65 shadow-lg → shadow-2"
          expect="右スライドの詳細シート。一番強い影"
        >
          <div className="bg-card size-16 rounded-lg shadow-lg" />
        </Spec>
        <Spec
          flag="🟦"
          label="sidebar.tsx:244 · 309 shadow-sm → shadow-1"
          expect="floating / inset variant のときだけ出る"
        >
          <div className="bg-card size-16 rounded-lg shadow-sm" />
        </Spec>
        <Spec
          flag="🟨"
          label="sidebar.tsx:325 shadow-none"
          expect="上書きに巻き込まれていないこと（影が付いていなければ正常）"
        >
          <div className="bg-card border-border size-16 rounded-lg border shadow-none" />
        </Spec>
      </Group>
    </div>
  ),
};
