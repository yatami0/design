# COMPONENTS — Props とつかい方の説明書

自作・ラッパー部品の Props リファレンス。**生きた使用例は `src/stories/` の各 story が最も正確**。
shadcn 素通しの素材（Dialog / Select / Checkbox 等）は本家 https://ui.shadcn.com/docs のままなので末尾の一覧のみ。

横断ルール:

- **`className` を受け取れるのは `Box` と `Button`（と shadcn 素通し部品）のみ。**他の自作部品は型から `className` / `style` を除いてある。スタイルの逃げ道は `Box` に集約。
- **語彙定数も API の一部**: `PERIOD_PRESETS` / `PIVOT_INTENSITIES` / `DATE_PICKER_MODES` / `buttonVariants`。
- **`scrollLabel`** は `DataGrid` / `PivotTable` 共通の口。横スクロールする器がキーボード焦点を得るときの名前（a11y 対策）。
- 公開 API の正本は `src/index.ts`。

---

## Layout

### Box

内側余白（padding）だけを持つ汎用の箱。Layout 部品の中で唯一 `className` / `style` を受け取れる「逃げ道」。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `inset` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg'` | - | `'none'` | 面の内側 padding（semantic 用途名のみ） |
| `className` | `string` | - | - | 逃げ道。Layout ではここだけ |
| その他 | `React.ComponentProps<'div'>` 全部 | - | - | div の標準属性 |

```tsx
import { Box } from '@/components/Layout/Box';

<Box inset="md" className="rounded-md border">
  <p>任意の内容</p>
</Box>
```

注意: 逃げ道はここ 1 つだけ、多用しない前提の部品。

### Stack

子要素を縦に積む。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `gap` | `'none' \| 'sm' \| 'md' \| 'lg'` | - | `'md'` | 縦の要素間 |
| `inset` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg'` | - | `'none'` | 面の内側 padding |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | - | `'stretch'` | 交差軸の揃え |

`className` / `style` は型レベルで受け取れない（以下 Layout 部品は同様）。

```tsx
import { Stack } from '@/components/Layout/Stack';

<Stack gap="lg" inset="md" align="start">
  <h2>見出し</h2>
  <p>本文</p>
</Stack>
```

### Inline

子要素を横に並べる。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `gap` | `'none' \| 'sm' \| 'md'` | - | `'md'` | 横の要素間（`lg` は無い） |
| `inset` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg'` | - | `'none'` | 面の内側 padding |
| `align` | `'start' \| 'center' \| 'end' \| 'stretch'` | - | `'center'` | 交差軸の揃え |
| `justify` | `'start' \| 'center' \| 'end' \| 'between'` | - | `'start'` | 主軸の配置 |
| `wrap` | `boolean` | - | `false` | 折返しを許すか |

```tsx
import { Inline } from '@/components/Layout/Inline';

<Inline gap="sm" justify="between" wrap>
  <span>ラベル</span>
  <span>値</span>
</Inline>
```

### Grid

格子（段組み）レイアウト。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `columns` | `1 \| 2 \| 3 \| 4 \| 6 \| 12` | - | `1` | 列数（有限集合。5 列等は型で弾かれる） |
| `gap` | `'none' \| 'sm' \| 'md' \| 'lg'` | - | `'md'` | 要素間 |
| `inset` | `'none' \| 'xs' \| 'sm' \| 'md' \| 'lg'` | - | `'none'` | 面の内側 padding |

```tsx
import { Grid } from '@/components/Layout/Grid';

<Grid columns={3} gap="md">
  <div>1</div><div>2</div><div>3</div>
</Grid>
```

### Container

最大幅を与えて中央寄せする器。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `width` | `'content' \| 'wide' \| 'full'` | - | `'content'` | 最大幅（`--container-content` / `--container-wide`） |
| `gutter` | `boolean` | - | `true` | 画面端の余白 `--spacing-gutter` を入れるか |

```tsx
import { Container } from '@/components/Layout/Container';

<Container width="wide">
  <main>ページ本文</main>
</Container>
```

