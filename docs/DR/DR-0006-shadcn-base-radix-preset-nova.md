---
id: DR-0006
type: decision
title: 'shadcn は base=radix / preset=nova（CLI v4 の設定モデルは base + preset の 2 軸）'
status: decided
date: 2026-07-26
step: 手1
related: [DR-0013, DR-0016]
poc_feedback: null
---

# DR-0006: shadcn は base=radix / preset=nova（CLI v4 の設定モデルは base + preset の 2 軸）

## 背景

手1 の計画時、公式の components.json ドキュメントを根拠に「`tailwind.baseColor` を neutral にする」を不可逆な判断として決めていた（D1）。ところが H1-02 着手時に `shadcn init --help` を実測したところ、**そのフラグが存在しなかった**。

## 決定

| 軸 | 決定 | 戻せるか |
|---|---|---|
| `--base`（プリミティブ実装） | **radix**（ユーザー決定 2026-07-26。他は `base`=Base UI / `aria`=React Aria） | 🟥 重い（全部品の実装と依存が変わる） |
| `--preset`（設計システム） | **nova**（＝`radix-nova`。他は Vega / Maia / Lyra / Mira / Luma / Rhea / Sera） | 🟦 戻せる |
| CLI の版 | **`shadcn@4.15.0` に固定**（`@latest` を使わない） | 🟦 戻せる |
| add する部品 | 一覧画面から逆算した **18 件**のみ（全 63 は入れない） | 🟦 戻せる |

**radix を選んだ根拠**: 世に出回るコード・作例が圧倒的に多い。**手7 の「Claude Design が登録部品を使うか作り直すか」の判定で、AI 側が既知の形を持っている方が「知らなかったから作り直した」という交絡を減らせる。**PoC 移送後に情報を引ける量も最大。

**nova を選んだ根拠**: CLI の既定（`--defaults` は `base-nova`）。compact layout 志向で管理画面に向く。**後から差し替え可能**なので手5 の出発点として支障がない。

**CLI 版を固定する根拠**: CLI が生成するコードは成果物。**生成器の版が動くと再現しない**が、手5 の差し替え実験は再現性が前提。

## 根拠（実測）

- `pnpm dlx shadcn@4.15.0 init --help` の出力に `--base-color` は無く、`-b, --base <base> (base, radix, aria)` と `-p, --preset [name]`、`-d, --defaults`（= `--template=next --preset=base-nova`）があった。
- 実行: `pnpm dlx shadcn@4.15.0 init --template next --base radix --preset nova --yes`
- 生成された `components.json`: `style: "radix-nova"` / `rsc: true` / `tsx: true` / `tailwind.{config:"", css:"src/app/globals.css", baseColor:"neutral", cssVariables:true, prefix:""}` / `iconLibrary: "lucide"` / `rtl: false` / `aliases` / `menuColor: "default"` / `menuAccent: "subtle"` / `registries: {}`
- ⚠ **当初「`baseColor` は論点ごと消滅」と記録したが誤り。**設定キーとしては実在し、CLI が既定値 `neutral` を書き込んでいた（＝D1 の決定と結果的に一致）。`cssVariables` も既定 `true`。
- 「preset 無し」モードは存在しない（[Discussion #10236](https://github.com/shadcn-ui/ui/discussions/10236) のメンテナ回答）。ただし同回答は「**コンポーネントのソースを触らず CSS カスタムプロパティで設計システムを上書きする**」ことを推奨——**手5 でやろうとしていることと一致**しており、前提として好材料。

## 影響

- 🟦 **一次情報を実測で置き換える規律が効いた例。**公式 docs だけで進めていたら、存在しないフラグを前提に手順を組んでいた。
- `--base` を変えると全部品の実装が変わるため、手3 以降で覆すのは高コスト。

## 関連

- [手1_shadcn導入と役割分類.md](../手順/手1_shadcn導入と役割分類.md) §2 追記
- 出典（2026-07-26 取得）: [CLI](https://ui.shadcn.com/docs/cli) / [CLI v4 changelog](https://ui.shadcn.com/docs/changelog/2026-03-cli-v4) / [React Aria changelog](https://ui.shadcn.com/docs/changelog/2026-07-react-aria)
