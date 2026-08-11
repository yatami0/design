// 持ち出し版 Storybook 設定。
// 元 repo との差分: msw（Redmine モック）関連の staticDirs と addon-vitest を外した。
// a11y / docs の 2 addon だけで dev・build とも動く。
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/stories/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-a11y', '@storybook/addon-docs'],
  framework: '@storybook/react-vite',
};

export default config;
