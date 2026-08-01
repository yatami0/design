---
id: DR-0058
type: decision
title: '本体だけが持っていたフォントを外し、① Tokens 層の既定へ戻す（手6 D8）'
status: decided
date: 2026-08-01
step: 手6
related: [DR-0026, DR-0057, DR-0005, DR-0019]
poc_feedback: '🟥 ui.md / architecture.md の材料。`apps/**` の layout でしか定義しない値は、packages/ui にも Storybook にも Claude Design にも届かない'
---

# DR-0058: 本体だけが持っていたフォントを外す（手6 D8）

## 背景

手6 で `/design-sync` の compare ループ（プレビュー vs 参照 Storybook）を回し、
最初の検体 `Button` を目視したところ、**両パネルともセリフ体**で描かれていた。

skill は `[FONT_MISSING]` の行で **「両側が同じフォールバックに落ちることを合格として扱うな」**と
名指ししている（compare は 2 枚の比較なので、双方が同じ既定に落ちると「一致」に見える）。
そこで grade を付ける前にフォントの出どころを追った。

## 決定

**`layout.tsx` の `next/font` による Geist 注入と、`globals.css` の `--font-sans` 自己参照を、両方外す。**

| # | 変更 | 意味 |
| --- | --- | --- |
| 1 | `globals.css` の `@theme inline` から `--font-sans: var(--font-sans);` を削除 | **自己参照をやめ、Tailwind v4 の既定スタックへ戻す** |
| 2 | `layout.tsx` から `Geist({ variable: '--font-sans' })` と `geist.variable` を削除 | 本体だけが持っていた上書きを外す |

→ **本体・Storybook・プレビュー・Claude Design が同じフォントを見る状態にした。**

🟨 **手順書 §2 の選択肢では「A 基準器を本体に合わせる ＋ B 自己参照を直す」（D）を採った。**
調査の結果 **合わせる先が逆だった**——本体が、デザインシステムに無い値を持っていた側だった。

## 根拠（実測）

2026-08-01。

### 1. 連鎖

- `src/app/layout.tsx` は `next/font/google` の Geist を読み、**`--font-sans` を `<html>` に挿していた**
- `src/app/globals.css` の `@theme inline` に **`--font-sans: var(--font-sans);`** があった＝**自己参照**
- CSS の自己参照は解決不能なので、**`--font-sans` を定義する主体は `layout.tsx` だけ**になっていた
- **Storybook は `layout.tsx` を実行しない** → 変数が未定義 → ブラウザ既定（セリフ体）

### 2. トークン哲学は sans を規定していない

`src/app/tmp-admin.css`（[DR-0005](DR-0005-token-ownership-and-two-stage.md) が値の正本と定めた `tmp-admin` の写し）を全文検索した。

| 変数 | 定義 |
| --- | --- |
| `--font-mono` | 🟦 **有り**（`ui-monospace, 'SF Mono', Menlo, Consolas, monospace`） |
| `--font-weight-medium` / `--font-weight-emphasis` | 🟦 有り（600） |
| **`--font-sans`** | 🟥 **無し** |

→ **Geist はデザインシステムの語彙ではなく、アプリ 1 枚の選択だった。**

### 3. 修正後の実測

```
grep -ohE "\-\-font-sans:[^;]{0,120}" .design-sync/sb-reference/assets/*.css
→ --font-sans:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, …
```

修正前は 0 件（変数そのものが解決していなかった）。
compare を `--force` で撮り直し、**storybook 側・preview 側とも実サンセリフ**になったことを目視で確認した。
`Button` の 3 story はいずれも `match`。

## 影響

**観測から直接言えること**

1. 🟥 **[DR-0026](DR-0026-two-css-pipelines-differ.md) の前提が 1 点崩れていた。**
   「判定は Storybook 側に固定する」と決めたが、**その Storybook は本体と違うフォントで描いていた。**
   色空間の差（hex+lab / oklch）は等価と確認済みだったが、**フォントは等価ではなかった。**
2. 🟥 **手5 の目視レビュー（観点 D タイポ）は、本体と違うフォントで行われていた。**
   「weight 600 はうるさくない」という判定は**セリフ体の上での判定**だった。→ 再確認の対象。
3. 🟦 **6 本の機械ゲートはこれを 1 度も検出していない。**
   `build` も `build-storybook` も緑のまま通り続けた。**「対象 0 件で緑」の 10 例目**
   （[OBS-0003](../OBS/OBS-0003_対象0件で緑が5回出た.md)）——今回は「変数が解決していないのに誰も落ちない」形。
4. 🟦 **検出したのは compare ループ（2 枚の突き合わせ）ではなく、その罠に関する skill の注意書きだった。**
   両側が同じ落ち方をしたので、**機械の一致判定は通っていた。**

**🟥 推論（未検証）**

- Geist を「デザインシステムのフォント」として残すなら、置き場は `layout.tsx` ではなく ① Tokens 層で、
  **フォント実体の同梱**も要る（`cfg.extraFonts`）。**今回は入れていない。**
- 本 DR は sans を Tailwind 既定に戻しただけで、**tmp-admin が sans を規定していない**という
  ① 層の欠落そのものは埋めていない。[思想への指摘](../共通コンポーネント思想への指摘.md) の候補。

## 関連

- 手順書: [手6 §2 D8](../手順/手6_ClaudeDesignへの同期.md)
- 実測の記録: [実行記録.md §手6](../実行記録.md)
- 申し送り: `.design-sync/NOTES.md` の Re-sync risks