### Section

見出し + 本体をひとまとまりにした区画（`<section>` + `<h2>`）。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `heading` | `React.ReactNode` | - | - | 見出し。未指定なら `<h2>` 自体を描かない |
| `gap` | `'none' \| 'sm' \| 'md' \| 'lg'` | - | `'md'` | 見出しと本体の間隔 |

見出しレベルは `h2` 固定（`as` の口は無い）。

```tsx
import { Section } from '@/components/Layout/Section';

<Section heading="最近の更新">
  <p>本文</p>
</Section>
```

### Spacer

明示的な縦の空き（`aria-hidden`、children 不可）。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `size` | `'sm' \| 'md' \| 'lg'` | - | `'md'` | 空きの高さ |

```tsx
import { Spacer } from '@/components/Layout/Spacer';

<Spacer size="lg" />
```

### Layout/tokens.ts（語彙定数）

Layout 系 props が取れる値の有限集合。自作部品を増やすときはここの語彙を使う。

| 名前 | キー |
|---|---|
| `INSET` / `Inset` | `none, xs, sm, md, lg` |
| `STACK_GAP` / `StackGap` | `none, sm, md, lg` |
| `INLINE_GAP` / `InlineGap` | `none, sm, md` |
| `STACK_SIZE` / `StackSize` | `sm, md, lg` |
| `COLUMNS` / `Columns` | `1, 2, 3, 4, 6, 12` |
| `WIDTH` / `Width` | `content, wide, full` |
| `FIELD_WIDTH` / `FieldWidth` | `sm, md, lg`（`--container-field-*`） |
| `ALIGN` / `Align` / `JUSTIFY` / `Justify` | 上記 align/justify の値 |
| `NoStyleProps` | `Omit<React.ComponentProps<'div'>, 'className' \| 'style'>` |

注意: クラス名は静的な文字列テーブルで持つ。`` `p-inset-${x}` `` のようなテンプレート結合は Tailwind の静的抽出が効かないので不可。

---

## DataDisplay

### DataGrid

行 = レコードの一覧表。行そのものを押して詳細を開く形（行アクション列は持たない）。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `data` | `TData[]` | ✅ | - | 表示するレコード配列 |
| `columns` | `DataGridColumn<TData>[]` | ✅ | - | 列定義 |
| `onRowSelect` | `(row: TData) => void` | - | - | 渡すと行が `role="button"` + Enter/Space 対応になる |
| `empty` | `React.ReactNode` | - | - | 0 件時に代わりに描くもの（`EmptyState` を差す） |
| `scrollLabel` | `string` | - | - | 横スクロールする器に付ける名前 |

`DataGridColumn<TData>`:

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `key` | `string` | ✅ | - | 列の ID |
| `header` | `React.ReactNode` | ✅ | - | 列見出し |
| `accessor` | `(row: TData) => React.ReactNode` | ✅ | - | セルの中身（`StatusPill` 等の合成はここ） |
| `kind` | `'text' \| 'numeric'` | - | `'text'` | `numeric` は部品側が等幅 + `tabular-nums` を当てる |
| `emphasis` | `boolean` | - | `false` | 行の主役の列を強調書式に |

```tsx
import { DataGrid } from '@/components/DataDisplay/DataGrid';

<DataGrid
  data={tickets}
  columns={[
    { key: 'id', header: 'ID', accessor: (t) => t.id, kind: 'numeric' },
    { key: 'subject', header: '件名', accessor: (t) => t.subject, emphasis: true },
  ]}
  onRowSelect={(t) => state.select(t)}
/>
```

注意: TanStack の `ColumnDef` は公開 API から外してある。書式クラス（`tabular-nums` 等）は呼び出し側で書かず `kind` / `emphasis` で指定する。

### StatusPill

状態を「tint の pill + 色ドット」で表すバッジ（shadcn Badge に success/warning が無いため自作）。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `tone` | `'success' \| 'warning' \| 'danger' \| 'neutral'` | - | `'neutral'` | 色調 |
| `children` | `React.ReactNode` | ✅ | - | ラベル文言 |

