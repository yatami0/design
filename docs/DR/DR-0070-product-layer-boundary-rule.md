---
id: DR-0070
type: decision
title: '素材層と製品層の境界は「見た目の管轄権」＋ 3 段の判定手順で決める'
status: decided
date: 2026-08-07
step: 手8c
related: [DR-0032, DR-0063, DR-0069]
poc_feedback: 'ui.md / architecture.md の材料（packages/ui の層境界の規則）'
---

# DR-0070: 素材層と製品層の境界は「見た目の管轄権」＋ 3 段の判定手順で決める

## 背景

手3 D1=(c)（欠落品 ＋ 既定値ラッパー）は**作った動機**であって判定規則ではなく、部品を足すたびにゼロから議論になっていた。手7 D10=B（素材層 16 件を包むか）も「包むかどうか」という下からの問いで止まっていた。手8c で DS 8 本を調査し、判定できる規則に落とした。

## 決定

**境界の原理: 素材層は見た目を決めない層、製品層は見た目を決める層。**利用側（画面・design agent）が見た目を選ぶ必要が生じた箇所を、製品層が**トークン語彙の union props** として引き取る。

**判定手順（この順に問う）:**

1. **同じ場所から逸脱（className / 生 CSS / 任意 JSX）が 2 回以上出たか** — No なら作らない（素材層のまま・観測を続ける）
2. **その選択はトークン語彙の有限集合で表せるか** — Yes なら**製品層で作る**（union props で型に閉じる）
3. No（自由合成が本質）なら**誰かの責務に割り当てられるか** — Yes ならその部品・層に引き取らせる（例: document reset → ④ 層）／ No なら **ReactNode で受けて「残す」と明記し、監視方法を決める**

「ケースバイケース」は不可。全文と適用例は [製品層の部品設計.md](../製品層の部品設計.md) §1〜§2。

## 根拠（実測）

- **6 周の逸脱が全件この規則で分類できた**（[実行記録 §手8c](../実行記録.md) H8C-01 と検算）: ① Select 幅 6/6 周 → 規則②Yes ／ ③ cell 書式 6/6 周 → ②Yes ／ ④ document reset 5/6 周 → ③Yes ／ accessor の ReactNode → ③No で「残す」 ／ 素材層 15 件のラッパー 0/6 周 → ①No で棄却
- **headless 二層を持つ DS 4 本（Radix・Base UI・Ark・React Aria）が全て「見た目の管轄権」で層を切っていた**（[二層構造の設計.md](../二層構造の設計.md) §6。全出典 URL・取得日つき）。Radix: "unstyled … giving you complete control over styling" ／ Adobe: aria = "behavior and accessibility"・spectrum = "Adobe-specific styling"
- **「トークン語彙の union props で閉じる」は Polaris の Box（`padding?: ResponsiveProp<SpaceScale>`）・Spectrum の style props 許可リストと同型**——我々の [DR-0032](DR-0032-layout-primitives-take-props-not-classname.md) が独自でないことの裏取り
- 規則②の形は手8 の実測とも一致——`width="md"` なら綴り事故（r4/r5 の `class=`）が構造的に起きない

## 影響

**観測から直接言えること**

- 手8c の設計（[製品層の部品設計.md](../製品層の部品設計.md)）で作ると決めた 4 件（Select の width・DataGrid 列オプション・AppShell の document shell・Link）は全部この規則から導出でき、**作らない 15 件（0 回）も規則が棄却する**
- 判定規則があるので、次に部品を足す議論は「実測の回数」と「語彙で表せるか」の 2 点に絞られる

**🟥 推論（未検証）**

- この規則で作った部品が実際に逸脱を消すかは 7 周目（実装後の再同期）で測る。「design agent が prop を選ぶか」は [DR-0063](DR-0063-forbidding-without-an-alternative-fails.md) からの類推であって未実測

## 関連

- 手順書: [手8c_製品層に何を作るべきかの調査設計.md](../手順/手8c_製品層に何を作るべきかの調査設計.md)（Q1）
- 実測の記録: [実行記録.md](../実行記録.md) §手8c
- 🔺 **ADR 昇格候補**（外から見える層構造の規則。起案は判定と分ける）
