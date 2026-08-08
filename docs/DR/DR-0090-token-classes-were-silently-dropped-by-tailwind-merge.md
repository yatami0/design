---
id: DR-0090
type: finding
title: 'トークン語彙のクラスは tailwind-merge に認識されず、素材層の既定に負けていた — prop は存在し、型も lint も緑で、作用だけが無かった'
status: observed
date: 2026-08-08
step: '-'
related: [DR-0089, DR-0066, DR-0074, DR-0061, DR-0063, DR-0005]
poc_feedback: '工場の規約: 語彙を足したら tailwind-merge にも教える（二重管理の口が 1 つ増える）'
---

# DR-0090: トークン語彙のクラスは tailwind-merge に認識されず、素材層の既定に負けていた

## 背景

[DR-0089](DR-0089-overlays-do-not-cover-their-anchor.md) の計測でトリガの実寸を撮ったところ、
`<SelectTrigger width="md">`（＝ 192px のはず）が **106.64px** だった。
`width` prop は手8d H8D-04 で「6 周とも同じ場所で `className` に幅が書かれた」ことを根拠に
新設したもので、**工場が逸脱を根拠に作った最初の prop**である。

## 発見

**`width` prop は 3 語とも一度も効いていなかった。**原因は 3 段の連鎖:

1. 素材層は `cn("… w-fit …", className)` と書く（[select.tsx L47](../../src/components/ui/select.tsx)）
2. `cn` = clsx + tailwind-merge。**tailwind-merge は既定のスケールに無い値を幅クラスと判定できない**ため、
   `w-field-md` を「未知のクラス」として扱い、**`w-fit` を落とさない**
3. 両方が同じ詳細度で当たり、**CSS の出力順で `w-fit` が勝つ**

🟥 **「対象 0 件で緑」の prop 版。**prop は存在し、型は通り、lint は緑で、story も build も緑。
**作用だけが無かった。**7 周の周回実験も工程3 も、この prop の*指定*は数えたが*効果*を測っていない。

## 根拠（実測）

**① tailwind-merge の挙動（対照つき）**

```
twMerge('w-fit w-full')     -> 'w-full'            ← 畳む
twMerge('w-fit w-48')       -> 'w-48'              ← 畳む
twMerge('w-fit w-[192px]')  -> 'w-[192px]'         ← 畳む
twMerge('w-fit w-field-md') -> 'w-fit w-field-md'  ← 🟥 畳まない
```

**② 描画された実寸**（Playwright・`② 素材層/Selection/Select` の `Widths` story）

| 指定 | 実測（塞ぐ前） | あるべき | 塞いだ後 |
|---|---|---|---|
| `w-field-sm` | 112.31px | 128px | — |
| `w-field-md` | 113.59px | 192px | 🟦 192px |
| `w-field-lg` | 104.88px | 320px | — |

🟥 **`sm` > `lg` の逆転が起きている**＝値は placeholder の文字数なり（`w-fit` のまま）。

**③ ユーティリティ側は正しい**——DOM に素の `<div class="w-field-md">` を挿すと **192px**。
**壊れていたのは生成でも語彙でもなく「合成」**だった。

**④ 波及範囲**（`tmp/dead-class-scan.mjs`・全 76 story の全要素を走査）

| 塞ぐ前 | 内訳 |
|---|---|
| **11 件** | `w-fit` が `w-field-md` に勝つ 8 件 ／ `w-field-lg` 2 件 ／ `w-field-sm` 1 件 |

該当 story は `③ Patterns/FilterBar`・`⑤ 題材（Redmine）/チケット一覧`・
`② 製品層・自作/Selection/PeriodSelect`・`② 素材層/Selection/Select` の 6 本。
**塞いだ後は同じ走査で 0 件**（対照）。

## 影響

**観測から直接言えること**

- 塞ぎ方は `cn` が使う twMerge に `@theme` の用途名を教えること
  （[src/lib/tw-merge.ts](../../src/lib/tw-merge.ts)。`extend: { theme: … }` の形でないと効かない——
  トップレベルに `theme` を渡す形は**無言で無視される**ことを実測した）
- **素材層で書き換えたのは `src/lib/utils.ts` の import 1 行のみ。**
  `src/components/ui/**` の diff は 0 行のまま（連続記録は途切れていない）
- 実際に死んでいた語彙は **`--container-field-*` の 3 語だけ**だった。
  `--spacing-*` / `--text-*` / `--color-*` 由来のクラスは 0 件——
  **素材層の既定と正面衝突する形で渡された語彙が他に無かった**ため
- 語彙の写しが `tokens.css` と `tw-merge.ts` の **2 箇所**になった（二重管理）

**🟥 推論（未検証）**

- **今後この穴は「語彙を足したとき」に再発する。**`tw-merge.ts` への追記を忘れると、
  効かない prop が静かに増える。**機械で守っていない**（検査を書いていない）
- 🟥 **同じ形の穴が `style` 属性や CSS 変数経由の指定にも在るかは見ていない。**
  今回数えたのは「クラス同士の衝突」だけ
- 7 周の周回実験で design agent が `w-48` を書いた（[DR-0063](DR-0063-forbidding-without-an-alternative-fails.md)）のに対し
  `w-field-md` を代替として与えたが、**その代替は当時から効いていなかった**ことになる。
  ただし**agent の出力が変わった**ことは別途観測されており（語彙外のクラス 0 件）、
  **「効かない代替でも出力は変わる」**のか、単に見た目の差に気づかれなかっただけかは切り分けていない

## 関連

- 実測の記録: [docs/実行記録.md](../実行記録.md) §Select の位置決めと語彙クラス
- 🟦 **計測器は残した**: [tools/dead-class-scan.mjs](../../tools/dead-class-scan.mjs)——全 story の全要素を走り、
  「語彙を教えた twMerge なら畳まれるのに DOM には両方残っている」箇所を数える。
  **語彙を足したら打ち直す**（0 件でなければ `tw-merge.ts` に足し忘れがある）。
  🟥 ただし**ゲートではない**（`pnpm lint` からは呼ばれない）。二重管理を機械で守る話は宿題のまま
- 🟨 位置決めの計測器（`tmp/select-position-probe.mjs`）は**検体 story ごと使い捨てにした**——
  `position` / `align` を渡す story は [DR-0089](DR-0089-overlays-do-not-cover-their-anchor.md) で
  型から消したので、同じ形では再実行できない。数値は上表と実行記録に転記済み