```tsx
import { StatusPill } from '@/components/DataDisplay/StatusPill';

<StatusPill tone="success">完了</StatusPill>
```

### DescriptionList

項目名と値の対を並べる記述リスト（`<dl>`）。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `items` | `DescriptionListItem[]` | ✅ | - | 並べる項目 |
| `columns` | `1 \| 2 \| 3` | - | `1` | 段組み |
| `orientation` | `'vertical' \| 'horizontal'` | - | `'vertical'` | 項目名を値の上に置くか左に置くか |

`DescriptionListItem`: `key: string` / `term: string` / `description: React.ReactNode`（すべて必須。`description` が部品合成の口）

```tsx
import { DescriptionList } from '@/components/DataDisplay/DescriptionList';

<DescriptionList
  columns={2}
  orientation="horizontal"
  items={[
    { key: 'status', term: 'ステータス', description: <StatusPill tone="success">完了</StatusPill> },
  ]}
/>
```

### Timeline

出来事を時系列に連ねて見せる器（軌道の縦線と点、見出し・添え字・本文の置き場のみ。色は意図的に持たない）。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `events` | `TimelineEvent[]` | ✅ | - | 出来事の配列 |

`TimelineEvent`:

| prop | 型 | 必須 | 意味 |
|---|---|---|---|
| `key` | `string` | ✅ | React の key |
| `title` | `React.ReactNode` | ✅ | 見出し（誰が・何を）。`Link` などを差せる |
| `meta` | `string` | - | 添え字（いつ）。1 行に収まる短い文字列 |
| `details` | `string[]` | - | 明細を 1 行ずつ。書式（小さく muted）は部品が持つ |
| `children` | `React.ReactNode` | - | 本文（自由なもの） |

```tsx
import { Timeline } from '@/components/DataDisplay/Timeline';

<Timeline events={[
  { key: '1', title: '山田が更新', meta: '2026-08-01', details: ['ステータス: 新規 → 進行中'] },
]} />
```

### PivotTable

行 × 列の交点を濃淡付きで見せるピボット表。畳み込み（集計）は持たず、畳んだ結果を受け取る。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `columns` | `PivotColumn[]` | ✅ | - | 列定義 |
| `rows` | `PivotRow[]` | ✅ | - | 行定義 |
| `corner` | `React.ReactNode` | - | - | 左上の角（行ヘッダ列の見出し） |
| `footer` | `PivotRow` | - | - | 合計行（`tfoot`）。`rows` に混ぜない |
| `empty` | `React.ReactNode` | - | - | 0 行時に代わりに描くもの |
| `scrollLabel` | `string` | - | - | 横スクロールする器の名前 |

- `PivotColumn`: `key: string` / `header: React.ReactNode` / `muted?: boolean`（列を控えめに描く）
- `PivotRow`: `key: string` / `header: React.ReactNode`（横スクロールしても固定）/ `cells: ReadonlyMap<string, PivotCell>`
- `PivotCell`: `value: React.ReactNode` / `intensity?: 'none' | 'low' | 'mid' | 'high' | 'peak'`（既定 `'none'`）

```tsx
import { PivotTable } from '@/components/DataDisplay/PivotTable';

<PivotTable
  corner="担当者"
  columns={[{ key: 'd1', header: '8/1' }, { key: 'd2', header: '8/2', muted: true }]}
  rows={[{ key: 'u1', header: '山田', cells: new Map([['d1', { value: '7.5', intensity: 'high' }]]) }]}
  footer={{ key: 'total', header: '合計', cells: new Map([['d1', { value: '7.5' }]]) }}
/>
```

注意: `cells` は配列ではなく Map（列ずれが無音になるのを防ぐ）。濃淡の段階の刻み方（何をもって high とするか）は使う側の都合で、`intensity` の 5 語だけが境界を越える。定数 `PIVOT_INTENSITIES` も export されている。

---

## Selection（自作分）

### PeriodSelect

