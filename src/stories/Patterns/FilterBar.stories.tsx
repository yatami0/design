import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/Selection/Select';
import { Input } from '@/components/TextInput/Input';
import { FilterBar, FilterField } from '@/patterns/FilterBar';

// 工程3 D2=C — 帯（並び・間隔・折返し・ラベルの付き方）はコア、中身は画面が差す。
// ★ Q1 の検体: 中身が違う 2 例で「帯の見た目が同じ」ことを見る。
const meta = {
  title: '③ Patterns/FilterBar',
  component: FilterBar,
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 例 1: ステータスで絞る帯（チケット一覧の形）。 */
export const StatusFilter: Story = {
  args: { children: null },
  render: () => (
    <FilterBar>
      <FilterField label="ステータス">
        <Select defaultValue="open">
          <SelectTrigger width="md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">未完了</SelectItem>
            <SelectItem value="closed">完了</SelectItem>
            <SelectItem value="all">すべて</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>
      <FilterField label="キーワード">
        <Input placeholder="件名で探す" />
      </FilterField>
    </FilterBar>
  ),
};

/** 例 2: 担当者で絞る帯（中身が違っても帯の見た目は同じはず）。 */
export const AssigneeFilter: Story = {
  args: { children: null },
  render: () => (
    <FilterBar>
      <FilterField label="担当者">
        <Select defaultValue="all">
          <SelectTrigger width="md">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全員</SelectItem>
            <SelectItem value="1">佐藤</SelectItem>
            <SelectItem value="2">田中</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>
      <FilterField label="プロジェクト">
        <Select defaultValue="all">
          <SelectTrigger width="lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="1">基幹システム刷新</SelectItem>
          </SelectContent>
        </Select>
      </FilterField>
    </FilterBar>
  ),
};
