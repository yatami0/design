---
id: DR-0099
type: decision
title: '射程の外の一覧は機械が引く — 目で数えた 4 件は 1 件が誤りで、1 件が漏れていた'
status: decided
date: 2026-08-09
step: '-'
related: [DR-0096, DR-0098, DR-0077, DR-0004]
poc_feedback: '工場の規約: 「検査が届いていない対象」を文書に列挙しない。列挙は機械が性質から引き、検体側に主張を要求する 2 段で閉じる'
---

# DR-0099: 射程の外の一覧は機械が引く

## 背景

[DR-0096](DR-0096-overlays-that-no-story-opens-are-invisible-to-every-check.md) は
「**開かれない overlay はどの検査からも見えない**」を発見し、
**残っている対象として `DropdownMenu` / `Sheet` / `Tooltip` / `Select` の 4 件を名指しした。**
同 DR は「**開いた story を機械で要求できるか（開閉を持つ部品の一覧を機械が知る方法）は未検討**」と明記していた。

[部品4](../手順/部品4_開かれないoverlayを開く.md) でその 4 件を開きに行った。

## 決定

**「検査が届いていない対象」の一覧を、文書に手で書かない。機械が性質から引く。**

実装は **2 段**（部品4 D4=C）:

| 段 | 何を言うか | 実装 |
| --- | --- | --- |
| **静的** | **主張を持つ story が在るか** | `tools/opened-overlay-check.mjs` — 素材層から **`Primitive.Portal` を使うファイル**を引き、その `data-slot="…-content"` を主張する story を要求する |
| **動的** | **その主張が真か** | `src/stories/opened.ts` の `expectOpened(slot)` — portal の中身が実在し、大きさを持つことを確かめる |

🟥 **片方だけでは閉じない。**
静的だけなら「**書いてあるが開いていない**」を通す（[部品1 B1-06](../手順/部品1_完成バーを機械で閉じる.md) の面① が実際にその形だった）。
動的だけなら「**書かなければ検査の対象が 0 件**」——**DR-0096 の穴をそのまま再生産する。**

🟥 **検査自身が「対象 0 件で緑」にならないようにする**——
portal を持つ素材が 0 件なら失敗、素材から `data-slot` を取り出せなければ失敗。

## 根拠（実測・2026-08-09）

**目で数えた一覧は、2 種類の間違いを両方していた。**

| DR-0096 の名指し | 実測 |
| --- | --- |
| `Tooltip` は「開かれていない」 | 🟥 **誤り。**`Tooltip/AlwaysOpen` は **`<Tooltip open>`** で **2026-07-27（手5）から開いている**（`[data-slot="tooltip-content"]` が 1 件・`role="tooltip"`・実測） |
| 開く story を持つのは **2 件** | 🟥 **誤り。3 件**（`Dialog/Open` ／ `Tooltip/AlwaysOpen` ／ `DatePicker/Open`） |
| 残る対象は **4 件** | 🟥 **3 件**（`DropdownMenu` / `Sheet` / `Select`）**＋ 誰も挙げていない 1 件** |

★★ **誤った原因は数え方**——**story 名に `Open` が付くかで数えた**ので `AlwaysOpen` が漏れた。

★★★ **機械に引かせたら 7 件出た。**

```
$ node tools/opened-overlay-check.mjs
開閉を持つ素材 7 件（Primitive.Portal で判定）
  dialog-content / dropdown-menu-content / dropdown-menu-sub-content /
  popover-content / select-content / sheet-content / tooltip-content
```

🟥 **`dropdown-menu-sub-content`（入れ子メニュー）は、DR-0096 の 4 件にも
部品4 の着手前実測の 3 件にも入っていない**——**書いて走らせるまで誰も知らなかった。**
★ **目で数えると「目に入る粒度」でしか数えられない**（部品と部品の**部分**の区別が付かない）。

**赤テスト（両方向・部品4 K3）**:

| 検体 | 結果 |
| --- | --- |
| 静的 — `Sheet/Open` の主張を消す | 🟦 **exit 1** |
| 静的 — 戻す | 🟦 **exit 0** |
| 動的 — 主張を残して `<Tooltip open>` の `open` を外す | 🟦 **バーが赤**（1 failed） |
| 動的 — 戻す | 🟦 **緑**（2 passed） |

## 影響

**観測から直接言えること**

- **文書に列挙した「射程の外」は、書いた時点で古くなる。**
  DR-0096 の一覧は**書いた当日から誤っていた**（`Tooltip` は 2 日前から開いていた）。
- **一覧を引く鍵は「名前」ではなく「性質」。**
  `Primitive.Portal` を使う＝**閉じている間 DOM を持たない**という、DR-0096 が発見した性質そのもので引く。
  🟦 **名前の一覧を手で持たないので、素材が増えたら自動で対象が増える。**
- ★ **[DR-0077](DR-0077-abolish-the-two-occurrence-rule.md)（2 回ルールの廃止）と同じ向き**——
  **回数や記憶ではなく、材料と性質で決める。**

**🟥 推論（未検証）**

- **同じ形が他の「射程の外」にもあるか**は数えていない。
  🟨 候補: [台帳 §4](../部品の完成バー_台帳.md)（バーが見ていない出荷物）の残り ／
  `Sidebar` の `collapsed` と mobile（[OBS-0019](../OBS/OBS-0019_storyが一度も描いていない状態をどこまで機械で要求するか.md)）。
  **どれも「story が描かない状態」で、`Primitive.Portal` では引けない。**

## 関連

- 手順書: [docs/手順/部品4_開かれないoverlayを開く.md](../手順/部品4_開かれないoverlayを開く.md) D4・D5・Q2・Q3
- [DR-0096](DR-0096-overlays-that-no-story-opens-are-invisible-to-every-check.md)（**本 DR が §影響 の一覧を訂正する。**発見そのもの＝「開かれない overlay は見えない」は維持）
- [DR-0004](DR-0004-document-system-and-git.md) §4（事実誤認の訂正は本文を直し、訂正した旨を残す）
- [DR-0098](DR-0098-incomplete-was-counted-as-green.md)（同じ回の 2 本目——**数え落としの別の形**）
- 実測の記録: [docs/実行記録.md](../実行記録.md) §部品4
