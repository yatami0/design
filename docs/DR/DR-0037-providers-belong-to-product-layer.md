---
id: DR-0037
type: decision
title: 'Provider は製品層が持つ — 部品ではなく「部品が動くための前提条件」だから'
status: decided
date: 2026-07-26
step: 手3
related: [DR-0031, DR-0015, DR-0018]
poc_feedback: 'OBS 候補。役割分類に「部品でないもの（Provider / Context）」の置き場が無い問題は PoC にも波及する'
---

# DR-0037: Provider は製品層に集約する（手3 D10）

## 背景

[部品カタログ 表2 の指摘 1・3](../部品カタログ.md) が挙げた穴——
**役割 9 カテゴリに「部品でないもの（Provider / Context）」の置き場が無く、`behaviorHook` フラグでも表せない**——は、
手2b で `Tooltip`（`TooltipProvider` 必須）と `Sidebar`（`SidebarProvider`）として実装でも顕在化した。
ユーザーは「なんとなく A（製品層に集約）な気がしているが、なぜだかは言語化できない」と述べた（2026-07-26）。

## 決定

**A（製品層に集約）を採る。ただし実装は手4 でよい**（手3 では場所だけ決める）。

```
src/components/providers.tsx   ← AppProviders（TooltipProvider ＋ SidebarProvider ＋ …）
src/app/layout.tsx             ← <AppProviders> を 1 つ書くだけ
```

### 言語化した理由

> **Provider は「部品」ではなく、「部品が動くための前提条件」である。**
> **前提条件は、その部品を供給する層が面倒を見るべきで、使う側に押し付けてはいけない。**

## 根拠（実測）

2026-07-26。詳細は [状態とProviderの置き場.md](../状態とProviderの置き場.md) §4。

### 1. Provider を要求する部品は 2 件で、種類が違う

`grep -l 'Provider' src/components/ui/*.tsx` の結果は **2 件のみ**。

| 部品 | 要求するもの | 種類 |
|---|---|---|
| `tooltip.tsx` | `TooltipProvider` | 🟦 **設定の配布**（`delayDuration` 等）。状態を持たない |
| `sidebar.tsx` | `SidebarProvider` | 🟨 **状態の配布** |

部品カタログの指摘 3（`behaviorHook` では Provider を表せない）は**この差を捉えていなかった。**

### 2. 役割 9 カテゴリは「画面に出るもの」の分類

`Direction`（RTL/LTR のコンテキスト提供）が分類できなかったのと**同じ理由**で Provider もどこにも属さない。
属さないものを分類表に無理に入れると分類が壊れる。→ **分類の外に置き場を作るのが正しい。**

### 3. D1=(c) との整合

製品層が Tooltip をラップすると決めた以上、**ラップした部品が Provider 無しで壊れるなら、それはラッパーが仕事を終えていない。**

### 4. 捨てた案と理由

| 案 | 捨てた理由 |
|---|---|
| **B** 画面ごとに書く | D3=B（画面は製品層しか import しない）と噛み合わない——**素材層の名前（`TooltipProvider`）がアプリ層に漏れる**。加えて Provider hell の入口 |
| **C** 手4 へ送る | 🟨 **完全には捨てていない。**Storybook 側は `preview.tsx` の decorator で既に動いており、アプリ層で画面を組むのは手4。**場所を手3 で決め、中身を手4 で埋める**折衷を採った |

## 影響

- 🟦 **未決 #4（思想への指摘 3 点）のうち、指摘 1（部品でないものの置き場）に答えが出た。**
  ただし**思想は書き換えない**——指摘として記録し、判断はユーザーに残す。
- 🟦 **リスクはほぼ無い。**戻すのも容易（🟦 戻せる）。
- 🟨 **フラグに `provider` を足すかは未決のまま**（指摘 3）。必要性はまだ 1 度しか証明されていない（2 回ルール）。

## 関連

- [状態とProviderの置き場.md](../状態とProviderの置き場.md) §4
- 手順書: [手3](../手順/手3_Components層と製品層の分離.md) §2 D10・§2.6-D10
