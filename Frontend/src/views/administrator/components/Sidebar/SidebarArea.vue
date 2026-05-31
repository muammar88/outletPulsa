<script setup lang="ts">
import {
  useSidebarStore,
  useSelectedTab,
  useGlobalTab,
  useGlobalActiveTab,
  useTabTerpilih,
  globalSelectMenu,
} from '@/stores/sidebar';
import { SettingStore } from '@/stores/settings';

import { ref, defineProps, watch, onMounted } from 'vue';
import { IconX } from '@tabler/icons-vue';
import * as TablerIcons from '@tabler/icons-vue';

const target = ref(null);
const sidebarStore = useSidebarStore();
const selectedTab = useSelectedTab();
const activeTab = useGlobalActiveTab();
const globaltab = useGlobalTab();
const SettingGlob = SettingStore();
const tabTerpilih = useTabTerpilih();
const sideBarPage = globalSelectMenu();
const logo = ref('default.png');

const subMenuActive = ref('');

const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

interface MenuInfo {
  menu: Record<string, any>;
  submenu: Record<string, any>;
  tab: Record<string, any>;
}

const subMenuClick = (menuname: string, name: string, path: string, tab: any) => {
  subMenuActive.value = path;
  selectedTab.clearArray();
  activeTab.clearString();
  for (const x in tab) {
    selectedTab.addItem(tab[x]);
    if (activeTab.sharedString == '') {
      activeTab.setString(globaltab.sharedObject[tab[x].id].path);
    }
  }
};

const menuClick = (name: string, path: string, tab: any) => {
  if (sideBarPage.sharedString === name) {
    sideBarPage.clearString();
  } else {
    sideBarPage.setString(name);
  }
  if (path !== '#') {
    subMenuActive.value = '';
    tabTerpilih.setNumber(0);
    selectedTab.clearArray();
    activeTab.clearString();
    for (const x in tab) {
      selectedTab.addItem(tab[x]);
      if (activeTab.sharedString == '') {
        activeTab.setString(globaltab.sharedObject[tab[x].id].path);
      }
    }
  }
};

const props = defineProps<{ menu_info: MenuInfo | null }>();
const dataRef = ref(props.menu_info);

