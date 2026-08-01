---
id: DR-0048
type: finding
title: '`build-storybook` は描画を検証しない — story が実行時に落ちても緑で通る'
status: observed
date: 2026-07-27
step: 手5
related: [DR-0024, DR-0025, DR-0028, DR-0044, DR-0046]
poc_feedback: '🟥 移送時に効く。PoC の architecture.md は「story を単一ソースにする」としているが、ビルドの緑は story が動くことを保証しない'
---

# DR-0048: `build-storybook` の緑は「story が描画できる」ことを意味しない

## 背景

手2b D4 で `pnpm build-storybook` を **6 本目の機械ゲート**に追加した（[DR-0024](DR-0024-storybook-render-only-and-gate.md)）。
「描画のみ」で導入したので、**このゲートが守っているのは描画のはず**だった。

手5 の目視レビュー用に `Templates/AppShell` の story を足し、Playwright で開いて確かめた。

## 発見

**story は実行時に落ちていたが、`pnpm build-storybook` は exit 0 だった。**

```
Error: useSidebar must be used within a SidebarProvider.
```

`AppShell` は内部で `Sidebar` を使う。`Sidebar` は shadcn で唯一 state を内包する部品で
（[DR-0013](DR-0013-shadcn-holds-no-state-except-sidebar.md)）、`SidebarProvider` が要る。
本体アプリでは `AppProviders`（`src/components/providers.tsx`）が配っているが、
**Storybook の `preview.tsx` は decorator を持たない**ので、story 側で配線する必要があった。

| 検査 | 結果 |
| --- | --- |
| `pnpm typecheck` | 🟦 緑（型は通る。Provider は実行時の要求） |
| `pnpm lint` | 🟦 新規ゼロ |
| **`pnpm build-storybook`** | 🟦 **exit 0** |
| **Playwright で実際に開く** | 🟥 **エラー画面**（Storybook の赤枠に stack trace） |

**ビルドは story を「バンドルできるか」しか見ていない。マウントも描画もしない。**

## 根拠（実測）

2026-07-27。`tools/visual-probe.mjs`（Playwright + Chromium 145）で
`iframe.html?id=templates-appshell--default` を開き、`getComputedStyle` を取ろうとして
**3 検体すべてが「要素が見つからない」**になったことから発覚。スクリーンショットにエラー画面が写っていた。

decorator を足して再測定した結果:

| 検体 | 期待 | 実測 |
| --- | --- | --- |
| sidebar の面 | `#003a63`（tmp brand-navy） | `rgb(0, 58, 99)` ✅ |
| sidebar の前景 | `rgba(255,255,255,.92)` | `rgba(255, 255, 255, 0.92)` ✅ |
| nav-item の `min-height` | 44px | `44px` ✅ |

## 影響

- 🟥 **[OBS-0003](../OBS/OBS-0003_対象0件で緑が5回出た.md)「対象 0 件で緑」の 9 例目。**
  これまでの 8 例は「**書いたのに効かない**」だったが、本件は「**壊れているのに緑**」。
  🟥 **同じ手（手5）だけで 4 例出ている**（H5-02 の `--spacing: initial` ／ [DR-0046](DR-0046-theme-swap-loses-to-source-order.md) の 2 例 ／ 本件）。
- 🟥 **手2b D4 の前提が 1 つ崩れた。**「描画のみで入れたのだから、ゲートは描画を守る」は成り立たない。
  **描画を守りたいなら story を実行する仕組みが要る**——それが `@storybook/addon-vitest`（未決 #14）。
  🟨 **これは未決 #14 を「入れるべき」側に動かす 1 回目の証明**（2 回ルール）。
- 🟦 **Playwright を計測器として入れた副産物として見つかった。**
  目視だけでも気づけた（開けば赤い画面が出る）が、**私（Claude）は開けなかったので気づけなかった**。
  🟨 **人と機械で見えるものが違う**——これが本 DR の一番の含意。
- 🟥 **手9（移送）に効く。**PoC の `architecture.md` は「UI カタログ = Storybook」「story を単一ソースにする」と
  明記しているが、**単一ソースにするなら緑の意味を明示しないと危ない。**

## 関連

- `tools/visual-probe.mjs` — 本件を見つけた計測器
- 手順書: [手5](../手順/手5_トークン差し替え実験.md) §5 H5-07
- [実行記録.md](../実行記録.md) §手5 H5-07
