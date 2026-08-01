---
id: DR-0031
type: finding
title: 'Sidebar の lint 赤 17 件のうち 11 件は任意値 — state を切り出しても減らない'
status: observed
date: 2026-07-26
step: 手3
related: [DR-0013, DR-0010, DR-0015]
poc_feedback: null
---

# DR-0031: Sidebar の赤は state 由来ではない

## 背景

[DR-0013](DR-0013-shadcn-holds-no-state-except-sidebar.md) は「shadcn で state を持つのは Sidebar 1 つ」と記録し、
[handoff](../handoff.md) の未決 #2 は **「lint 赤の 6 割」を切り出しの動機**として挙げていた。
D6 を判断する前に内訳を実測した。

## 発見

### 1. 内訳（`sidebar.tsx` 単体・17 件）

| ルール | 件数 | 該当行 | state 由来か |
|---|---|---|---|
| **`tailwindcss/no-arbitrary-value`** | **11** | — | 🟥 **無関係**（`calc(var(--sidebar-width)*-1)` 等のレイアウト計算） |
| `@typescript-eslint/restrict-template-expressions` | 3 | L85 ×2 / L592 | 🟨 L85 は cookie 書き込み＝ state 由来。L592 は幅の読み出し |
| `@typescript-eslint/no-confusing-void-expression` | 3 | L92 ×2 / L108 | 🟦 state 由来（`toggleSidebar` とキーボードハンドラ） |

**state を hook へ出して消えるのは最大 5 件。12 件は残る。**

### 2. 🟥 「6 割」は全体比の話であって、原因の話ではない

`sidebar.tsx` 17 ＋ `use-mobile.ts` 3 = 20 が全体 33 件の **61%** を占めるのは事実。
しかし**その 20 件の中身の過半（11 件）は任意値**で、状態とは無関係。
→ **未決 #2 の「lint 赤の 6 割」という動機づけは、切り出しの根拠にならない。**

### 3. Sidebar は「状態を 1 つ」ではなく「関心事を 4 つ」束ねている

| # | 関心事 | 実装 | 思想「状態は hook へ」の射程 |
|---|---|---|---|
| 1 | 開閉状態 | `useState(defaultOpen)` ＋ 制御 props | 🟦 **射程内** |
| 2 | 永続化 | `document.cookie` に 7 日書く | 🟥 **射程外**（状態ではなく副作用） |
| 3 | グローバルショートカット | `window` に **Cmd/Ctrl+B** を登録 | 🟥 **射程外**（部品がアプリ全体のキーバインドを占有） |
| 4 | レスポンシブ分岐 | `useIsMobile()` で Sheet 版に差し替え | 🟥 **射程外**（状態ではなく方針） |

### 4. 🟦 React の実務作法では、shadcn の実装は外れていない

- **State colocation**: 状態は使う場所の近くに置く。開閉は Sidebar 配下でしか使わない。
- **Context は layout / global 状態に使う**のが定石で、**サイドバーの開閉はまさに layout state**。
- **Compound components**: 親が状態を持ち子が Context で受ける形＝ 32 export の構成そのもの。

→ **「shadcn の Sidebar は思想に反する」という読みは、React 側の作法からは成り立たない。**
思想の「状態は role の外へ」は**分類の規約**であって、**実装上どこに状態を置くべきかの話ではない**。

### 5. Provider を要求する部品は 2 件で、種類が違う

| 部品 | 要求するもの | 種類 |
|---|---|---|
| `tooltip.tsx` | `TooltipProvider` | 🟦 **設定の配布**。状態を持たない |
| `sidebar.tsx` | `SidebarProvider` | 🟨 **状態の配布** |

[部品カタログ 表2 の指摘 3](../部品カタログ.md)（`behaviorHook` では Provider を表せない）は、**この差を捉えていなかった**。

## 根拠（実測）

2026-07-26。

- `./node_modules/.bin/eslint src/components/ui/sidebar.tsx -f json` → 17 件（内訳は上表）／`use-mobile.ts` → 3 件
- `grep -nE 'useState|createContext|document\.cookie|addEventListener|KEYBOARD' src/components/ui/sidebar.tsx`
  → L27-32（定数）／L44（`createContext`）／L69・L73（`useState`）／L85（cookie）／L96-107（`keydown` 登録）／L115（`useMemo`）
- `grep -l 'Provider' src/components/ui/*.tsx` → `sidebar.tsx` / `tooltip.tsx` の **2 件のみ**
- 一次情報: [State Colocation（Kent C. Dodds）](https://kentcdodds.com/blog/state-colocation-will-make-your-react-app-faster)／
  [Colocation of State（Steve Kinney）](https://stevekinney.com/courses/react-performance/colocation-of-state)／
  [Provider Pattern（patterns.dev）](https://www.patterns.dev/vanilla/provider-pattern/)

## 影響

- 🟥 **D6 の判断根拠が 1 つ消えた。**「lint を減らすため」は成立しない。残るのは
  ①思想の一貫性 ②②③④をアプリの方針で差し替えたい、の 2 つだけで、**②はまだ 1 度も要求が出ていない**（2 回ルール）。
- 🟨 **切り出すなら「何を」を選ぶ必要がある。**①だけなら思想に忠実で赤は 2 件減る。
  ②③まで引き取るなら、それは**思想のためではなくアプリの方針を通すため**なので、**記録も理由も分ける**。
- 🟨 **D6 の前に問うべきことがある。**チケット一覧 1 画面（[DR-0002](DR-0002-verify-three-layers-not-screens.md)）に
  **そもそもサイドバーが要るか**。要らなければ D6=C（使わない）が最も安い。
- 🟦 **D10（Provider の置き場）に言語化を与えた。**Provider は「部品」ではなく「**部品が動くための前提条件**」であり、
  前提条件は供給する層が面倒を見る。D1=(c) で製品層が Tooltip をラップすると決めた以上、**Provider も製品層が持つのが筋**。

## 関連

- [状態とProviderの置き場.md](../状態とProviderの置き場.md)
- 手順書: [手3](../手順/手3_Components層と製品層の分離.md) §2 D6 / D10・§5 H3-06
