<script setup lang="ts">
import Header from '@/views/administrator/components/Header/HeaderArea.vue';
import Sidebar from '@/views/administrator/components/Sidebar/SidebarArea.vue';
import Content from '@/views/administrator/components/Content/ContentViews.vue';
import LoadOverlay from '@/components/Loading/LoadOverlay.vue';
import api from '@/service/api_administrator'; // Impor file API
import { ref, onMounted } from 'vue';

// useGlobalTab
import { useGlobalTab, useSelectedTab, globalSelectMenu } from '@/stores/sidebar.js';
import { SettingStore } from '@/stores/settings.js';

// State error dan loading
const isError = ref(false);
const isLoading = ref(true);

const globalTab = useGlobalTab(); // menampung seluruh tab secara global
const SettingGlob = SettingStore();
const selectedTab = useSelectedTab();
const selectMenu = globalSelectMenu();

interface MenuItem {
  id: number;
  name: string;
  path: string;
  icon: string;
  tab: null | any;
}

interface MenuInfo {
  menu: Record<string, MenuItem>;
  submenu: Record<string, any>;
  tab: Record<string, any>;
  default_tab: Record<string, any>;
}

interface UserInfo {
  company_code: string;
  username: string;
  type: string;
}

interface ServerResponse {
  error: boolean;
  error_msg: string;
  menu_info: MenuInfo;
  user_info: UserInfo;
}

const menu_info = ref<MenuInfo | null>(null);
const user_info = ref<UserInfo | null>(null);

// Mengambil data dari API
const fetchData = async () => {
  try {
    const response = await api.get<ServerResponse>('/administrator'); // Panggil API dan gunakan tipe yang benar
    if (response.status === 404) {
      isError.value = true;
    } else {
      // Menyimpan data ke dalam state
      menu_info.value = response.data.data.menu_info;
      user_info.value = response.data.data.user_info;

      globalTab.clearObject();
      for (const x in response.data.data.menu_info.tab) {
        globalTab.addItem(x, response.data.data.menu_info.tab[x]);
      }

      SettingGlob.clearObject();
      for (const x in response.data.user_info) {
        SettingGlob.addItem(x, response.data.user_info[x]);
      }

      const menu = response.data.data.menu_info.menu;
      const menuPertama = Object.values(menu)[0];

      selectMenu.setString(menuPertama.name);

      selectedTab.clearArray();
      if (menuPertama.path == '#') {
      } else {
        if (menuPertama.tab !== null) {
          for (const x in menuPertama.tab) {
            selectedTab.addItem(menuPertama.tab[x]);
          }
        }
      }
      isError.value = false; // Reset error state jika berhasil
    }
    isLoading.value = false;
    isLoading.value = false;
  } catch (error) {
    console.error('Gagal mengambil data, menggunakan dummy data untuk preview:', error);
    
    // ==========================================
    // DUMMY DATA UNTUK CONTOH MENU & SUBMENU
    // ==========================================
    const dummyMenuInfo: MenuInfo = {
      menu: {
        "1": { id: 1, name: "Dashboard Utama", path: "/dashboard", icon: "IconHome", tab: null },
        "2": { id: 2, name: "Transaksi PPOB", path: "#", icon: "IconReceipt", tab: null },
        "3": { id: 3, name: "Manajemen Master", path: "#", icon: "IconDatabase", tab: null },
        "4": { id: 4, name: "Pengaturan Sistem", path: "/settings", icon: "IconSettings", tab: null }
      },
      submenu: {
        "2": [ // Submenu untuk Transaksi PPOB (id: 2)
          { id: 21, name: "Riwayat Transaksi", path: "/transaksi/riwayat", tab: null },
          { id: 22, name: "Transaksi Tertunda", path: "/transaksi/pending", tab: null },
          { id: 23, name: "Laporan Laba Rugi", path: "/transaksi/laporan", tab: null }
        ],
        "3": [ // Submenu untuk Manajemen Master (id: 3)
          { id: 31, name: "Daftar Produk", path: "/master/produk", tab: null },
          { id: 32, name: "Manajemen User", path: "/master/user", tab: null },
          { id: 33, name: "Daftar Bank", path: "/master/bank", tab: null }
        ]
      },
      tab: {},
      default_tab: {}
    };

    menu_info.value = dummyMenuInfo;
    
    const menu = dummyMenuInfo.menu;
    const menuPertama = Object.values(menu)[0];
    selectMenu.setString(menuPertama.name);
    
    isError.value = false;
    isLoading.value = false;
  }
};

onMounted(() => {
  // Langsung fetch data (akan jatuh ke catch dan meload dummy jika API mati)
  fetchData();
});
</script>
<template>
  <LoadOverlay />
  <div class="font-poppins bg-slate-50 text-slate-800">
    <div class="flex h-screen overflow-hidden">
      <Sidebar :menu_info="menu_info" />
      <div class="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header class="z-40 bg-white border-b border-slate-200/60 shadow-sm" />
        <main class="flex-grow">
          <div class="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <Content class="z-10"></Content>
          </div>
        </main>
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
