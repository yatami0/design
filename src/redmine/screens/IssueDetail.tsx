'use client';

// 題材（Redmine）— チケット詳細（閲覧 ＋ 編集・工程4 D1=B / D5=A / D8=B）
//
// 🟥 **出荷しない。**`src/index.ts` から export せず、dist にも入れない（K5）。
// ★★ 🟥 **編集の状態（react-hook-form）と検証（zod）を持つのはこの層だけ。**
//    コアの `FormLayout` / `FormField` は「ただのデータ」（文字列のエラー）しか受け取らない
//    ——ユーザー判断 2026-08-08「**UI はできるだけ純粋に保つ**」（手順書 §2 D1=B）。
//    🟦 **機械で守っている**: コア 3 層からの `react-hook-form` / `zod` import は lint が止める（D12）。
// 🟨 この画面が持つのは題材の知識だけ——どの項目を出すか、どの順で並べるか、
//    Redmine の制約（`issueSchema`）。**見た目の指定（幅・間隔・折返し）は 1 つも書かない**のが Q4 の合格条件。
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/Action/Button';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/Communication/Alert';
import { DescriptionList } from '@/components/DataDisplay/DescriptionList';
import { StatusPill } from '@/components/DataDisplay/StatusPill';
import { Timeline } from '@/components/DataDisplay/Timeline';
import { Stack } from '@/components/Layout/Stack';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Selection/Select';
import { Input } from '@/components/TextInput/Input';
import { Textarea } from '@/components/TextInput/Textarea';
import { FormField, FormLayout } from '@/patterns/FormLayout';

import { toIssueEdit, type IssueEdit } from '../convert';
import { issueEditSchema } from '../issueSchema';
import type { IssueDetail as IssueDetailModel } from '../model';
import { useIssue } from '../useIssue';
import { useIssueOptions } from '../useIssueOptions';

/** 変更履歴に出す項目名の対応表（★ 題材の知識）。API は `status_id` のような生の名で返す。 */
const FIELD_LABELS: Record<string, string> = {
  subject: '件名',
  description: '説明',
  status_id: '状態',
  priority_id: '優先度',
  assigned_to_id: '担当',
  done_ratio: '進捗',
  due_date: '期限',
  start_date: '開始日',
};

function summarize(issue: IssueDetailModel) {
  return [
    {
      key: 'status',
      term: '状態',
      description: (
        <StatusPill tone={issue.status.tone}>{issue.status.name}</StatusPill>
      ),
    },
    { key: 'priority', term: '優先度', description: issue.priority.name },
    { key: 'assignee', term: '担当', description: issue.assignee?.name ?? '—' },
    { key: 'author', term: '起票', description: issue.author.name },
    { key: 'start', term: '開始日', description: issue.startDate ?? '—' },
    { key: 'due', term: '期限', description: issue.dueDate ?? '—' },
    { key: 'done', term: '進捗', description: `${String(issue.doneRatio)}%` },
    { key: 'updated', term: '更新', description: issue.updatedAt },
  ];
}

export interface IssueDetailProps {
  id: number;
}

