---
id: DR-0060
type: finding
title: '語彙の逸脱は 4 面から出る — 素材層の `className` はその 1 つで、根因は「代替語彙の不在」'
status: observed
date: 2026-08-02
step: 手7
related: [DR-0032, DR-0038, DR-0028, DR-0059, DR-0019]
poc_feedback: '🟥 ui.md / architecture.md の材料。任意値禁止を掲げるなら、禁止した用途に**代替語彙を必ず用意する**。用意しない禁止は破られる'
---

# DR-0060: 語彙の逸脱は 4 面から出る

## 背景

手7 の 1 周目・2 周目で、conventions header が「complete vocabulary」と宣言した語彙表の**外**のクラスが出た。
「素材層が props でパラメータを受けない設計だから、Claude Design が px やスタイルを直当てしているのか」
という問いに答えるため、**逸脱がどの面から出たかを生成物 2 本で全件分類した。**

## 発見

### 1. 🟥 「px の直当て」は起きていない

| 検査 | 1 周目 | 2 周目 |
| --- | --- | --- |
| 生 px（`width: 192px` 等） | 🟦 **0 件** | 🟦 **0 件** |
| 生 hex | 🟦 0 件 | 🟦 0 件 |
| インライン `style` 属性 | 🟦 0 件 | 🟦 0 件 |

出たのは `w-48` で、実体は `.w-48{width:calc(var(--spacing) * 48)}` ——**トークン由来**。
`--spacing` を差し替えれば追従する。**「スタイルの直当て」ではなく「宣言していない語彙の使用」。**

🟨 生成物中の px は `hint-size` だけだが、これは **Claude Design のキャンバス寸法メタデータ**でスタイルではない。

### 2. ★ 逸脱の出どころは 4 面ある

| 面 | 経路 | 1 周目 | 2 周目 |
| --- | --- | --- | --- |
| **①** | **素材層の `className`**（`SelectTrigger`） | — | 🟥 `w-48` × 2 |
| **②** | **`Box` の `className`**（製品層の意図的な逃げ道） | 🟥 `bg-card rounded-md border` | 🟦 消えた（`Card` を渡したため） |
| **③** | **`DataGrid.columns[].cell` の中の任意 JSX** | 🟥 `font-emphasis` `tabular-nums` | 🟥 `tabular-nums` `text-emphasis` |
| **④** | **`<style>` への生 CSS** | `html, body` のみ | 🟥 **`a { color: var(--primary) }` が増えた** |

🟥 **③ は素材層と無関係。**`DataGrid` は**製品層・自作**で、`columns` が `cell` レンダラ（ReactNode を返す関数）を
受ける設計だから、そこには任意の JSX が入る。**両周とも逸脱語の大半はここから出ている。**

🟥 **④ は 2 周目で増えた。**値はトークン参照（`var(--primary)`）だが、**語彙表の外**。

### 3. 素材層に寸法の props が無いのは事実（実測）

`.d.ts` の props（アップロード済みの成果物から）:

| 部品 | 持っている props |
| --- | --- |
| `Select` | （寸法系なし） |
| `Card` | `size?` / `className?` |
| `Input` | `className?` のみ |
| `Badge` | `variant?` / `asChild?` / `className?` |
| `Table` | `className?` のみ |

**幅・余白を props で受ける素材層は 1 つも無い。**幅を決める手段は `className` しか無かった。

### 4. ★ ただし根因はもう 1 段深い —— **DS に「コントロールの幅」を表す語が無かった**

conventions header の語彙表で幅の族は `max-w-content` / `max-w-wide` の 2 つだけ。
`Container` の `width` も `content | wide | full`。**どちらもページ幅。**

🟥 **フィールド幅を表す語が DS 全体に存在しなかった。**
→ **仮に素材層に `width` prop を生やしても、渡す値の語彙が無いので同じことが起きる。**

## 根拠（実測）

2026-08-02。生成物 2 本（`artifacts/h7/RedmineIssueList.dc.html` ／ `artifacts/h7/redmine-issue-list.dc.html`）を
面ごとに分けて grep。`class-name` 属性 ／ マークアップの素の要素の `class` ／ script 内の `className:` ／
`<style>` ブロックの 4 つを別々に数えた。

`.w-48` の実体と、素材層の props は `ds-bundle/_ds_bundle.css` と `ds-bundle/components/*/*/*.d.ts` から取得。
語彙表の幅の族は `.design-sync/conventions.md` の実ファイル。

## 影響

**観測から直接言えること**

1. ★ **「素材層に props が無いから」は 4 分の 1 の説明。**素材層 16 件を全部ラッパーで包んでも
   **③（`cell` レンダラ）と ④（生 CSS）は残る。**
2. ★ **禁止だけして代替を与えていない語彙は破られる。**
   header は `w-99` を名指しで禁止しているのに、幅を決める合法な手段を 1 つも与えていなかった。
3. 🟥 **[DR-0032](DR-0032-layout-primitives-take-props-not-classname.md)（枠は props で閉じる）は製品層の Layout にしか掛かっていない。**
   実測でも `w-48` は**素材層の部品にだけ**付き、製品層の部品には 2 周とも 1 つも付いていない。
   **素材層を渡すと、枠の外側も一緒に渡る。**
4. 🟥 **props が ReactNode / 関数を受けると、そこは枠の外になる。**
   `DataGrid.columns[].cell` は我々が自分で開けた穴で、[DR-0038](DR-0038-arbitrary-value-rule-sees-three-contexts.md)
   （lint は `cva` / 定数経由を見ない）と同型の穴が**API の形として**存在する。

**🟥 推論（未検証）**

- **代替語彙を与えれば agent がそれを使う、とはまだ言えない。**
  2 周目で分かったのは「**部品**を足したら使った」で、「**語彙**を足したら使う」は別の命題。
  → [DR-0061](DR-0061-field-width-vocabulary.md) を入れた 3 周目で測る。
- ③ を塞ぐには `columns` に `align` / `tone` / `emphasis` のような列オプションを足すことになるが、
  **手4 の成果物の設計変更**であり、まだ 1 回しか証明されていない。
- ④（生 CSS の書き足し）が繰り返されるかは 1 例のみ。**2 例目が出たら header に明示的な禁止を足す話になる。**

## 関連

- 手順書: [手7](../手順/手7_ClaudeDesignに一覧を組ませる.md) §2 D10
- 実測の記録: [実行記録.md](../実行記録.md) §H7-06b・§H7-08
- 対処: [DR-0061](DR-0061-field-width-vocabulary.md)（決定）／ [DR-0062](DR-0062-shipped-vocabulary-needs-safelist.md)（出荷の穴）
