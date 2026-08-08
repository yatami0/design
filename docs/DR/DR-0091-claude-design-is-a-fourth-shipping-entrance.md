---
id: DR-0091
type: finding
title: 'Claude Design は 4 本目の出荷入口で、コア / 題材の境界は手書きの除外リストでしか閉じていない'
status: observed
date: 2026-08-08
step: '-'
related: [DR-0085, DR-0087, DR-0088, DR-0079, DR-0040]
poc_feedback: '工場の規約: 出荷入口を数えるときは Claude Design 経路を 4 本目として数える（除外は titleMap の手当てで、機械では守られていない）'
---

# DR-0091: Claude Design は 4 本目の出荷入口で、コア / 題材の境界は手書きの除外リストでしか閉じていない

## 背景

工程2 は「`dist` に何が入るかを決める規則は 3 本あり互いに独立」と数えた（[DR-0085](DR-0085-three-independent-scopes-decide-what-ships.md)）。
工程3 は「題材（Redmine）は出荷しない」を lint 2 本で機械化した（[DR-0087](DR-0087-fetching-belongs-to-the-subject-layer.md)）。
2026-08-08 の `/design-sync` 再同期（[PR #12](https://github.com/yatami0/design/pull/12) · `cfeaff5`）で、
**題材の story が Claude Design 側に湧かないか**を観測した——工程3 が同期に託した 3 点のうちの 1 つ。

## 発見

**湧かなかった。ただし自動ではない。**`.design-sync/config.json` の `titleMap` に
**`null` を手で 2 件足して除外した**結果である。

1. **`/design-sync` は `dist` を経由しない別の出荷入口である。**
   [DR-0085](DR-0085-three-independent-scopes-decide-what-ships.md) が数えた 3 本
   （① JS = entry からの到達可能性 ② `.d.ts` = dts の `include` ③ 静的 = `publicDir`）はいずれも `dist` の話で、
   **この経路はどれにも掛からない**。入るかどうかを決めるのは **story の `title`** であって、
   `src/index.ts` の export でもディレクトリでもない。
2. **境界を守っているのは lint ではなく手書きの除外リスト。**
   [DR-0087](DR-0087-fetching-belongs-to-the-subject-layer.md) の lint 2 本
   （`fetch` 直書き禁止 ／ コアから題材への import 禁止）は**この経路を 1 行も見ていない**。
3. 🟥 **したがって、次に題材 story を足したとき `titleMap` への追記を忘れると、黙って出荷側に湧く。**

## 根拠（実測）

**① 除外は手当てだった**——`git diff 5a9abde..cfeaff5 -- .design-sync/config.json`:

```diff
-    "I層の比較": null
+    "I層の比較": null,
+    "データの器（MSW）": null,
+    "チケット一覧": null
```

`データの器（MSW）` は工程2 の `★ Review` story、`チケット一覧` は工程3 の `⑤ 題材（Redmine）` story。
`.design-sync/NOTES.md` は**足す前は `[TITLE_UNMAPPED]` として警告に出ていた**と記録している
（＝ **除外しなければ「未対応の title」として扱われる**のであって、既定で落ちるのではない）。

**② 判定に使われるのは title**——`titleMap` の `null` 項目は `componentFor()` の key に入らない。
同期側は「`null` の項目は key に入らないので既存 31 件の grade は動かない」ことを実測で確認している。

**③ lint の射程**——`eslint.config.mjs` の 2 ルールはどちらも `src/**` の import と呼び出しを見ており、
`.design-sync/config.json` も story の `title` も対象に含まない。

**④ 実害はまだ出ていない**——今回の同期結果は `removed: []` / render check 36/36 clean で、
題材のカードは 1 件も作られていない。

## 影響

**観測から直接言えること**

- **出荷入口は 4 本ある**（`dist` の 3 本 ＋ Claude Design 経路）。
  4 本目だけ**判定軸が違う**（ディレクトリでも export でもなく story の `title`）
- 工程3 が同期に託した観測 ③ の答えは「湧かなかった」だが、
  **それは自動的に守られたのではなく、同期を打った回で人（と Claude）が気づいて手当てした**結果
- [DR-0040](DR-0040-frame-leaks-when-a-layer-is-added.md)（層を足すと射程が漏れる）の**出荷側での再演**——
  工程3 で題材の層を足したら、lint は追随したが**同期経路は追随しなかった**

**🟥 推論（未検証）**

- **工程4 以降で題材 story が増えるたびに同じ手当てが要る。**
  機械化するなら `⑤ 題材（Redmine）/` で始まる title を自動除外する規則が要るが、
  **`.design-sync/config.json` は skill 側の書式なので、我々の lint で守れるかは調べていない**
- 🟥 **逆向きの漏れ（コアなのに `titleMap` の `null` に入れてしまい出荷から落ちる）**は数えていない。
  現在 `null` は 9 件あり、うち 7 件は `★ Review` の観点カード（意図的）だが、**全件の妥当性は検算していない**

## 関連

- 実測の記録: [docs/実行記録.md](../実行記録.md) §`/design-sync` 再同期（工程3 後）
- 同期側の記録: `.design-sync/NOTES.md` §工程3 後の再同期
- 測れなかったもの: [OBS-0014](../OBS/OBS-0014_同一ファイルに2キーを向けたときconverterが何をするか.md)