export function IssueDetail({ id }: IssueDetailProps) {
  const { issue, loading, error, saving, saved, saveError, save } =
    useIssue(id);
  const { statuses, priorities } = useIssueOptions();

  const form = useForm<IssueEdit>({
    resolver: zodResolver(issueEditSchema),
    // 🟨 取得より先に描画されるので、届いたら reset で入れ替える（下の effect）。
    defaultValues: {
      subject: '',
      description: '',
      statusId: 1,
      priorityId: 4,
      assigneeId: null,
      doneRatio: 0,
      notes: '',
    },
  });
  const { reset } = form;

  useEffect(() => {
    if (issue !== undefined) reset(toIssueEdit(issue));
  }, [issue, reset]);

  if (error !== undefined) {
    return (
      <Alert variant="destructive">
        <AlertTitle>読み込みに失敗した</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  // ★★ 🟥 **選択肢が揃うまで編集を出さない**（工程4 D16=A・K1-b が赤で見つけた）。
  //    課題と選択肢は別々に飛ぶので、**選択肢が空のうちに `reset` が走ると**
  //    Radix の `Select` が「一致する `SelectItem` が無い」と判断して
  //    `onValueChange("")` を発火し、**束ねた値が `Number('') = 0` に化ける。**
  //    そのまま保存すると `status_id: 0` が PUT に載り、**モックは黙って飲む**（204）。
  const optionsReady = statuses.length > 0 && priorities.length > 0;
  if (loading || issue === undefined || !optionsReady) {
    return <AlertTitle>読み込み中</AlertTitle>;
  }

  const errors = form.formState.errors;

  return (
    <Stack gap="lg">
      <DescriptionList items={summarize(issue)} columns={2} />

      <FormLayout
        // 🟨 `handleSubmit` は Promise を返す（検証が非同期）。`onSubmit` は void を期待するので
        //    `void` で明示的に捨てる——**これを書かないと `no-misused-promises` が赤**（実測）。
        onSubmit={(event) => {
          void form.handleSubmit((values) => {
            save(values);
          })(event);
        }}
        notice={
          saved === undefined ? undefined : (
            <Alert variant={saved === 'ok' ? 'default' : 'destructive'}>
              <AlertTitle>
                {saved === 'ok' ? '保存した' : '保存に失敗した'}
              </AlertTitle>
              {saveError !== undefined && (
                <AlertDescription>{saveError}</AlertDescription>
              )}
            </Alert>
          )
        }
        actions={
          <Button type="submit" disabled={saving}>
            {saving ? '保存中' : '保存'}
          </Button>
        }
      >
        <FormField
          label="件名"
          htmlFor="issue-subject"
          required
          {...(errors.subject?.message === undefined
            ? {}
            : { error: errors.subject.message })}
        >
          <Input id="issue-subject" {...form.register('subject')} />
        </FormField>

        {/* 🟨 `form.watch()` ではなく `Controller` を使う——`watch()` は
            `react-hooks/incompatible-library` が名指しで警告する（メモ化できない API）。
            **警告を消すためではなく、rhf 自身が制御コンポーネントに勧めている形**が
            たまたま警告も出さない形だった（実測は実行記録 §工程4 P4-07）。 */}
        <FormField label="状態" htmlFor="issue-status">
          <Controller
            control={form.control}
            name="statusId"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(next) => {
                  // 🟥 D16=A の 2 段目。空文字は「Radix が値を取り消した」合図なので無視する
                  //    ——束ねた値を 0 に化けさせない（K1-b）。
                  if (next === '') return;
                  field.onChange(Number(next));
                }}
              >
                <SelectTrigger id="issue-status" width="md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.id} value={String(status.id)}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField label="優先度" htmlFor="issue-priority">
          <Controller
            control={form.control}
            name="priorityId"
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(next) => {
                  // 🟥 D16=A の 2 段目。空文字は「Radix が値を取り消した」合図なので無視する
                  //    ——束ねた値を 0 に化けさせない（K1-b）。
                  if (next === '') return;
                  field.onChange(Number(next));
                }}
              >
                <SelectTrigger id="issue-priority" width="md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.id} value={String(priority.id)}>
                      {priority.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="進捗"
          htmlFor="issue-done"
          description="0〜100 の整数（%）。"
          {...(errors.doneRatio?.message === undefined
            ? {}
            : { error: errors.doneRatio.message })}
        >
          <Input
            id="issue-done"
            type="number"
            {...form.register('doneRatio', { valueAsNumber: true })}
          />
        </FormField>

        <FormField label="説明" htmlFor="issue-description">
          <Textarea id="issue-description" {...form.register('description')} />
        </FormField>

        <FormField
          label="変更コメント"
          htmlFor="issue-notes"
          description="空のままなら履歴にコメントを残さない。"
        >
          <Textarea id="issue-notes" {...form.register('notes')} />
        </FormField>
      </FormLayout>

      <Timeline
        events={issue.events.map((event) => ({
          key: String(event.id),
          title: event.user.name,
          meta: event.at,
          // 🟦 書式（小さく・muted）はコアの `Timeline` が持つ。画面は**文字列だけ**を渡す
          //    ——`className` を 1 つも書かないのが Q4 の合格条件（工程3 の 0 件を保つ）。
          details: event.changes.map(
            (change) =>
              `${FIELD_LABELS[change.field] ?? change.field}: ${change.from ?? '—'} → ${change.to ?? '—'}`,
          ),
          ...(event.notes === '' ? {} : { children: <>{event.notes}</> }),
        }))}
      />
    </Stack>
  );
}