期間プリセット（有限語彙）のセレクタ。`custom` のときだけ範囲入力（内部で `DatePicker mode="range"`）を出す。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `value` | `'all' \| 'thisWeek' \| 'thisMonth' \| 'thisQuarter' \| 'custom'` | ✅ | - | 選択中のプリセット |
| `onValueChange` | `(value: PeriodPreset) => void` | ✅ | - | プリセット変更時 |
| `range` | `{ from: Date; to: Date }` | - | - | `custom` のときの範囲（他の値では無視） |
| `onRangeChange` | `(range: PeriodRange) => void` | - | - | 範囲変更時 |
| `width` | `'sm' \| 'md' \| 'lg'` | - | `'md'` | トリガの幅 |
| `aria-label` | `string` | - | `'期間'` | 支援技術に読ませる名前 |

```tsx
import { PeriodSelect } from '@/components/Selection/PeriodSelect';

<PeriodSelect value={preset} onValueChange={setPreset} range={range} onRangeChange={setRange} />
```

注意: 「プリセットが実際にいつからいつまでか」は知らない——起点や四半期の定義はアプリ側の知識。この部品は語彙と器だけ。定数 `PERIOD_PRESETS` も export されている。

### DatePicker

Popover + Calendar を合成した日付／期間の選択トリガ。`mode` による判別ユニオンで `value` / `onValueChange` の型が変わる。

共通 props:

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `width` | `'sm' \| 'md' \| 'lg'` | - | 幅指定なし | トリガの幅 |
| `disabled` | `boolean` | - | `false` | 無効化 |
| `placeholder` | `string` | - | mode 別既定 | 未選択時の表示 |
| `locale` | Calendar の `locale` | - | ブラウザ既定 | 曜日名・月名の言語 |
| `aria-label` | `string` | - | トリガ文言 | 支援技術に読ませる名前 |

- `mode="single"`（既定）: `value?: Date` / `onValueChange?: (value: Date) => void`
- `mode="range"`（リテラル必須）: `value?: { from: Date; to: Date }` / `onValueChange?: (value: DateRange) => void`（両端が揃ったときだけ呼ばれる）

```tsx
import { DatePicker } from '@/components/Selection/DatePicker';

<DatePicker value={date} onValueChange={setDate} width="md" />
<DatePicker mode="range" value={range} onValueChange={setRange} />
```

注意: `Calendar` 単体は意図的に export していない（`classNames` を 20 個以上受ける設定塊のため。到達経路はこの部品だけ）。表示書式は `yyyy-MM-dd` 固定。

---

## Navigation / Action（ラッパー）

### Link

Tailwind Preflight で剥がされたリンクの見た目（色・hover 下線）を足し直す `<a>` ラッパー。

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `href` | `string` | ✅ | - | リンク先 |
| `tone` | `'primary' \| 'muted'` | - | `'primary'` | 色調 |
| `external` | `boolean` | - | `false` | true で `target="_blank"` + `rel="noopener noreferrer"` を部品側が付ける |
| `children` | `React.ReactNode` | ✅ | - | リンク文言 |

`className` / `style` は不可。その他の `<a>` 標準属性は素通し。

```tsx
import { Link } from '@/components/Navigation/Link';

<Link href="https://example.com" external tone="muted">外部サイト</Link>
```

### Button

shadcn Button の既定値ラッパー。見た目は 32px のまま、粗いポインタ（タッチ）時だけ当たり判定を 44px に広げる。Props は shadcn Button の素通し:

| prop | 型 | default |
|---|---|---|
| `variant` | `'default' \| 'outline' \| 'secondary' \| 'ghost' \| 'destructive' \| 'link'` | `'default'` |
| `size` | `'default' \| 'xs' \| 'sm' \| 'lg' \| 'icon' \| 'icon-xs' \| 'icon-sm' \| 'icon-lg'` | `'default'`（h-8） |
| `asChild` | `boolean`（トリガ合成用 Slot） | `false` |
| `className` ほか | `<button>` 標準属性 | - |

