<script setup lang="ts">
import Header from '@/views/administrator/components/Header/HeaderArea.vue';
import Sidebar from '@/views/administrator/components/Sidebar/SidebarArea.vue';
import Content from '@/views/administrator/components/Content/ContentViews.vue';
import LoadOverlay from '@/components/Loading/LoadOverlay.vue';
import { onMounted, ref } from 'vue';

import { useGlobalTab, useSelectedTab, globalSelectMenu } from '@/stores/sidebar.js';
import { fetchMenuData } from '@/service/menu';
import type { Menu } from '@/service/menu';

const globalTab = useGlobalTab();
const selectedTab = useSelectedTab();
const selectMenu = globalSelectMenu();

const navigation = ref<Menu[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const initializeFirstMenu = () => {
  const first = navigation.value[0];
  if (!first) return;

  selectMenu.setString(first.name);
  selectedTab.clearArray();

  if (first.path !== '#' && first.submenus?.length) {
    const firstSub = first.submenus[0];
    if (firstSub?.tab?.length) {
      for (const tab of firstSub.tab) {
        selectedTab.addItem(tab);
        globalTab.addItem(String(tab.id), tab);
      }
    }
  }
};

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    const response = await fetchMenuData();

    console.log("xxx");
    console.log(response);
    console.log("xxx");
    navigation.value = response;
    initializeFirstMenu();
  } catch (err: any) {
    error.value = err?.response?.data?.message ?? err?.message ?? 'Gagal mengambil data menu';
    // Jika ingin seperti Selanga yang langsung redirect ke login saat error:
    window.location.href = '/login-backbone';
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <LoadOverlay />
  <div class="font-poppins bg-slate-50 text-slate-800">

    <!-- Loading overlay saat fetch menu -->
    <div
      v-if="isLoading"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-5">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
          <div class="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin"></div>
          <div class="absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin" style="animation-duration: 0.75s; animation-direction: reverse;"></div>
        </div>
        <div class="text-center">
          <p class="text-white font-semibold text-lg">Memuat Menu...</p>
          <p class="text-slate-400 text-sm mt-1">Mengambil data navigasi dari server</p>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950/95 backdrop-blur-sm"
    >
      <div class="flex flex-col items-center gap-4 max-w-sm text-center px-6">
        <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg class="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p class="text-white font-semibold text-lg">Gagal Memuat Menu</p>
        <p class="text-slate-400 text-sm">{{ error }}</p>
        <button
          @click="fetchData()"
          class="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors duration-200"
        >
          Coba Lagi
        </button>
      </div>
    </div>
    <!-- Main layout -->
    <div v-else class="flex h-screen overflow-hidden">
      <Sidebar :navigation="navigation" />
      <div class="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out">
        <Header class="z-40 bg-white border-b border-slate-200/60 shadow-sm" />
        <Content :navigation="navigation" />
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
.font-poppins {
  font-family: 'Poppins', sans-serif;
}
</style>
