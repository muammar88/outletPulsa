<script setup lang="ts">
import * as Icons from '@tabler/icons-vue';
import type { Navigation } from '@/types/navigation';
import { computed, ref, watch } from 'vue';
import { useTabStore } from '@/stores/useTabStore';
import { tabComponents } from './TabComponents';

const props = defineProps<{
  navigation: Navigation[];
}>();

const tabStore = useTabStore();

const getIcon = (iconName: string) => {
  if (!iconName) return null;
  const pascalName =
    'Icon' +
    iconName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  return (Icons as any)[pascalName] || Icons.IconQuestionMark;
};

const setActiveTab = (tabPath: string) => {
  tabStore.setActiveTab(tabPath);
};

const breadcrumb = computed(() => {
  const path = tabStore.activeTabPath;
  for (const menu of props.navigation || []) {
    const menuTab = menu.tab?.find((t: any) => t.path === path);
    if (menuTab) {
      return [menu.name];
    }
    for (const sub of menu.submenus ?? []) {
      const tab = sub.tab?.find((t: any) => t.path === path);
      if (tab) {
        return [menu.name, sub.name];
      }
    }
  }

  return [];
});

const prevBreadcrumb = ref<string[]>([]);
const changedIndex = ref(-1);

watch(
  breadcrumb,
  (newVal) => {
    changedIndex.value = -1;

    const max = Math.max(prevBreadcrumb.value.length, newVal.length);

    for (let i = 0; i < max; i++) {
      if (prevBreadcrumb.value[i] !== newVal[i]) {
        changedIndex.value = i;
        break;
      }
    }

    prevBreadcrumb.value = [...newVal];
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex-1 flex flex-col min-h-0 bg-[#F9FAFB] dark:bg-gray-950">
    <div
      class="flex bg-gray-200 justify-start gap-2 px-6 py-2 text-xs text-gray-500 dark:bg-gray-900 dark:border-gray-800"
    >
      <template v-for="(item, index) in breadcrumb" :key="`${index}-${item}`">
        <span
          :class="[
            index === breadcrumb.length - 1 ? 'text-gray-900 dark:text-white font-semibold' : '',
            index >= changedIndex && changedIndex !== -1 ? 'animate-fade-in' : '',
          ]"
        >
          {{ item }}
        </span>

        <span
          v-if="index < breadcrumb.length - 1"
          class="text-gray-400"
          :class="index >= changedIndex ? 'animate-fade-in' : ''"
        >
          /
        </span>
      </template>
    </div>
    <!-- Main Tab Bar -->
    <div
      class="flex items-center bg-gray-50 gap-1 dark:bg-gray-900 dark:border-gray-800 px-4 pt-2 overflow-x-auto no-scrollbar scroll-smooth shadow-sm z-10"
    >
      <!-- Breadcrumb -->
      <div
        v-for="tab in tabStore.getTab"
        :key="tab.id"
        @click="setActiveTab(tab.path)"
        class="group relative flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium font-black uppercase tracking-wider rounded-t-xl transition-all duration-300 cursor-pointer border-x border-t -mb-[1px]"
        :class="
          tabStore.activeTabPath === tab.path
            ? 'bg-outlet dark:bg-gray-950 border-gray-100 dark:border-gray-800 text-white shadow-[0_-4px_10px_rgba(37,99,235,0.05)]'
            : 'bg-white dark:bg-gray-800 border-transparent text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        "
      >
        <component :is="getIcon(tab.icon)" v-if="tab.icon" size="14" />
        <span class="hidden sm:inline whitespace-nowrap">{{ tab.name }}</span>
        <!-- Active Indicator -->
        <div
          v-if="tabStore.activeTabPath === tab.path"
          class="absolute bottom-0 left-3 right-3 h-0.5 bg-gray-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
        ></div>
      </div>
    </div>
    <!-- Content Area -->
    <div class="flex-1 overflow-y-auto relative no-scrollbar bg-white">
      <transition name="fade" mode="out-in">
        <component :is="tabComponents[tabStore.activeTabPath] ?? tabComponents['notFound']" />
      </transition>
    </div>
  </div>
</template>
<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-fade-in-left {
  animation: fadeInLeft 0.5s ease-out;
}

@keyframes fadeUpIn {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-up-in {
  animation: fadeUpIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease;
}
</style>
