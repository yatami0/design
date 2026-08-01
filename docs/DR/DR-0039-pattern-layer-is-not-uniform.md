---
id: DR-0039
type: finding
title: '③ Patterns 層は一様ではない — 3 件のうち 1 件は component の足し算で書けた'
status: observed
date: 2026-07-26
step: 手4
related: [DR-0015, DR-0032, DR-0037]
poc_feedback: 'OBS 候補。packages/ui の層構成を決めるとき、③ 層を一枚岩と見ないほうがよい'
---

# DR-0039: ③ 層は一様ではない

## 背景

思想③は「**コンポーネントの足し算だけではページにならない。組み合わせの定石はひとつ上の層になる**」
（Nathan Curtis: component ≠ pattern ≠ template）としている。
手4 の Q4 は**それが本当かを確かめる問い**で、先に仮説として 3 件を切り出してから画面を組んだ。

## 発見

**3 件のうち 1 件は component の足し算で書けた。③ 層は一枚岩ではない。**

| 切り出したもの | 足し算で出るか | 何を持っていたか |
|---|---|---|
| **`ListDetail`**（一覧 + 詳細シート） | 🟦 **出ない** | ① **状態の調整**（どの行が選ばれているか＝ `useListDetail`）② **別カテゴリの部品を突き合わせる規約**（DataDisplay × Overlay）③ tmp-admin §4.4「行アクション列を持たず、行そのものを押して右スライドで出す」という**作り方の指針** |
| **`AppShell`**（ページ骨格） | 🟨 **微妙** | 見た目は `Sidebar` + `SidebarInset` の足し算。しかし**「どの面をどこに置くか」（tmp-admin §4.1 の 3 層＝ chrome / canvas / card）の割り当て**を持っており、これは部品側には書けない |
| **`EmptyState`**（空状態） | 🟥 **出る** | 素材の `Empty` を薄く包んだだけ。持っているのは「**一覧が空のときは説明 + 主要操作を 1 つだけ**」という規約のみで、**これは Component 層のラッパーで足りる** |

### 判定の基準（実装して分かったもの）

**「足し算で出ないもの」には共通点が 2 つあった。**

1. **状態を持つか**（`ListDetail` は持つ、`EmptyState` は持たない）
2. **複数の役割カテゴリをまたぐか**（`ListDetail` は DataDisplay × Overlay、`EmptyState` は Communication だけ）

**どちらも満たさないものは、③ 層ではなく ② 層のラッパーで足りる。**

## 根拠（実測）

2026-07-26。`src/patterns/` に 3 件、`src/templates/` に 1 件を置き、`src/app/page.tsx` を組んだ。

- `ListDetail` は `useListDetail`（`useState` + `useCallback`）を伴い、`DataGrid` と `Sheet` を突き合わせる。
  **どちらか一方の部品には書けない。**
- `EmptyState` の実装は `Empty` / `EmptyHeader` / `EmptyTitle` / `EmptyDescription` を並べた **12 行**で、
  props も `title` / `description` / `action` の 3 つ。**製品層に置いても何も変わらない。**
- `AppShell` は `Sidebar` 系 8 export + `Container` + `Stack` の組み立て。
  **構造は足し算だが、面の割り当ては足し算では表せない。**

## 影響

- 🟨 **思想③への指摘（7 件目）。**「component の足し算では出ない」は**③ 層全体の性質ではなく、③ 層に置くための条件**として読むほうが正確。
  条件は「**状態を持つ**」または「**複数カテゴリをまたぐ**」の少なくとも一方。
  → **書き換えはしない。**判断はユーザー。
- 🟨 **`EmptyState` の置き場を手5 までに決める。**いま ③ 層にあるが、条件を満たしていない。
  移すなら `Communication/EmptyState`（② 層のラッパー）。**移すかどうかは急がない**——
  2 回目の需要（別の空状態パターンが出る）まで待つ（2 回ルール）。
- 🟦 **手5 の判定対象が 1 層増えた。**③ 層も製品層と同じ枠（[DR-0033](DR-0033-step5-criteria-differ-per-layer.md)）に入っているので、
  判定基準はそのまま使える。

## 関連

- [実行記録.md](../実行記録.md) §手4
- 手順書: [手4](../手順/手4_PatternsTemplates層と一覧.md) §0 Q4・§5 H4-05
