---
id: DR-0035
type: decision
title: 'Sidebar の状態は shadcn のまま使う — 製品層は Provider を持つ薄いラッパーだけ置く'
status: decided
date: 2026-07-26
step: 手3
related: [DR-0031, DR-0013, DR-0015]
poc_feedback: null
---

# DR-0035: Sidebar は素材のまま使う（手3 D6）

## 背景

[DR-0013](DR-0013-shadcn-holds-no-state-except-sidebar.md) は「shadcn で state を持つのは Sidebar 1 つ」と記録し、
[handoff](../handoff.md) の未決 #2 は **「lint 赤の 6 割」**を切り出しの動機に挙げていた。
思想は「状態は role の外へ（`useXxxModal()` などの hook へ）」と規定している。

## 決定

**A（素材のまま使う）を採る。**（ユーザー判断 2026-07-26）

| やること | やらないこと |
|---|---|
| 🟦 製品層 `src/components/Navigation/Sidebar.tsx` に**薄いラッパー**を置く（D1=(c) の一貫） | 🟥 `useState` / cookie 永続 / キーボードショートカットを**書き写さない** |
| 🟦 `SidebarProvider` は製品層の `AppProviders` が持つ（[DR-0037](DR-0037-providers-belong-to-product-layer.md)） | 🟥 `useSidebar()` を**自作しない**（shadcn が同名で提供済み） |
| 🟦 nav-item の `min-height: 44px` はラッパーで当てる（[DR-0034](DR-0034-touch-target-visual-32-hit-44.md)） | |

## 根拠（実測）

2026-07-26。詳細は [状態とProviderの置き場.md](../状態とProviderの置き場.md)。

### 1. 切り出す動機だった lint が成立しない

`eslint src/components/ui/sidebar.tsx` の内訳（17 件）:

| ルール | 件数 | state 由来か |
|---|---|---|
| `tailwindcss/no-arbitrary-value` | **11** | 🟥 無関係（レイアウト計算） |
| `restrict-template-expressions` | 3（L85 ×2 / L592） | 🟨 L85 は cookie 書き込み |
| `no-confusing-void-expression` | 3（L92 ×2 / L108） | 🟦 state 由来 |

**state を hook へ出して消えるのは最大 5 件。12 件は残る。**
未決 #2 の「6 割」は `sidebar.tsx` 17 ＋ `use-mobile.ts` 3 が全体 33 件に占める割合の話であって、
**その 20 件が state に起因するという意味ではなかった。**

### 2. React の実務作法から見て、shadcn の実装は外れていない

- **State colocation**: 状態は使う場所の近くに。開閉は Sidebar 配下でしか使わない。
- **Context は layout / global 状態に使う**のが定石で、**サイドバーの開閉はまさに layout state**。
- **Compound components**: 親が状態を持ち子が Context で受ける形＝ 32 export の構成そのもの。

思想の「状態は role の外へ」は**分類の規約**（役割 9 カテゴリに状態という軸を持ち込まない）であって、
**実装上どこに状態を置くべきかの話ではない。**両者は別問題であり、Sidebar ではたまたま同じ場所を指していない。

### 3. 捨てた案と理由

| 案 | 捨てた理由 |
|---|---|
| **B** state を切り出す | 素材層のコピーになり、**同じロジックが二層に存在して手5 で両方を見る羽目になる**。副作用（cookie・Cmd/Ctrl+B）を差し替えたい要求は**まだ 1 度も出ていない**（2 回ルール） |
| **C** 今回は使わない | tmp-admin §4.2 が**サイドバー 2 セクション**を規定しており、チケット一覧の骨格に含まれる |

## 影響

- 🟦 **未決 #2 が閉じた。**
- 🟨 **観測項目を 1 つ残す。**Sidebar は `window` に **Cmd/Ctrl+B** を登録している。
  **手4 で画面を組むときに別用途と衝突したら、それが B へ切り替える 1 回目の証明**になる。→ 実行記録に観測項目として書く。
- 🟨 **Sidebar が抱えているのは「状態 1 つ」ではなく「関心事 4 つ」**（開閉 / cookie 永続 / グローバルキーバインド / レスポンシブ分岐）。
  思想の射程内は 1 つ目だけ。→ 思想への指摘 5 件目として [状態とProviderの置き場.md](../状態とProviderの置き場.md) §5 に記録済み。

## 関連

- [状態とProviderの置き場.md](../状態とProviderの置き場.md)
- 手順書: [手3](../手順/手3_Components層と製品層の分離.md) §2 D6・§2.6-D6・§5 H3-06
