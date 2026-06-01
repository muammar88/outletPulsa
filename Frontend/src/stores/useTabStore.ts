import { defineStore } from 'pinia';
import type { Tab } from '@/types/tab';

export const useTabStore = defineStore('tabs', {
  state: () => ({ tabs: [] as Tab[], activeTabPath: '' as string }),
  actions: {
    addTab(value: Tab[]) {
      this.tabs = value || [];
      this.activeTabPath = this.tabs.length > 0 ? (this.tabs[0].path ?? '') : '';
    },
    clearTab() {
      this.tabs = [];
      this.activeTabPath = '';
    },
    setActiveTab(tabPath: string) {
      this.activeTabPath = tabPath;
    },
  },
  getters: {
    getTab: (state) => state.tabs,
  },
});
