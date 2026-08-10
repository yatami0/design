'use client';

// 題材（Redmine）— 稼働の読み取り hook（工程5 D3=B）
//
// 🟥 **読み取りだけ。**稼働表は閲覧（手順書 §0）。
// 🟥 取得は client.ts 経由（`fetch` の直書きは lint が止める・工程3 D11）。
// 🟨 「取得中」は setState ではなく key の比較で導出する（`useIssues` と同じ形）。
//
// ★★ 🟥 **一覧と違って「1 ページだけ取る」が成立しない。**
//    一覧はページャがあるので 1 ページで正しい。**ピボットの合計は全件を畳まないと嘘になる**——
//    `total_count` が返却件数より多いまま総和を出すと、**表には数字が出るのに合計だけが小さい。**
//    見た目では気づけない（手順書 K1 の警戒そのもの）。→ **全ページ取る。**
// 🟨 上限は `MAX_LIMIT` = 100（`src/mocks/handlers.ts`）。実 Redmine の既定も 100。
import { useCallback, useEffect, useState } from 'react';

import { fetchTimeEntries, type TimeEntryQuery } from './client';
import type { TimeEntry } from './model';

/** 実 Redmine の `limit` 上限。これ以上を要求しても切り詰められる。 */
const PAGE_LIMIT = 100;

/** 暴走止め。100 件 × 50 = 5,000 件を超えたら**黙って打ち切らずに失敗させる**。 */
const MAX_PAGES = 50;

export interface UseWorkloadParams {
  /** `YYYY-MM-DD`。period.ts の `periodToSpentOnParams` が組んだ値をそのまま渡す。 */
  from?: string;
  to?: string;
  projectId?: number;
  /** 🟥 範囲が決まっていないとき（`all`）は取りに行かない。 */
  enabled: boolean;
}

export interface UseWorkloadResult {
  entries: TimeEntry[] | undefined;
  /** API が申告した総件数。🟥 **`entries.length` と一致しなければ取りこぼしている。** */
  totalCount: number | undefined;
  /** 何ページ取ったか（K1 の証拠。1 なら 1 回で収まった）。 */
  pageCount: number | undefined;
  loading: boolean;
  error: string | undefined;
  reload: () => void;
}

interface Loaded {
  key: string;
  entries: TimeEntry[];
  totalCount: number;
  pageCount: number;
}

interface Failed {
  key: string;
  message: string;
}

/** 全ページ取る。🟥 **申告された総件数に届かなければ throw**（黙って足りない表を出さない）。 */
async function fetchAll(
  query: TimeEntryQuery,
): Promise<{ entries: TimeEntry[]; totalCount: number; pageCount: number }> {
  const entries: TimeEntry[] = [];
  let offset = 0;
  let totalCount = 0;
  let pageCount = 0;

  for (;;) {
    const page = await fetchTimeEntries({
      ...query,
      offset,
      limit: PAGE_LIMIT,
    });
    pageCount += 1;
    totalCount = page.totalCount;
    entries.push(...page.items);
    offset += page.limit;
    if (entries.length >= totalCount || page.items.length === 0) break;
    if (pageCount >= MAX_PAGES) {
      throw new Error(
        `time_entries が ${String(MAX_PAGES)} ページを超えた（total_count=${String(totalCount)}）`,
      );
    }
  }

  if (entries.length !== totalCount) {
    throw new Error(
      `time_entries を取りこぼした: ${String(entries.length)} / ${String(totalCount)}`,
    );
  }
  return { entries, totalCount, pageCount };
}

export function useWorkload(params: UseWorkloadParams): UseWorkloadResult {
  const { from, to, projectId, enabled } = params;
  const [loaded, setLoaded] = useState<Loaded | undefined>(undefined);
  const [failed, setFailed] = useState<Failed | undefined>(undefined);
  const [nonce, setNonce] = useState(0);

  const key = JSON.stringify([from, to, projectId, enabled, nonce]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const query: TimeEntryQuery = {
      ...(from === undefined ? {} : { from }),
      ...(to === undefined ? {} : { to }),
      ...(projectId === undefined ? {} : { project_id: projectId }),
    };
    fetchAll(query).then(
      (result) => {
        if (!cancelled) setLoaded({ key, ...result });
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
  }, [key, from, to, projectId, enabled]);

  const reload = useCallback(() => {
    setNonce((current) => current + 1);
  }, []);

  const hit = loaded?.key === key ? loaded : undefined;
  const error = failed?.key === key ? failed.message : undefined;
  return {
    entries: hit?.entries,
    totalCount: hit?.totalCount,
    pageCount: hit?.pageCount,
    error,
    loading: enabled && hit === undefined && error === undefined,
    reload,
  };
}