watch(
  () => props.menu_info,
  (newVal) => {
    if (newVal) {
      dataRef.value = newVal;
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (SettingGlob.sharedObject.logo) {
    logo.value = SettingGlob.sharedObject.logo;
  }
});
</script>

<template>
  <aside
    :class="sidebarStore.isSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full w-72 lg:translate-x-0 lg:w-[84px]'"
    class="absolute left-0 top-0 z-50 flex h-screen flex-col bg-slate-950 duration-300 ease-in-out lg:relative shadow-2xl shadow-blue-900/20 whitespace-nowrap overflow-hidden"
  >
    <!-- Deep gradient background (brighter at bottom) -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-800 pointer-events-none"></div>

    <!-- Animated grid pattern -->
    <div class="absolute inset-0 opacity-10 pointer-events-none" style="
      background-image: linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.15) 1px, transparent 1px);
      background-size: 48px 48px;
    "></div>

    <!-- Glow orbs -->
    <div class="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-blue-600 rounded-full filter blur-[140px] opacity-20 orb-anim-1 pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-20 w-[22rem] h-[22rem] bg-indigo-600 rounded-full filter blur-[120px] opacity-20 orb-anim-2 pointer-events-none"></div>
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[16rem] h-[16rem] bg-cyan-500 rounded-full filter blur-[120px] opacity-10 orb-anim-3 pointer-events-none"></div>

    <!-- LOGO AREA -->
    <div class="relative z-10 flex items-center justify-between px-6 py-5 border-b border-white/5 bg-white/5 backdrop-blur-sm">
      <router-link to="/" class="flex items-center gap-3.5 w-full">
        <div class="relative w-10 h-10 rounded-xl flex-shrink-0 bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)] border border-white/10 transition-all duration-300" :class="!sidebarStore.isSidebarOpen ? 'mx-auto' : ''">
          <img src="/logo.png" alt="Logo" class="w-8 h-8 object-contain" />
          <!-- Small glow inside -->
          <div class="absolute inset-0 bg-white/20 rounded-xl rounded-b-none opacity-50 h-1/2"></div>
        </div>
        <div class="transition-opacity duration-300 overflow-hidden flex flex-col justify-center" :class="sidebarStore.isSidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'">
          <h1 class="text-[1.35rem] font-extrabold text-white tracking-tight leading-none drop-shadow-sm">Outlet Pulsa</h1>
          <p class="text-blue-400/90 text-[11px] font-semibold tracking-widest uppercase mt-1">Admin Panel</p>
        </div>
      </router-link>

      <!-- Mobile Close Button -->
      <button class="block lg:hidden text-slate-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors duration-200 flex-shrink-0" @click="sidebarStore.toggleSidebar()">
        <IconX :size="20" :stroke="2.5" />
      </button>
    </div>

    <!-- MENU AREA -->
    <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear relative z-10 flex-grow">
      <nav class="mt-6 px-4">
        <ul class="flex flex-col gap-2">
          <li v-for="(item, key, index) in menu_info?.menu" :key="key" class="animate-menu-item" :style="{ animationDelay: `${index * 0.08}s` }">
            <router-link
              :to="''"
              class="group relative flex items-center gap-3 rounded-xl py-3 px-4 text-sm font-medium duration-300 ease-in-out transition-all"
              @click="menuClick(item.name, item.path, item.tab)"
              :class="
                sideBarPage.sharedString === item.name
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/50'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              "
            >
              <div class="flex items-center justify-center w-6 flex-shrink-0 transition-transform duration-300" :class="!sidebarStore.isSidebarOpen ? 'scale-110 ml-0.5' : ''">
                <component :is="TablerIcons[item.icon] || TablerIcons.IconCircleDashed" class="w-[20px] h-[20px]" :stroke="2" />
              </div>
              <span class="flex-grow transition-opacity duration-300" :class="sidebarStore.isSidebarOpen ? 'opacity-100' : 'opacity-0'">{{ item.name }}</span>
              
              <!-- Caret Icon -->
              <svg
                v-if="item.path === '#'"
                class="fill-current transition-all duration-300 flex-shrink-0"
                :class="[
                  { 'rotate-180 text-white': sideBarPage.sharedString === item.name, 'text-slate-500': sideBarPage.sharedString !== item.name },
                  sidebarStore.isSidebarOpen ? 'opacity-100' : 'opacity-0'
                ]"
                width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
              >
                <path fill-rule="evenodd" clip-rule="evenodd" d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z" fill="" />
              </svg>
            </router-link>

            <!-- SUBMENU -->
            <div
              v-if="item.path === '#'"
              class="overflow-hidden transition-all duration-300"
              :class="sideBarPage.sharedString === item.name ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0'"
            >
              <ul class="flex flex-col gap-1.5 pl-12 pr-4 relative before:absolute before:left-7 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800 rounded">
                <li v-for="(item1, keys) in menu_info?.submenu[item.id]" :key="keys" class="relative">
                  <!-- Bullet for submenu -->
                  <div class="absolute left-[-21px] top-1/2 -translate-y-1/2 w-[6px] h-[6px] rounded-full transition-colors duration-300"
                    :class="subMenuActive == item1.path ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-slate-700'">
                  </div>

                  <router-link
                    :to="''"
                    :class="
                      subMenuActive == item1.path
                        ? 'text-white bg-slate-800/80 shadow-sm font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/40 font-medium'
                    "
                    class="block rounded-lg px-3 py-2 text-[13px] transition-all duration-200"
                    @click="subMenuClick(item.name, item1.name, item1.path, item1.tab)"
                  >
                    {{ item1.name }}
                  </router-link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>

<style scoped>
/* Orb animations */
.orb-anim-1 { animation: orb1 14s ease-in-out infinite alternate; }
.orb-anim-2 { animation: orb2 18s ease-in-out infinite alternate-reverse; }
.orb-anim-3 { animation: orb3 10s ease-in-out infinite alternate; }

@keyframes orb1 {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(80px, 60px) scale(1.2); }
}
@keyframes orb2 {
  0%   { transform: translate(0,0) scale(1); }
  100% { transform: translate(-60px,-80px) scale(1.15); }
}
@keyframes orb3 {
  0%   { transform: translate(-50%,-50%) scale(1); }
  100% { transform: translate(-50%,-50%) scale(1.4); }
}

/* Menu entry animations */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
}
.animate-menu-item {
  animation: slideInLeft 0.5s ease-out forwards;
  opacity: 0;
}
</style>
