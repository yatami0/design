## Wrapping and setup

Wrap the whole app in `AppProviders` once, at the root. It supplies `TooltipProvider` and
`SidebarProvider`. Without it, `Sidebar` and `AppShell` throw at render.

```jsx
<AppProviders>
  <AppShell brand="Redmine" nav={[{ key: 'issues', label: 'チケット', active: true }]}>
    …
  </AppShell>
</AppProviders>
```

Do not nest a second `AppProviders`. No theme prop, no theme switching: this system ships one theme.

## The styling idiom: layout comes from props, everything else from semantic utility classes

**Layout primitives do not accept `className` or `style`.** They take a fixed set of prop values.
Passing a class to `Stack`, `Inline`, `Grid`, `Section`, `Container`, or `Spacer` is a type error.
`Box` is the single escape hatch that accepts `className` — reach for it only when no prop expresses the need.

| Component | Props and their only legal values |
|---|---|
| `Stack` (vertical) | `gap`: `none\|sm\|md\|lg` · `inset`: `none\|xs\|sm\|md\|lg` · `align`: `start\|center\|end\|stretch` |
| `Inline` (horizontal) | `gap`: `none\|sm\|md` · `inset` · `align`: `start\|center\|end\|stretch` · `justify`: `start\|center\|end\|between` · `wrap`: boolean |
| `Grid` | `columns`: `1\|2\|3\|4\|6\|12` · `gap`: `none\|sm\|md\|lg` · `inset` |
| `Container` | `width`: `content\|wide\|full` · `gutter`: boolean (screen-edge margin) — **no `inset`** |
| `Section` | `heading`: ReactNode · `gap`: `none\|sm\|md\|lg` |
| `Spacer` | `size`: `sm\|md\|lg` (no children) |
| `Box` (escape hatch) | `inset` · **plus `className`** — the only component that accepts one |

For your own layout glue, use ONLY these semantic utility classes. They are the complete vocabulary:

| Family | Classes |
|---|---|
| padding (inside a surface) | `p-inset-xs` `p-inset-sm` `p-inset-md` `p-inset-lg` |
| vertical gap | `gap-stack-sm` `gap-stack-md` `gap-stack-lg` |
| horizontal gap | `gap-inline-sm` `gap-inline-md` |
| type | `text-body` `text-heading` `text-label` `text-emphasis` `text-table` |
| max width | `max-w-content` `max-w-wide` |

**Never write numeric-step utilities (`p-4`, `gap-7`, `w-99`, `h-8`) and never write Tailwind palette
colours (`text-gray-600`, `bg-slate-100`).** Both are rejected by this system's lint. Use the names above
for spacing and type, and the semantic colour classes the components already carry (`bg-primary`,
`text-muted-foreground`, `bg-destructive`, `bg-sidebar`) for colour.

## How components are organised, and what each one is

Components are grouped by **role**, which is the folder name under `components/`:
`action`, `communication`, `datadisplay`, `display`, `layout`, `navigation`, `overlay`, `selection`,
`textinput`, plus the composite layers `patterns` and `templates`. Pick by role first.

This system ships two tiers. Both are real, shipped components — reach for either rather than writing
your own markup:

- **Composed** — `AppShell`, `ListDetail`, `EmptyState`, `DataGrid`, `StatusPill`, `Button`, and the
  layout primitives. These carry this system's own decisions and follow the prop rules above.
- **Base** — `Card`, `Table`, `Badge`, `Label`, `Separator`, `Input`, `Checkbox`, `Select`, `Skeleton`,
  `Empty`, `Pagination`, `Dialog`, `DropdownMenu`, `Popover`, `Sheet`, `Tooltip`. These are the
  unmodified upstream primitives, exposed so that a screen never has to hand-build a surface, a form
  control, or an overlay. They accept `className`; the composed tier's prop-only rule does not apply to
  them. Compound ones ship their parts (`CardHeader`, `DialogContent`, `SelectItem`, `TableRow`, …) —
  read `<Name>.prompt.md` for the exact shape.

This system also classifies components by facet. Two facets change how you use a component:

- **owns state / needs a provider** — `Sidebar` and `AppShell` keep their open/closed state in
  `SidebarProvider`, so `AppProviders` is mandatory around them. `ListDetail` keeps selection state in the
  hook `useListDetail()`; call it and pass the result as `state`. Do not re-implement either.
- **takes children** — `Box`, `Stack`, `Inline`, `Grid`, `Section`, `Container`, `AppShell`, `StatusPill`,
  `Button`. The rest are configured by props only: `Spacer`, `DataGrid`, `EmptyState`, `ListDetail`.

`StatusPill` is the only status indicator — `tone` is exactly `success | warning | danger | neutral`
(there is no "info" or "progress"); use it instead of colouring a `Button` or inventing a badge.
`DataGrid` takes `data` + `columns` (TanStack `ColumnDef[]`), optional `onRowSelect` and `empty`.
`EmptyState` takes `title`, `description` and at most one `action`.
`AppShell` takes `brand` and `nav` (`{ key, label, active? }[]`) — it has no "current" prop; mark the
active item with `active: true`. `AppShell` is the page skeleton and is where a screen should start.

## Where the truth lives

Read `styles.css` and everything it `@import`s (`_ds_bundle.css`) before styling — that closure is the
only CSS a rendered design receives, and it holds every token above as a `--spacing-*` / `--text-*` /
`--container-*` custom property. Per component, read `<Name>.prompt.md` (usage + real examples pulled
from this repo's own stories) and `<Name>.d.ts` (the exact prop contract).
`guidelines/docs/共通コンポーネント思想.md` is the source for the role/facet classification above.

## One idiomatic build

```jsx
<AppProviders>
  <AppShell
    brand="Redmine"
    nav={[
      { key: 'issues', label: 'チケット', active: true },
      { key: 'projects', label: 'プロジェクト' },
    ]}
  >
    <Container width="content" gutter>
      <Section heading="チケット一覧" gap="md">
        <Inline gap="sm" align="center">
          <StatusPill tone="warning">進行中</StatusPill>
          <Button variant="outline" size="sm">絞り込み</Button>
        </Inline>
        <DataGrid
          data={rows}
          columns={columns}
          empty={
            <EmptyState
              title="チケットがありません"
              description="条件を変えて検索するか、新しいチケットを作成してください。"
              action={<Button size="sm">新規チケット</Button>}
            />
          }
        />
      </Section>
    </Container>
  </AppShell>
</AppProviders>
```
