'use client';

// 題材（Redmine）— 単票の読み取り ＋ 保存（工程4 D8/D2=B）
//
// 🟥 **楽観更新はしない**（D2=B）。保存したら**取り直す**——
//    「保存された絵」ではなく「取り直しても変わっている」ことが保存の証拠になる（K3）。
// 🟥 取得は client.ts 経由（`fetch` 直書きは lint が止める）。
// 🟨 `useIssues`（一覧）と同じく、**取得中は key の比較で導出**する
//    （effect の中で `setLoading(true)` を書かない＝ `set-state-in-effect` を増やさない）。
import { useCallback, useEffect, useState } from 'react';

import { fetchIssue, updateIssue } from './client';
import { toIssuePatch, type IssueEdit } from './convert';
import type { IssueDetail } from './model';

export interface UseIssueResult {
  /** 現在の課題。取得中・失敗中は undefined。 */
  issue: IssueDetail | undefined;
  loading: boolean;
  error: string | undefined;
  /** 保存中か。ボタンを塞ぐのは画面の責務。 */
  saving: boolean;
  /** 直近の保存の結果。`undefined` = まだ保存していない。 */
  saved: 'ok' | 'failed' | undefined;
  /** 保存に失敗したときの理由。 */
  saveError: string | undefined;
  /**
   * ★ 保存。**変わった項目だけ**を送る（`toIssuePatch`）。
   * 変更が 0 件なら**リクエストを飛ばさない**——空の PUT は履歴を汚すだけ。
   */
  save: (next: IssueEdit) => void;
}

interface Loaded {
  key: string;
  issue: IssueDetail;
}

interface Failed {
  key: string;
  message: string;
}

export function useIssue(id: number | undefined): UseIssueResult {
  const [loaded, setLoaded] = useState<Loaded | undefined>(undefined);
  const [failed, setFailed] = useState<Failed | undefined>(undefined);
  const [nonce, setNonce] = useState(0);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<'ok' | 'failed' | undefined>(undefined);
  const [saveError, setSaveError] = useState<string | undefined>(undefined);

  const key = JSON.stringify([id, nonce]);

  useEffect(() => {
    if (id === undefined) return;
    let cancelled = false;
    fetchIssue(id).then(
      (issue) => {
        if (!cancelled) setLoaded({ key, issue });
      },
      (cause: unknown) => {
        if (!cancelled) {
          setFailed({
            key,
            message: cause instanceof Error ? cause.message : String(cause),
          });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, id]);

  const issue = loaded?.key === key ? loaded.issue : undefined;
  const error = failed?.key === key ? failed.message : undefined;

  const save = useCallback(
    (next: IssueEdit) => {
      if (id === undefined || issue === undefined) return;
      const patch = toIssuePatch(issue, next);
      if (Object.keys(patch).length === 0) {
        setSaved('ok');
        setSaveError(undefined);
        return;
      }
      setSaving(true);
      setSaveError(undefined);
      updateIssue(id, patch).then(
        () => {
          setSaving(false);
          setSaved('ok');
          // 🟥 取り直す（楽観更新をしない選択の帰結・K3 の証拠）
          setNonce((current) => current + 1);
        },
        (cause: unknown) => {
          setSaving(false);
          setSaved('failed');
          setSaveError(cause instanceof Error ? cause.message : String(cause));
        },
      );
    },
    [id, issue],
  );

  return {
    issue,
    error,
    loading: id !== undefined && issue === undefined && error === undefined,
    saving,
    saved,
    saveError,
    save,
  };
}
