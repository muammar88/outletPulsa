import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Menu } from '@/service/menu';

export const useMenuStore = defineStore('menu', () => {
  // State
  const menus = ref<Menu[]>([]);

  // Getters
  const hasMenus = computed(() => menus.value.length > 0);
  const firstMenu = computed(() => menus.value[0] ?? null);

  // Actions
  function setMenus(data: Menu[]) {
    menus.value = data;
  }

  function resetMenus() {
    menus.value = [];
  }

  return {
    // State
    menus,
    // Getters
    hasMenus,
    firstMenu,
    // Actions
    setMenus,
    resetMenus,
  };
});
