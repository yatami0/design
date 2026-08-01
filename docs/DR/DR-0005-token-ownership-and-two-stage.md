---
id: DR-0005
type: decision
title: 'トークン語彙の正本は design 側・値は tmp-admin を引き継ぐ・投入は 2 段階'
status: decided
date: 2026-07-26
step: '-'
related: [DR-0002, DR-0010, DR-0012]
poc_feedback: 'OBS-0003（案A/案B）の判断材料'
---

# DR-0005: トークン語彙の正本は design 側・値は tmp-admin を引き継ぐ・投入は 2 段階

## 背景

PoC 側に `packages/tailwind-config/theme.css`（トークン語彙の正本）があるが、**誰も import していない孤立資産**で値も仮置きのまま。一方 CC-Skills に `tmp-admin` という蒸留済み哲学がある。どちらを正本にするかを決める必要があった。

## 決定

1. **語彙の正本は design 側が持ち、PoC へ逆輸入する**（ユーザー決定 2026-07-26）。shadcn 標準語彙を土台に PoC の意味色（danger / warning / success）を接続する形。
2. **値は CC-Skills の `tmp-admin` 哲学を引き継ぐ**（ユーザー決定 2026-07-26）。ゼロから決め直さない。
3. **投入は 2 段階。**shadcn デフォルトのまま部品と画面を組み切り、**そのあとで tmp-admin の値を流し込む**（手5）。最初から自分の値で組むと「部品を触らずに変えられたか」が判定できなくなる。

## 根拠（実測）

- PoC の `theme.css` は現状孤立資産で、値も「🟥 具体値は S0-12 で UI 骨格と合わせて確定」の仮置き。**壊すコストが低い**。
- `tmp-admin`（`~/git/CC-Skills/web-design-mock/_philosophies/aux-admin/aux-admin.md`）は **`status: approved`**・D4 汎化検証済み（同型で不足ゼロ・盲検 same-family 93）。`validated_screens` に「エンタープライズ管理画面(一覧)」「データテーブル / 時系列ログ一覧」があり、**Redmine チケット一覧と射程が一致**する。
- 決定3 の設計意図: **差し替え自体を検証行為にする**。1 行でも部品を触ったら、その部品は「変えない層」に居ない＝そこが設計の穴。

## 影響

- 🟨 `tmp-admin` の原則「**accent は塗りに使わない・ブランドは濃紺の面で出す**」は、shadcn 既定（`primary` の塗り CTA）と**真逆**。この衝突の解き方自体が手2 の検証項目になる。
- 🟥 引き継げないのは**語彙**。shadcn は `background`/`foreground`/`primary`/`destructive`…、CC-Skills は Apple 系（`--space-7`/`--shadow-1`/`--color-accent`）。**この語彙のマッピングが「トークン差し替え」の実務的な中身**であり、手2 の成果物になる。
- 手5 の結果は PoC の **OBS-0003（案A/案B）** の判断材料になる。

## 関連

- [UI検証の位置づけと段取り.md](../UI検証の位置づけと段取り.md) §7
