<script setup lang="ts">
// import { useHead } from '@vueuse/head';
import { useSidebarStore } from '@/stores/sidebar';
import { SettingStore } from '@/stores/settings';
import DropdownUser from './DropdownUser.vue';
import { ref, watchEffect } from 'vue';
import { IconMenu2, IconIndentDecrease, IconBell } from '@/components/Icons';

const { toggleSidebar } = useSidebarStore();
const sidebarStore = useSidebarStore();
const SettingGlob = SettingStore();

import { useHead } from '@vueuse/head';

// useHead({
//   title: 'AMRA :: Aplikasi Manajemen Travel Haji dan Umrah',
//   link: [ { rel: 'icon', type: 'image/png', href: 'public/favicon.png' } ],
//   meta: [ { name: 'AMRA', content: 'Aplikasi manajemen travel Haji dan Umrah' } ]
// });
</script>

<template>
  <header
    class="sticky top-0 z-998 flex w-full drop-shadow-sm"
  >
    <div
      class="flex flex-grow items-center justify-between py-4 pl-4 pr-4 md:pr-6 2xl:pr-11 shadow-sm bg-transparent"
    >
      <div class="flex items-center gap-2 sm:gap-4">
        <button
          class="z-50 block rounded-lg border border-slate-200 bg-slate-50 p-2 shadow-sm hover:bg-slate-100 transition-colors"
          @click="
            () => {
              sidebarStore.toggleSidebar();
            }
          "
        >
          <div class="w-5 h-5 text-slate-600 flex items-center justify-center transition-transform duration-300">
            <IconIndentDecrease v-if="sidebarStore.isSidebarOpen" class="w-5 h-5" :stroke-width="2" />
            <IconMenu2 v-else class="w-5 h-5" :stroke-width="2" />
          </div>
        </button>
      </div>
      <div class="hidden sm:block ml-4 mr-auto">
        <span class="hidden text-left lg:block">
          <span class="block text-sm font-bold text-slate-800"
            >APLIKASI OUTLET PULSA</span
          >
          <span class="block text-xs font-medium text-slate-500 mt-0.5"
            >Manajemen Produk & Transaksi PPOB</span
          >
        </span>
      </div>
      <div class="flex items-center gap-4 sm:gap-6">
        <!-- Notification Button -->
        <button class="relative flex items-center justify-center p-2 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
          <IconBell :size="22" :stroke-width="2" />
          <span class="absolute top-1 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
        </button>

        <DropdownUser />
      </div>
    </div>
  </header>
</template>