```tsx
import { Button } from '@/components/Action/Button';

<Button variant="outline" size="sm" onClick={onSave}>保存</Button>
```

`buttonVariants` も再輸出されている（`cva`）。

---

## Patterns

### EmptyState

一覧が空のときに説明と主要操作を出す空状態。

| prop | 型 | 必須 | 意味 |
|---|---|---|---|
| `title` | `string` | ✅ | 見出し |
| `description` | `string` | ✅ | 説明文 |
| `action` | `React.ReactNode` | - | 主要操作。**1 つだけ**（増やしたくなったら一覧側の設計を疑う） |

```tsx
import { EmptyState } from '@/patterns/EmptyState';

<EmptyState title="チケットがありません" description="条件を変えて検索してください"
  action={<Button>新規作成</Button>} />
```

### PageHeader

画面の頭（見出し・パンくず・右肩の操作）の並びと間隔だけを持つ。`AppShell` の children の先頭に画面側が置く。

| prop | 型 | 必須 | 意味 |
|---|---|---|---|
| `title` | `string` | ✅ | 画面の見出し（`h1`）。1 画面に 1 つ |
| `breadcrumb` | `React.ReactNode` | - | パンくず（`Breadcrumb` を差す） |
| `actions` | `React.ReactNode` | - | 右肩の操作（ボタン・期間セレクタなど） |

```tsx
import { PageHeader } from '@/patterns/PageHeader';

<PageHeader title="チケット一覧"
  actions={<PeriodSelect value={preset} onValueChange={setPreset} />} />
```

### FilterBar / FilterField

絞り込みコントロールを並べる「帯」。何で絞るかはアプリ側の知識で、帯は並び・間隔・折返しだけを持つ。

- `FilterBar`: `children`（`FilterField` を並べる）のみ
- `FilterField`: `label: string`（✅）/ `children: React.ReactNode`（✅・コントロール 1 個）

```tsx
import { FilterBar, FilterField } from '@/patterns/FilterBar';

<FilterBar>
  <FilterField label="ステータス"><Select /* … */ /></FilterField>
  <FilterField label="担当者"><Select /* … */ /></FilterField>
</FilterBar>
```

注意: `FilterField` は `<label>` で包む実装。中の最初の labelable 要素（`<button>` 等）に暗黙で紐づくので、`<span>` だけを入れると支援技術から名前が取れない。

### FormLayout / FormField

フォームの器と 1 枠。**コアは「値」を持たない**——react-hook-form / zod は import せず、状態管理と検証は画面側の持ち物。エラーはただの文字列として降りてくる。

`FormLayoutProps`:

| prop | 型 | 必須 | 意味 |
|---|---|---|---|
| `children` | `React.ReactNode` | ✅ | `FormField` を並べる |
| `actions` | `React.ReactNode` | - | 送信・取消など（右寄せの並びは器が持つ） |
| `notice` | `React.ReactNode` | - | フォーム全体に掛かる知らせ（`Alert` を差す） |
| `onSubmit` | form の submit handler | - | `preventDefault` は呼び出し側の責務 |

`FormFieldProps`:

| prop | 型 | 必須 | default | 意味 |
|---|---|---|---|---|
| `label` | `string` | ✅ | - | 枠の見出し |
| `htmlFor` | `string` | ✅ | - | コントロールの `id` と結ぶ |
| `required` | `boolean` | - | `false` | 必須の印を出すか |
| `description` | `string` | - | - | 補足。エラー中も消えない |
| `error` | `string` | - | - | エラー文。未指定・空文字はエラー無し |
| `children` | `React.ReactNode` | ✅ | - | コントロール 1 個 |

```tsx
import { FormLayout, FormField } from '@/patterns/FormLayout';

<FormLayout onSubmit={handleSubmit} actions={<Button type="submit">保存</Button>}>
  <FormField label="件名" htmlFor="subject" required error={errors.subject?.message}>
    <Input id="subject" />
  </FormField>
</FormLayout>
```

### ListDetail + useListDetail

