# shadcn/ui × Claude Design 連携 調査まとめ

> 調査日: 2026年7月24日
> テーマ: shadcn/ui を /design-sync で Claude Design に取り込み、デザイントークン準拠の UI 生成・レイアウト検討に使えるか

## 結論（TL;DR）

- **shadcn/ui × /design-sync の構成は相性が良く、実例もすでにある**
- shadcn の CSS 変数ベースのトークンはデザインシステムとしてそのまま活きる
- レイアウト検討は Low-fidelity（ワイヤーフレーム）モードでのパターン量産が有効
- 「Claude チャットでよくね？」に対する差別化は、①複数パターン比較 ②キャンバス上の直接編集 ③実装への往復接続 の3点
- 効くのは単発画面ではなく「デザインシステム固定 × 複数画面 × パターン比較 × コードへ戻す」の往復ワークフロー

---

## 1. shadcn/ui を取り込めるか → できる

- Vite / React 19 / TypeScript / Tailwind CSS v4 の React アプリを `/design-sync` で Claude Design 上のデザインシステムとして同期した検証例がある（サーバーワークス）
- shadcn/ui はコンポーネントのコードが**自分のプロジェクト内に実体として置かれる**方式（npm のブラックボックスではない）ため、「ローカルのコンポーネントを変換してアップロード」という /design-sync の仕組みと噛み合う
- shadcndesign 公式も「shadcn/ui の Figma キット + 対応する React コードベースを Claude Design のデザインシステムとして使う」手順を公開している

### /design-sync の実行フロー（おさらい）

1. `/design-login` で認証（URL → アクティベーションコード貼り付け）
2. `/design-sync` 実行 → ローカルの React コンポーネントを変換してアップロード
3. アップロード範囲・デザインシステム名を対話的に確認される
4. 勝手に上書きせず、書き込み・削除・起点フォルダの計画を提示してから実行

アップロードは「finalize_plan → write_files → register_assets」の3ステップで行われる（Qiita 検証記事より）。

---

## 2. デザイントークン → shadcn の CSS 変数がそのまま活きる

- shadcn はトークンを **CSS 変数**で管理する設計。デザインシステムとして登録すれば、色・フォント・余白・コンポーネントのルールを固定し、以降の UI 生成をそれに準拠させられる
- 取り込んだコンポーネントは Claude Design が**検証してから出力に使う**ため、「shadcn の部品でいい感じに組み立てたものを見る」はまさに想定ユースケース
- 運用イメージ:
  - Design System: 色・フォント・余白・ボタン・カード等のルールを固定
  - Project: LP・管理画面・プロトタイプ等の成果物を作成
  - Claude Code: `/design-sync` でシステムを取り込み、`/design` でコードへ戻す

---

## 3. レイアウト課題 → ワイヤーフレームモードで解決しやすい

- Prototype タブで **Low-fidelity（白黒の骨組みだけのワイヤーフレーム）** と **High-fidelity（カラー・ビジュアル込み）** を選択可能
- 実務的な推奨フロー: **Low-fi で素早く何パターンも出して比較 → 方向性が決まったら High-fi で仕上げる**の2段階
- PRD（Markdown）を添付してワイヤーフレームを依頼すると、指示しなくても **1〜5パターンの UI 案**を並べて生成してくれたという検証あり
- 手書きスケッチからプロトタイプを生成する「Start with Sketch」機能もある

### ⚠️ 注意点

- 最初はワイヤーフレームが shadcn/ui のデザインシステムを**完全に無視していた**という報告あり。再指示したら適用された
- → **「デザインシステム準拠で」と明示的に指示する**のがコツ

---

## 4. 「Claude チャットでよくね？」への答え

差が出るのは主に3点。

| 観点 | チャット + Artifacts | Claude Design |
|------|---------------------|---------------|
| パターン比較 | 1案ずつ | 複数レイアウト案を並べて出す前提の設計 |
| 反復編集 | 文章で指示を往復 | キャンバス上で要素を直接移動・注釈、Tweaks スライダーでリアルタイム調整 |
| 実装への接続 | スクショ渡して作り直し | `/design-sync` により既存コンポーネント起点で作業、`/design` でコードへ戻せる |

### 使い分けの目安

- **単発の画面を1つ作るだけ** → チャット + Artifacts で十分
- **shadcn ベースのデザインシステムを固定して、複数画面・複数パターンを量産しながらレイアウトを詰めて、決まったらコードに戻す** → Claude Design が効く

---

## 5. 推奨ワークフロー案

1. ローカルに shadcn/ui プロジェクトを用意（components.json / CSS 変数トークン整備）
2. `/design-login` → `/design-sync` でデザインシステムとして登録
3. PRD を添付し、Low-fi ワイヤーフレームで**レイアウトパターンを量産・比較**
4. 方向性決定後、「デザインシステム準拠で」と明示して High-fi 化
5. `/design` で Claude Code 側へ戻し、実装を継続
6. デザイン → コード方向の反映は**差分確認前提**で運用

### ⚠️ 既知のハマりポイント

- デザイン側で編集した内容をコードに反映する部分は苦労したという報告あり（デザイン → コード方向は過信しない）
- `@dsCard` 等のマーカーを HTML に埋め込むだけでは表示されないケースあり（Qiita 検証）
- Enterprise プランはコネクタがデフォルト OFF。管理者による有効化が必要
- ワイヤーフレーム生成時のデザインシステム無視（前述）

---

## 参考リンク

- [Claude Code の /design-sync で claude.ai/design のデザインシステムを CLI から操作してみた（Qiita）](https://qiita.com/saitoko/items/3691a3e0dee5795dd6d5)
- [Claude Code の design-sync でコードとデザインを双方向に同期してみた（サーバーワークス）](https://blog.serverworks.co.jp/claude-design-sync)
- [How to Use Our shadcn/ui Figma Kit as a Design System for Claude Design（shadcndesign）](https://www.shadcndesign.com/blog/use-shadcn-ui-figma-kit-as-design-system-for-claude-design)
- [Simulating how to use Claude Design in product design（note / yiping）](https://note.com/20191201yiping/n/n88a62ff4604f)
- [Claude Design 活用ガイド（FIXIT）](https://fixit.co.jp/insights/claude-design-tool-integration-use-cases/)
- [Claude Design 完全ガイド 2026年7月版（genai-ai）](https://genai-ai.co.jp/ai-kanri/blog/cc-yt-claude-design-guide-106/)

※ 機能は変わりやすいため、最新情報は公式ドキュメントを確認してください。