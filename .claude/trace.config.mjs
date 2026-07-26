// trace（記録の器）の repo 固有設定。
// エンジン本体は plugin 側（trace@aisy）にあり、語彙もパスも持たない。ここが唯一の出どころ。
//
// 使い方:
//   node "<plugin>/tools/docs-meta.mjs" --check     docs/DR 全体を検査
//   PreToolUse(Write) hook が新規 DR の frontmatter と採番を書き込み前に止める
//
// `.json` ではなく `.mjs` なのは、語彙のコメントが情報資産だから。

export default {
  // ⚠ `docs` ではなく `docs/DR` に絞っている。
  // 本 repo の docs/ には frontmatter の形が 3 種類ある——
  //   docs/DR/      … 下の fields の形
  //   docs/手順/    … step / title / status / updated_at / next_action（type が無い）
  //   docs/*.md     … frontmatter を持たない（handoff・部品カタログ 等）
  // trace は docsRoot 全体に fields を 1 組しか持てないので、
  // `docs` にすると手順書と直下の文書が「必須フィールドが無い」で新規作成をブロックされる。
  // 台帳（採番の重複防止・DR の規約）だけを見させるのが最小。
  docsRoot: 'docs/DR',

  // 台帳（1 ファイル = 1 決定 or 1 発見）。ID はファイル名が持つ
  ledgers: [{ dir: 'docs/DR', idPattern: '^(DR-\\d{4})', idPrefix: '' }],

  // 語彙（閉じた集合）— 正本は docs/DR/_template.md
  // 実データ 27 件は decision→decided / finding→observed にきれいに割れているが、
  // テンプレートは status を型で分けていないので、そのまま和集合にしてある。
  // 厳しくするなら decision: ['decided','superseded'] / finding: ['observed','superseded']
  types: {
    decision: ['decided', 'observed', 'superseded'], // 決めたこと
    finding: ['decided', 'observed', 'superseded'], // 分かったこと
  },

  // フィールド定義。並び順がエラーメッセージの列挙順になる
  fields: {
    id: { level: 'required', kind: 'string' },
    type: { level: 'required', kind: 'typeKey' },
    title: { level: 'required', kind: 'string' },
    status: { level: 'required', kind: 'statusOf', of: 'type' },
    date: { level: 'required', kind: 'string' },
    step: {
      level: 'required',
      kind: 'pattern',
      // 手0〜手9（枝番 a-z 可）／`-` は手に属さない
      pattern: '^(手[0-9][a-z]?|-)$',
      example: '手0 / 手2 / 手2b / -',
      hint: '補足は本文に書く',
    },
    related: { level: 'optional', kind: 'idArray' },
    // PoC へ戻す候補なら行き先を書く。無ければ null
    poc_feedback: { level: 'optional', kind: 'string' },
  },

  // related に書ける ID。本 repo の台帳は DR だけ
  idPattern: '^DR-\\d{4}$',
  idExample: 'DR-0006',

  rulesRef: 'docs/DR/_template.md（型の正本）',
};
