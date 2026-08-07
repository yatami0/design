---
id: DR-0071
type: finding
title: 'className を閉じた製品層は成立する——ただし閉じた 2 本とも部品の外に出口を対で持つ'
status: observed
date: 2026-08-07
step: 手8c
related: [DR-0032, DR-0063, DR-0070]
poc_feedback: 'ui.md の材料（「定義したものだけを使う」の実現形。指摘 11 の §11.3 にも効く）'
---

# DR-0071: className を閉じた製品層は成立する——ただし閉じた 2 本とも部品の外に出口を対で持つ

## 背景

[DR-0032](DR-0032-layout-primitives-take-props-not-classname.md)（枠は props で閉じる）は我々が Layout 7 件で試しただけで、他所で成立しているのか・どこで破綻するのかを知らなかった（手8c Q3）。DS 8 本の一次情報（ソースの props 型・公式 docs・メンテナの回答）を調査した。

## 発見

- **`className` / `style` を props の型から消した DS が 2 本実在し、どちらも 7 年以上大規模運用されている**: Polaris（Shopify admin）と React Spectrum（Adobe 全製品）
- **閉じた理由は 2 本で一致**する——Polaris: "deliberate decision … we have incurred a lot of **support debt** … lots of **style regressions** any time we changed something" ／ Spectrum RFC: "**Custom `className` is too powerful.** It allows users to override literally anything … These overrides could easily break with future updates"
- **2 本とも「部品の外の出口」を対で持つ**: Polaris = トークン props の `Box`（`padding?: ResponsiveProp<SpaceScale>`）＋「Use our tokens. Build whatever you want with our tokens」／ Spectrum = 外に効く style props の許可リスト（"layout related options that affect things outside the component, but not internally"）＋ `UNSAFE_className`（"last resort"・**名前が破りを宣言する**）
- **逃げ道を開けた側にも管理コストの実測がある**: Primer は `sx` を「抽象を漏らさない逃げ道」として導入（ADR-005）した後、**v38 で完全廃止**（major version 1 つと自動変換ツールを費やした）。Radix Themes は「上書きが増えたら下層へ降りて自作しろ」という**運用ルールで縛る**しかなくなっている
- **許可リストの機械化は実在する**: Spectrum S2 の style macro は `styles` prop を branded type `StyleString<P>`（使ったプロパティ集合が型に焼き込まれる）にし、**「何を上書きできるか」を部品ごとに型検査する**

## 根拠（実測）

- Polaris: `ButtonProps` / `BaseButton`（24 props）に className/style が**無い**ことをソースで確認。理由は issue #726（2018・maintainer）と #4420（2022〜2024・maintainer）の原文。新 web components 版は「className を書いても効かない」へ強化
- Spectrum: `@react-types/shared/src/style.d.ts` の `StyleProps` に className/style が無く `UNSAFE_className?: string`（JSDoc "Only use as a last resort."）。理由は repo 内 RFC `rfcs/2019-v3-dom-props.md` の原文
- 全出典（URL・取得日 2026-08-07・ファイルパス）は [二層構造の設計.md](../二層構造の設計.md) §3

## 影響

**観測から直接言えること**

- **DR-0032 の形（props で閉じ、逃げ道は Box 1 つ）は外部に同型の先例が 2 本ある。**「(a) 逃げ道の数を絞る (b) 名指しで目立たせる (c) 代替語彙と対にする」の 3 条件を、閉じた 2 本と我々がともに満たしている
- [指摘 11](../共通コンポーネント思想への指摘.md)（許可リストを機械で強制する手段が無い）に対し、**型システムで許可リストを強制する実装例（S2 style macro）が存在する**

**🟥 推論（未検証）**

- 我々の規模（1 検証 repo）で Polaris/Spectrum 型の全閉鎖を敷く必要はない——必要が 2 回証明された箇所だけ閉じる（[DR-0070](DR-0070-product-layer-boundary-rule.md)）で足りる、は本 DR の観測からの推論。7 周目以降の逸脱数で検証する

## 関連

- 手順書: [手8c_製品層に何を作るべきかの調査設計.md](../手順/手8c_製品層に何を作るべきかの調査設計.md)（Q3）
- 実測の記録: [実行記録.md](../実行記録.md) §手8c／調査本体: [二層構造の設計.md](../二層構造の設計.md)
