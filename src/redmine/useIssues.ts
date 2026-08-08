'use client';

// 題材（Redmine）— 一覧の読み取り hook（工程3 D8=B）
//
// 🟥 **読み取りだけ。**編集の状態管理は工程4 Q1 の主題なのでここに入れない。
// 🟥 取得は client.ts 経由（fetch の直書きは lint が止める・D11）。
// 🟨 「取得中」は setState ではなく key の比較で**導出**している——
//    effect の先頭で setLoading(true) を書く最小形は `set-state-in-effect` を
//    1 件増やす（D8 が予測した形）。結果を key 付きで持てば effect が触る state は
//    結果 2 つだけになり、導出で同じ意味が出る。
import { useCallback, useEffect, useState } from 'react';

import { fetchIssues, type IssueQuery } from './client';
import type { Issue, Page } from './model';

/** 画面が渡す絞り込み（camelCase＝model の語）。snake_case への翻訳はこの hook が持つ。 */
export interface UseIssuesParams {
  /** `open` / `closed` / `*` / ステータス id。未指定は Redmine の既定（open）。 */
  statusId?: string | number;
  assignedToId?: number;
  projectId?: number;
  /** period.ts の `periodToQuery` が組んだ値をそのまま渡す。 */
  updatedOn?: string;
  sort?: string;
  offset?: number;
  limit?: number;
}

export interface UseIssuesResult {
  /** 現在の絞り込みに対する結果。取得中・失敗中は undefined。 */
  page: Page<Issue> | undefined;
  loading: boolean;
  error: string | undefined;
  reload: () => void;
}

interface Loaded {
  key: string;
  page: Page<Issue>;
}

interface Failed {
  key: string;
  message: string;
}

export function useIssues(params: UseIssuesParams): UseIssuesResult {
  const { statusId, assignedToId, projectId, updatedOn, sort, offset, limit } =
    params;
  const [loaded, setLoaded] = useState<Loaded | undefined>(undefined);
  const [failed, setFailed] = useState<Failed | undefined>(undefined);
  const [nonce, setNonce] = useState(0);

  const key = JSON.stringify([
    statusId,
    assignedToId,
    projectId,
    updatedOn,
    sort,
    offset,
    limit,
    nonce,
  ]);

  useEffect(() => {
    let cancelled = false;
    const query: IssueQuery = {
      ...(statusId === undefined ? {} : { status_id: statusId }),
      ...(assignedToId === undefined ? {} : { assigned_to_id: assignedToId }),
      ...(projectId === undefined ? {} : { project_id: projectId }),
      ...(updatedOn === undefined ? {} : { updated_on: updatedOn }),
      ...(sort === undefined ? {} : { sort }),
      ...(offset === undefined ? {} : { offset }),
      ...(limit === undefined ? {} : { limit }),
    };
    fetchIssues(query).then(
      (page) => {
        if (!cancelled) setLoaded({ key, page });
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
  }, [key, statusId, assignedToId, projectId, updatedOn, sort, offset, limit]);

  const reload = useCallback(() => {
    setNonce((current) => current + 1);
  }, []);

  const page = loaded?.key === key ? loaded.page : undefined;
  const error = failed?.key === key ? failed.message : undefined;
  return {
    page,
    error,
    loading: page === undefined && error === undefined,
    reload,
  };
}
