---
id: DR-0085
type: finding
title: '出荷物 dist に何が入るかを決める規則は 3 本あり、互いに独立している'
status: observed
date: 2026-08-07
step: 工程2
related: [DR-0040, DR-0078, DR-0079]
poc_feedback: '工場の規約: 「出荷面は src/index.ts」と書くだけでは足りない。dist の入口は 3 本あることを規約に明記する'
---

# DR-0085: 出荷物 `dist` に何が入るかを決める規則は 3 本あり、互いに独立している

## 背景

工程2 で題材（Redmine のモック）を足すにあたり、「出荷物は Redmine を知らない」（[DR-0078](DR-0078-repo-becomes-a-ui-factory-for-a-core-design-system.md)）を
守れているかを確かめるため、**足す前に `dist/` のファイル一覧を撮り、足した後に差分で見た**（手順書 D9=A・K4）。

## 発見

`src/mocks/**`（4 ファイル）と `src/redmine/**`（4 ファイル）を足し、`public/` を新設したところ、
`dist/` は **57 → 66 ファイル**になった。増えた 9 件の入口は**3 本に割れる**。

| 入口 | 何が決めるか | 今回入ったもの |
| --- | --- | --- |
| ① **JS バンドル** | `build.lib.entry` からの**到達可能性** | 🟦 **0 件**（`design.mjs` は 61.36 kB のまま 1 バイトも増えていない） |
| ② **型宣言 `.d.ts`** | `vite-plugin-dts` の **`include` 設定**（＝ディレクトリ指定） | 🟥 **8 件**（`dist/mocks/*.d.ts` 4 ＋ `dist/redmine/*.d.ts` 4） |
| ③ **静的ファイル** | Vite の **`publicDir` を丸ごとコピー**する既定挙動 | 🟥 **1 件**（`dist/mockServiceWorker.js`） |

★ **①②③ は同じ「出荷」の話に見えて、判定規則が 1 つも共通していない。**
`src/index.ts` から export していないコードでも ② には出るし、③ に至っては**コードですらない**——
Storybook に MSW の worker を配るために `public/` を作っただけで、**ライブラリの配布物に mock の worker が混ざった**。

🟨 **② の漏れは工程2 が作ったものではない。**撮った基準（工程1 完了時点）に既に
`dist/lib/fixtures/issues.d.ts` が居た——**entry から到達しないのに宣言だけ出ている**状態は工程1 から続いていた。
差分で見たから気づけた（先に塞いでいたら観測できなかった）。

## 根拠（実測）

- 2026-08-07・vite 8.1.5 ／ vite-plugin-dts 5.0.3
- `find dist -type f | sort` の差分: 追加 9 件（上表）。`design.mjs` は **61.36 kB / gzip 12.31 kB** で前後同一
- `grep -c "msw" dist/design.mjs` → **0**（① が守られていることの確認）
- 対処後（dts の `exclude` に 2 ディレクトリ ＋ `build.copyPublicDir: false`）に撮り直して
  **工程1 時点のファイル一覧と完全一致**（57 件・`diff` が空）

## 影響

**観測から直接言えること**

- **「出荷面は `src/index.ts` の 1 本」という言い方は誤り。**入口は 3 本あり、
  そのうち 2 本は**ファイルの置き場所（ディレクトリ）だけで決まる**。
- [DR-0040](DR-0040-frame-leaks-when-a-layer-is-added.md)（層を足すたびに射程が漏れる）と**同じ形**だが、
  向きが逆——DR-0040 は「検査の射程から漏れる」、こちらは「**出荷の射程に混ざる**」。
  どちらも原因は同じで、**ディレクトリ単位の規約は層を足すたびに更新が要る**。
- 🟦 **差分で見る手順そのものが効いた。**「塞ぐ前に撮る」を決めていなければ、
  ② の漏れ（工程1 から在った）は「工程2 で作った」と誤って記録されていた。

**🟥 推論（未検証）**

- 出荷口はもう 1 つある（Claude Design・[DR-0079](DR-0079-ship-via-git-dependency-and-claude-design.md)）。
  converter は `dist/` の `.d.ts` を読むので、**② の漏れは「相手側の lint 規則」にも化けうる**（[DR-0059](DR-0059-receiver-generates-its-own-adherence-lint.md)）。
  今回は塞いだので実害は出ていないが、**次に層を足すときも同じ順（撮る → 足す → 差分）で確認する**。

## 関連

- 手順書: docs/手順/工程2_データの器_MSWとデータモデル.md §0 Q5・K4・D9
- 実測の記録: docs/実行記録.md §工程2
