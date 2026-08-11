// 手4 H4-02 — チケット一覧のダミーデータ（D1=A・使い捨ての手書き）
//
// 🟥 **なぜ手書きか**: PoC の契約は `/ping` 1 本しか無い（2026-07-26 実測）。
//    design 側で issues の Zod 契約を書くと**契約の正本が 2 箇所に割れる**ので採らない
//    （PoC の「正本 1 つ・残りは導出」原則。段取り §4 の仮置き）。
//
// 🟦 **差し替え点はこのファイルの型 1 つだけ。**PoC の S3 で issues 契約ができたら
//    `export type Issue = ...` を生成型への alias に置き換えれば、画面側は無変更で済む。
//    → これが Q5（後で生成型に差し替えられる形か）の答えになる。

/** ステータス。表示は状態 tint（tmp-admin §4.5）で出す。 */
export type IssueStatus = 'new' | 'inProgress' | 'resolved' | 'closed';

/** 優先度。 */
export type IssuePriority = 'low' | 'normal' | 'high' | 'urgent';

/**
 * 🟦 **差し替え点。**S3 の生成型ができたらここを alias にする。
 * 画面・Pattern・DataGrid はこの型しか見ない。
 */
export interface Issue {
  /** 機械的識別子。tmp-admin §4.4 により**等幅**で表示する。 */
  id: string;
  subject: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: string;
  /** ISO 8601。桁を比べるので `tabular-nums` で表示する。 */
  updatedAt: string;
}

export const issues: Issue[] = [
  {
    id: 'REDMINE-1042',
    subject: 'ログイン後にサイドバーの選択状態が復元されない',
    status: 'inProgress',
    priority: 'high',
    assignee: '佐藤 花子',
    updatedAt: '2026-07-24T09:12:00+09:00',
  },
  {
    id: 'REDMINE-1041',
    subject: 'チケット一覧のページャが最終ページで空になる',
    status: 'new',
    priority: 'urgent',
    assignee: '田中 太郎',
    updatedAt: '2026-07-24T08:40:00+09:00',
  },
  {
    id: 'REDMINE-1038',
    subject: '添付ファイルのサムネイルが縦長画像で崩れる',
    status: 'resolved',
    priority: 'normal',
    assignee: '鈴木 一郎',
    updatedAt: '2026-07-23T18:05:00+09:00',
  },
  {
    id: 'REDMINE-1035',
    subject: '検索結果の件数がフィルタ適用前の値を返す',
    status: 'inProgress',
    priority: 'normal',
    assignee: '高橋 みどり',
    updatedAt: '2026-07-23T14:22:00+09:00',
  },
  {
    id: 'REDMINE-1030',
    subject: 'CSV エクスポートで日本語のカラム名が文字化けする',
    status: 'closed',
    priority: 'low',
    assignee: '伊藤 健',
    updatedAt: '2026-07-22T11:58:00+09:00',
  },
  {
    id: 'REDMINE-1027',
    subject: '担当者の一括変更で通知メールが二重に飛ぶ',
    status: 'new',
    priority: 'high',
    assignee: '渡辺 さくら',
    updatedAt: '2026-07-21T16:30:00+09:00',
  },
];
