'use client';

// 題材（Redmine）— 編集で選べる値の集合（工程4 D15=B）
//
// 🟨 ステータス・優先度は課題ごとに変わらないので 1 度だけ取る。
//    🟥 それでも**画面にベタ書きしない**——同じ表が `data.ts` と画面に 2 つできる（D15 の A 却下理由）。
import { useEffect, useState } from 'react';

import { fetchIssuePriorities, fetchIssueStatuses } from './client';
import type { IssuePriority, IssueStatus } from './model';

export interface IssueOptions {
  statuses: IssueStatus[];
  priorities: IssuePriority[];
}

export function useIssueOptions(): IssueOptions {
  const [options, setOptions] = useState<IssueOptions>({
    statuses: [],
    priorities: [],
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchIssueStatuses(), fetchIssuePriorities()]).then(
      ([statuses, priorities]) => {
        if (!cancelled) setOptions({ statuses, priorities });
      },
      () => {
        // 🟨 選択肢が取れないことは画面を止めるほどではない（保存は id を持つ）。
        //    取れなければ空のまま＝ Select が空になるので、目で見て分かる。
      },
    );
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
}
