// trace（記録の器）の repo 固有設定。
// エンジン本体は plugin 側（trace@aisy）にあり、語彙もパスも持たない。ここが唯一の出どころ。
//
// 使い方:
//   node "<plugin>/tools/docs-meta.mjs" --check     docs/ 全体を検査
//   PreToolUse(Write) hook が新規 md の frontmatter と採番を書き込み前に止める
//
// `.json` ではなく `.mjs` なのは、語彙のコメントが情報資産だから。

export default {
  // docs/ 全体を対象にする（語彙は PoC に合わせた）。
  // 既存文書は retrofit 未了で warn が出るが、**hook が止めるのは新規ファイルだけ**（既存の
  // 上書きは対象外）なので作業は止まらない。既存は段階的に埋める＝PoC と同じ方針。
  docsRoot: 'docs',

  // 台帳（1 ファイル = 1 決定 or 1 発見）。ID はファイル名が持つ。
  // dir / idPattern / idPrefix はエンジン（検査）が読む。残りは skill が読む。
  ledgers: [
    {
      name: 'dr',
      dir: 'docs/DR',
      idPattern: '^(DR-\\d{4})',
      idPrefix: '',
      filename: '{id}-{slug}', // {slug} は英小文字ケバブ（{title} なら日本語の短い題）
      template: 'docs/DR/_template.md',
      index: 'docs/DR/index.md',
      commitType: 'docs', // 本 repo の type 語彙に `dr` は無い（CLAUDE.md §git）
      extraSteps: [
        '`related` には実在する DR の id だけを書く。無ければ空配列。',
        '`poc_feedback` は PoC へ戻す候補なら行き先を書く（例: OBS 候補 / ADR-0019 の材料）。無ければ null。',
        '**ADR 昇格判定**: 一度決めると戻しにくい／外から見える構造・規約に影響するなら、`docs/DR/index.md` に昇格候補として印を付け、本文フォローアップにもマークする。**その場で起案しない**（判定と起案を分ける）。起案は `/adr`。',
      ],
    },
    {
      name: 'obs',
      dir: 'docs/OBS',
      idPattern: '^(OBS-\\d{4})',
      idPrefix: '',
      filename: '{id}_{title}', // 日本語の短い題（PoC に合わせた）
      template: 'docs/OBS/_template.md',
      index: 'docs/OBS/index.md',
      commitType: 'docs',
      extraSteps: [
        '未確認の印は `🟥 要確認`。凡例は 🟦 確定／🟨 暫定／🟥 未確認。',
        '起票時の必須は frontmatter と §0〜§2 のみ。残りは 🟥 のままでよい。',
        '§3 知識の結びつきは本人の頭の中の出来事。仮説は出してよいが、本人の確認なしに確定として書かない。',
        '会話で Mermaid 図を作っていたら §9 へコードブロックごと転記する（日付見出し＋キャプション）。',
        '昇格先は DR だけ（本 repo に OQ は無い）。`/dr` で起票し `promoted_to` に ID を書く。',
        '索引の「棚卸しメモ」に直近実施日を残す。',
      ],
    },
    {
      name: 'adr',
      dir: 'docs/adr',
      idPattern: '^(\\d{4})', // ファイル名は接頭辞なしの4桁（MADR の慣習）
      idPrefix: 'ADR-',
      filename: '{num}-{slug}', // {num} = idPattern が捕捉した部分＝ここでは 0029
      template: 'docs/adr/_template.md',
      index: 'docs/adr/index.md',
      commitType: 'docs',
      extraSteps: [
        '**判定と起案を分ける。**DR を書く時点では index に昇格候補として印を付けるだけ。起案は根拠が揃った時機に行う。',
        '昇格元の DR を `related` に列挙し、DR 側の status を `promoted` にして同一コミットで更新する。',
        '本文は MADR の構成（背景と課題 / 決定 / 検討した選択肢 / 根拠 / 結果）に従う。',
        '`decision-makers` は空配列でよい（本 repo は 1 人）。',
      ],
    },
  ],

  // コミットの形（CLAUDE.md §git が正本）
  commitFormat:
    '<type>(H<N>): 日本語要約 [手N] — 手に属さない作業は scope と [手N] を省く',
  commitTypes: [
    'feat',
    'fix',
    'docs', // 台帳・ノート・README
    'chore',
    'build',
    'procedure', // docs/手順/ の作成・改訂
    'refactor',
    'test',
  ],
  // 状態台帳（いまどうなっているかの唯一の正本）
  stateLedger: {
    path: 'docs/handoff.md',
    commitType: 'docs',
    extraSteps: [
      '「機械ゲートのベースライン」の件数と内訳も実態に合わせる（新しい赤を見つけるための基準なので、古いと役に立たない）。',
      '手が完了していたら「手N の成果（次の手が前提にすること）」を追記し、「次にやること」を次の手に差し替える。',
      '手ごとに `step/h<N>-<slug>` を切っている。手が完了したら `main` へ `--no-ff` マージすることを人に提案する（実行はしない）。',
      '`docs/共通コンポーネント思想.md` はユーザーの持ち物。気づきは DR か OBS に書く。',
    ],
  },

  commitExtraSteps: [
    '`main` が安定点。手ごとに `step/h<N>-<slug>` を切り、完了したら `main` へ `--no-ff` マージ。',
    '手に属さない作業（文書整備・証跡整理）は `main` に直接コミットしてよい。',
    '`docs/共通コンポーネント思想.md` は**ユーザーの持ち物**。書き換えず、指摘は DR に書く（CLAUDE.md）。',
    '機械ゲートは `pnpm typecheck && pnpm lint && pnpm build && pnpm format:check && pnpm spell`。赤がベースラインなので、`docs/handoff.md` の表と件数を比べて「新しい赤」だけを見る。',
  ],

  // 語彙（閉じた集合）— ここが正本。各 _template.md は読むための写し。
  // decision/finding: 実データ 27 件は decision→decided / finding→observed に割れているが、
  // テンプレートは status を型で分けていないので、そのまま和集合にしてある。
  // 厳しくするなら decision: ['decided','superseded'] / finding: ['observed','superseded']
  types: {
    // 台帳（docs/DR）— 定まったもの
    decision: ['decided', 'observed', 'superseded'], // 決めたこと
    finding: ['decided', 'observed', 'superseded'], // 分かったこと
    // 台帳（docs/adr）— 横断決定（MADR 準拠）
    adr: ['proposed', 'accepted', 'rejected', 'deprecated', 'superseded'],
    // 台帳（docs/OBS）— まだ決まっていないもの。PoC の語彙に合わせた
    question: ['open', 'connected', 'promoted', 'closed'], // わからないまま進めた疑問
    insight: ['open', 'connected', 'promoted', 'closed'], // 知識が結びついた気づき
    // 手順・状態（PoC の語彙に合わせた。status の値は本 repo の _template が正本）
    procedure: ['planned', 'in-progress', 'done', 'blocked'], // docs/手順/
    process: ['stable'], // 段取り（地図）
    ledger: ['living'], // handoff（状態台帳）
    principle: ['stable', 'superseded'], // 思想・原則集
    record: ['stable'], // 実行記録（実測のみ）
    reference: ['stable', 'stale'], // 対応表・カタログ
    concept: ['draft', 'stable', 'superseded'], // 単発の概念解説
    study: ['draft', 'stable', 'superseded'], // 調査・比較検討
  },

  // フィールド定義。並び順がエラーメッセージの列挙順になる
  fields: {
    // 必須は PoC と同じ 4 つ（type / title / step / status）。
    // `id` と `date` は台帳だけが持つものなので必須にしない——必須にすると
    // 手順書と直下文書が新規作成できなくなる（hook は missing-required で止める）。
    type: { level: 'required', kind: 'typeKey' },
    title: { level: 'required', kind: 'string' },
    id: { level: 'recommended', kind: 'string' }, // 台帳では実質必須
    date: { level: 'recommended', kind: 'string' },
    step: {
      level: 'required',
      kind: 'pattern',
      // 手0〜手9（枝番 a-z 可）／`-` は手に属さない
      pattern: '^(手[0-9][a-z]?|-)$',
      example: '手0 / 手2 / 手2b / -',
      hint: '補足は本文に書く',
    },
    status: { level: 'required', kind: 'statusOf', of: 'type' },
    related: { level: 'optional', kind: 'idArray' },
    // PoC へ戻す候補なら行き先を書く。無ければ null
    poc_feedback: { level: 'optional', kind: 'string' },
    // OBS で使う。DR 側には無くてよい（optional なので欠けても警告しない）
    updated: { level: 'optional', kind: 'string' },
    tags: { level: 'optional', kind: 'array' },
    promoted_to: { level: 'optional', kind: 'string' },
  },

  // related / promoted_to に書ける ID
  idPattern: '^(DR-\\d{4}|OBS-\\d{4}|ADR-\\d{4})$',
  idExample: 'DR-0006 / OBS-0018 / ADR-0001',

  rulesRef: '.claude/trace.config.mjs（語彙の正本）／各台帳の _template.md',
};