一覧と詳細シート（右スライド Sheet）を突き合わせるパターン。**必ず `useListDetail` とセットで使う。**

`useListDetail<T>()` の返り値（= `ListDetailState<T>`）:

| フィールド | 型 | 意味 |
|---|---|---|
| `selected` | `T \| null` | 選択中の項目 |
| `open` | `boolean` | `selected !== null` と同義 |
| `select` | `(item: T) => void` | 項目を選ぶ（行クリックに繋ぐ） |
| `onOpenChange` | `(open: boolean) => void` | false で選択を解除 |

`ListDetailProps<T>`:

| prop | 型 | 必須 | 意味 |
|---|---|---|---|
| `state` | `ListDetailState<T>` | ✅ | `useListDetail()` の返り値をそのまま渡す |
| `list` | `React.ReactNode` | ✅ | 一覧側（`state.select` を行クリックに繋ぐのは呼び出し側） |
| `title` | `(item: T) => React.ReactNode` | ✅ | 詳細シートの見出し |
| `detail` | `(item: T) => React.ReactNode` | ✅ | 詳細シートの中身 |

```tsx
import { ListDetail } from '@/patterns/ListDetail';
import { useListDetail } from '@/patterns/useListDetail';

const state = useListDetail<Ticket>();

<ListDetail
  state={state}
  list={<DataGrid data={tickets} columns={cols} onRowSelect={state.select} />}
  title={(t) => t.subject}
  detail={(t) => <DescriptionList items={toItems(t)} />}
/>
```

---

## Templates

### AppShell

ページ骨格。濃紺サイドバー（chrome）／キャンバス／白カードの 3 層構造。**画面はここから始める。**

| prop | 型 | 必須 | 意味 |
|---|---|---|---|
| `brand` | `React.ReactNode` | ✅ | サイドバーの見出し（プロダクト名など） |
| `nav` | `NavItem[]` | ✅ | サイドバーのメニュー項目 |
| `children` | `React.ReactNode` | ✅ | キャンバス側の中身（内部で `Container width="wide"` + `Stack gap="lg" inset="lg"` に包まれる） |

`NavItem`: `key: string` / `label: string` / `active?: boolean`（現在地）

```tsx
import { AppShell } from '@/templates/AppShell';

<AppShell brand="My Admin" nav={[{ key: 'tickets', label: 'チケット', active: true }]}>
  <PageHeader title="チケット一覧" />
  {/* 白カード（Card）は中身の側が置く */}
</AppShell>
```

注意: `SidebarProvider`（`AppProviders` に含まれる）で包まれている必要がある。`PageHeader` 相当の props は意図的に持たない。

---

## shadcn 素通しの素材（窓口経由で使う）

以下は shadcn の API そのまま（https://ui.shadcn.com/docs/components 参照）。**import は必ず役割カテゴリの窓口から**:

| 窓口 | 中身 |
|---|---|
| `@/components/Communication/{Badge,Empty,Skeleton,Alert,Progress}` | badge / empty / skeleton / alert / progress |
| `@/components/DataDisplay/Table` | table（Table, TableHeader, TableRow, …） |
| `@/components/Display/{Label,Separator,Avatar}` | label / separator / avatar |
| `@/components/Layout/{Card,Field}` | card（CardContent, …）/ field |
| `@/components/Navigation/{Pagination,Tabs,Breadcrumb,Sidebar}` | pagination / tabs / breadcrumb / sidebar 一式 |
| `@/components/Overlay/{Dialog,DropdownMenu,Popover,Sheet,Tooltip}` | 各 overlay 一式（Content, Trigger, …） |
| `@/components/Selection/{Checkbox,Select,RadioGroup,Switch,Slider}` | 各フォームコントロール |
| `@/components/TextInput/{Input,Textarea}` | input / textarea |

overlay 系（Dialog / Popover / Sheet / Tooltip / DropdownMenu）は Radix の portal で `document.body` 直下に描画される。story を書くときは「開いた」状態の story を必ず入れること（`src/stories/opened.ts` のヘルパを使う）。
