---
id: DR-0032
type: decision
title: '製品層の Layout プリミティブは props で semantic 名だけを受け、className は Box 1 つに集約する'
status: decided
date: 2026-07-26
step: 手3
related: [DR-0028, DR-0019, DR-0012]
poc_feedback: '🟥 ui.md の材料。PoC 側でも「任意値禁止 lint だけでは枠が閉じない」ので、部品 API の規約が要る'
---

# DR-0032: Layout プリミティブは props で受ける（手3 D11）

## 背景

ユーザーの要求は「**色や余白は、共通コンポーネントでもアプリ側でも、定義したモノしか使わせたくない**」（2026-07-26）。
自作する Layout プリミティブ（Box / Stack / Grid / Container / Spacer / Section）の API を
**① props で semantic 名を受ける ② `className` パススルー ③ 両方許す**の 3 案から選ぶ必要があった。

## 決定

**A（props で semantic 名を受ける）を採る。**加えて **`className` の受け口を `Box` 1 つに集約する。**

| 部品 | `className` を受けるか |
|---|---|
| `Stack` / `Grid` / `Container` / `Spacer` / `Section` | 🟥 **受けない。**`gap` / `inset` などの props だけ |
| `Box` | 🟦 **例外として受ける**（逃げ道を 1 箇所に集める） |

- 取れる値は TypeScript の union（例: `gap?: 'sm' | 'md' | 'lg'`）で**有限集合になる**。
- この形は Braid Design System の作法（**上位部品は `className` / `style` を受け付けず、`Box` だけが例外**）と同型。

## 根拠（実測）

2026-07-26。プローブ 6 個を書いて生成 CSS と lint を突き合わせた（[DR-0028](DR-0028-token-frame-is-not-closed.md) §1）。

| 書いたもの | 実効値 | `no-arbitrary-value` |
|---|---|---|
| `p-13` / `gap-7` / `w-99` | 52px / 28px / 396px | 🟥 **通る** |
| `m-[13px]` / `text-[13px]` / `rounded-[3px]` | 13px / 13px / 3px | 🟦 止まる |

**`className` を通す限り、誰も定義していない値が入ってくる。**
Tailwind v4 の spacing は `calc(var(--spacing) * n)` の動的生成で **n に上限が無い**ため、
「基数を 1 個定義した時点で無限個の段が定義済み」になっている。

→ **案 B（`className` パススルー）は要求を満たせない。案 C（両方許す）は逃げ道がある時点で実質 B。**

## 影響

- 🟦 **枠が閉じるのは props の型による。**lint は補助であって主ではない（[DR-0033](DR-0033-step5-criteria-differ-per-layer.md) 参照）。
- 🟨 **Q1 の答え方が変わる。**「semantic 語彙だけで組み切れるか」という yes/no ではなく、
  **「`Box` に何回逃げたか」という数字**で答えが出るようになる。→ §0 Q1 に観測方法として追記する。
- 🟨 **逃げ道が広すぎると枠が形骸化する。**`Box` の使用箇所数を実行記録に残し、増え続けるなら設計の穴と判定する。
- 🟥 **A↔B は書き直しになる。**製品層の全ファイルの書き方を決めるので、書き始める前に確定させる必要があった。

## 関連

- [デザイントークン設計.md](../デザイントークン設計.md) §6
- 手順書: [手3](../手順/手3_Components層と製品層の分離.md) §2 D11・§2.6-D11
- 一次情報: [Braid Design System](https://seek-oss.github.io/braid-design-system/)（上位部品は style 上書きを受けない／Box が唯一の例外）
