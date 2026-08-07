// 工程2 — インメモリ db（手順書 D3=A）。
//
// 編集（PUT）の結果をここに残す。🟥 **story を跨いで残ると干渉する**ので、
// story 側から `resetDb()` を呼べるようにしてある（P2-07 の実測で要否を決めた）。
import { createData, type MockData } from './data';

let db: MockData = createData();

export function getDb(): MockData {
  return db;
}

/** 生成は決定論的なので、reset は「同じ初期状態に戻す」ことと同義。 */
export function resetDb(): void {
  db = createData();
}
