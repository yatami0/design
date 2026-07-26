// 手2b D7: トークン見本。手5（トークン差し替え実験）で最初に見る面。
// ここが変わらなければ部品を見るまでもない＝判定の一段目。
//
// 🟥 生値を書かない。すべてユーティリティ経由で参照する（任意値禁止 lint がここでも効く）。
//    クラス名は Tailwind が静的に走査するため、変数で組み立てず literal で並べる。
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { ReactNode } from 'react';

const meta = {
  title: '① Tokens/Tokens',
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: ReactNode;
}): ReactNode {
  return (
    <section className="mb-8">
      <h2 className="text-heading font-emphasis">{title}</h2>
      <p className="text-label mb-3 text-muted-foreground">{note}</p>
      {children}
    </section>
  );
}

function Swatch({
  name,
  className,
}: {
  name: string;
  className: string;
}): ReactNode {
  return (
    <div className="flex items-center gap-inline-md">
      <div className={`size-10 rounded-md border border-border ${className}`} />
      <code className="text-label">{name}</code>
    </div>
  );
}

/** shadcn の semantic 色 18（トークンマッピング 2.1） */
export const Colors: Story = {
  render: () => (
    <Section
      title="色 — semantic（shadcn）"
      note="トークンマッピング 2.1 の 18 語彙。手5 ではここに tmp-admin の値が入る。"
    >
      <div className="grid grid-cols-3 gap-stack-md">
        <Swatch name="--background" className="bg-background" />
        <Swatch name="--foreground" className="bg-foreground" />
        <Swatch name="--card" className="bg-card" />
        <Swatch name="--popover" className="bg-popover" />
        <Swatch name="--primary" className="bg-primary" />
        <Swatch name="--primary-foreground" className="bg-primary-foreground" />
        <Swatch name="--secondary" className="bg-secondary" />
        <Swatch
          name="--secondary-foreground"
          className="bg-secondary-foreground"
        />
        <Swatch name="--muted" className="bg-muted" />
        <Swatch name="--muted-foreground" className="bg-muted-foreground" />
        <Swatch name="--accent" className="bg-accent" />
        <Swatch name="--accent-foreground" className="bg-accent-foreground" />
        <Swatch name="--destructive" className="bg-destructive" />
        <Swatch name="--border" className="bg-border" />
        <Swatch name="--input" className="bg-input" />
        <Swatch name="--ring" className="bg-ring" />
        <Swatch name="--card-foreground" className="bg-card-foreground" />
        <Swatch name="--popover-foreground" className="bg-popover-foreground" />
      </div>
    </Section>
  ),
};

/** component 層の色 8（トークンマッピング 2.2）— tmp-admin V5 とほぼ 1:1 で対応する群 */
export const SidebarColors: Story = {
  render: () => (
    <Section
      title="色 — component（--sidebar-*）"
      note="tmp-admin の V5「on-dark は --sidebar-* に隔離」と偶然にも同名。DR-0022 の component 層。"
    >
      <div className="grid grid-cols-3 gap-stack-md">
        <Swatch name="--sidebar" className="bg-sidebar" />
        <Swatch name="--sidebar-foreground" className="bg-sidebar-foreground" />
        <Swatch name="--sidebar-primary" className="bg-sidebar-primary" />
        <Swatch
          name="--sidebar-primary-foreground"
          className="bg-sidebar-primary-foreground"
        />
        <Swatch name="--sidebar-accent" className="bg-sidebar-accent" />
        <Swatch
          name="--sidebar-accent-foreground"
          className="bg-sidebar-accent-foreground"
        />
        <Swatch name="--sidebar-border" className="bg-sidebar-border" />
        <Swatch name="--sidebar-ring" className="bg-sidebar-ring" />
      </div>
    </Section>
  ),
};

/** --radius 1 変数から calc() で派生する 7 段（トークンマッピング 2.3） */
export const Radius: Story = {
  render: () => (
    <Section
      title="角丸 — --radius から派生する 7 段"
      note="H2B-07 の予行演習で動かすのはこの 1 変数。7 段すべてが calc() で追従するはず。"
    >
      <div className="flex flex-wrap gap-stack-md">
        <div className="rounded-sm size-16 bg-secondary p-inset-xs text-label">
          sm
        </div>
        <div className="rounded-md size-16 bg-secondary p-inset-xs text-label">
          md
        </div>
        <div className="rounded-lg size-16 bg-secondary p-inset-xs text-label">
          lg
        </div>
        <div className="rounded-xl size-16 bg-secondary p-inset-xs text-label">
          xl
        </div>
        <div className="rounded-2xl size-16 bg-secondary p-inset-xs text-label">
          2xl
        </div>
        <div className="rounded-3xl size-16 bg-secondary p-inset-xs text-label">
          3xl
        </div>
        <div className="rounded-4xl size-16 bg-secondary p-inset-xs text-label">
          4xl
        </div>
      </div>
    </Section>
  ),
};

/** 手2 で自前定義した semantic spacing 9（DR-0019） */
export const Spacing: Story = {
  render: () => (
    <Section
      title="余白 — semantic（手2 で自前定義。DR-0019）"
      note="shadcn は spacing トークンを 1 つも持たない。用途名で足したのがこの 9 語彙。値は Tailwind の --spacing への参照。"
    >
      <div className="flex flex-col gap-stack-sm">
        <div className="bg-muted p-inset-xs text-label">
          p-inset-xs — セル・小コントロール
        </div>
        <div className="bg-muted p-inset-sm text-label">
          p-inset-sm — 密なカード
        </div>
        <div className="bg-muted p-inset-md text-label">
          p-inset-md — カード既定
        </div>
        <div className="bg-muted p-inset-lg text-label">
          p-inset-lg — ページ本文
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-stack-sm">
        <div className="flex gap-inline-sm">
          <span className="bg-muted text-label">gap-inline-sm</span>
          <span className="bg-muted text-label">アイコンとラベル</span>
        </div>
        <div className="flex gap-inline-md">
          <span className="bg-muted text-label">gap-inline-md</span>
          <span className="bg-muted text-label">ボタン間</span>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-stack-lg">
        <div className="bg-muted text-label">gap-stack-lg（カード間）</div>
        <div className="bg-muted text-label">gap-stack-lg</div>
      </div>
    </Section>
  ),
};

/** 手2 で自前定義した semantic typography 5 + 強調 weight（DR-0019） */
export const Typography: Story = {
  render: () => (
    <Section
      title="タイポ — semantic（手2 で自前定義。DR-0019）"
      note="用途の切り方は tmp-admin §4.3 の使い分け規定に対応させた。Tailwind の text-* はサイズ名＝primitive。"
    >
      <div className="flex flex-col gap-stack-sm">
        <p className="text-heading">
          text-heading — セクション・シートの見出し
        </p>
        <p className="text-emphasis">
          text-emphasis — 氏名・検索など目を引かせる本文
        </p>
        <p className="text-body">text-body — 本文</p>
        <p className="text-table">text-table — テーブル本文</p>
        <p className="text-label">text-label — th・補助・キャプション</p>
        <p className="text-body font-emphasis">
          font-emphasis — 強調（tmp-admin V3「色でなく weight で」の受け皿）
        </p>
      </div>
    </Section>
  ),
};
