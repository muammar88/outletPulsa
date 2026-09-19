<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';
import { onMounted, ref } from 'vue';

import BaseTable from '@/components/Table/BaseTable.vue';
import Notification from '@/components/Modal/Notification.vue';

import { bankLinkquService } from './services/bankLinkquService';
import type { BankLinkqu } from './types/bankLinkqu';

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const tableColumns = [
  {
    key: 'image',
    label: 'Logo',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
  {
    key: 'kode',
    label: 'Kode Bank',
    headerClass: 'text-left w-[20%] pl-4',
    cellClass: 'text-left pl-4 font-mono font-bold tracking-wide text-slate-700',
  },
  {
    key: 'name',
    label: 'Nama Bank',
    headerClass: 'text-left w-[35%]',
    cellClass: 'text-left font-bold text-gray-800',
  },
  {
    key: 'status',
    label: 'Status',
    headerClass: 'text-center w-[15%]',
    cellClass: 'text-center',
  },
];

const dataBank = ref<BankLinkqu[]>([]);
const isLoading = ref(false);
const syncing = ref(false);

const fetchData = async () => {
  isLoading.value = true;
  try {
    const response = await bankLinkquService.getAll();
    dataBank.value = response.data.data;
  } catch (error) {
    console.error('Gagal mengambil data Bank LinkQu:', error);
    displayNotification('Gagal mengambil data', 'error');
  } finally {
    isLoading.value = false;
  }
};

const syncData = async () => {
  try {
    syncing.value = true;
    const response = await bankLinkquService.sync();
    
    const result = response.data.data;
    
    displayNotification(`Sinkronisasi Berhasil. Total Data: ${result.total}, Baru: ${result.added}, Diperbarui: ${result.updated}`, 'success');
    await fetchData();
  } catch (error: any) {
    displayNotification(error.response?.data?.message || 'Gagal melakukan sinkronisasi', 'error');
  } finally {
    syncing.value = false;
  }
};

const toggleStatus = async (row: BankLinkqu) => {
  try {
    const newStatus = !row.status;
    await bankLinkquService.updateStatus(row.id!, newStatus);
    row.status = newStatus;
    displayNotification('Status berhasil diperbarui', 'success');
  } catch (error: any) {
    displayNotification(error.response?.data?.message || 'Gagal memperbarui status', 'error');
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="px-8 py-6">
      <div class="mb-10 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-[#0f2155] dark:text-white mb-2 uppercase tracking-tight font-semibold">
            Bank LinkQu
          </h1>
          <p class="text-xs text-gray-400 font-medium uppercase tracking-[0.2em]">
            Kelola daftar bank yang tersinkronisasi dari Payment Gateway LinkQu
          </p>
        </div>
      </div>

      <BaseTable
        :columns="tableColumns"
        :data="dataBank"
        :loading="isLoading"
        search-placeholder="Cari bank..."
        :add-disabled="syncing"
        :add-label="syncing ? 'Menyinkronkan...' : 'Sinkronkan Bank'"
        @add="syncData"
        :showNumbering="true"
        :showActions="false"
      >
        <template #cell-image="{ row }">
          <div class="flex items-center justify-center">
            <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden text-gray-400">
              <img v-if="row.image" :src="row.image" :alt="row.name" class="w-full h-full object-contain p-1" @error="row.image = null" />
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-building-bank w-5 h-5" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <path d="M3 21l18 0" />
                <path d="M3 10l18 0" />
                <path d="M5 6l7 -3l7 3" />
                <path d="M4 10l0 11" />
                <path d="M20 10l0 11" />
                <path d="M8 14l0 3" />
                <path d="M12 14l0 3" />
                <path d="M16 14l0 3" />
              </svg>
            </div>
          </div>
        </template>

        <template #cell-kode="{ row }">
          <span class="font-mono text-gray-900 font-semibold">{{ row.kode }}</span>
        </template>

        <template #cell-name="{ row }">
          <span class="font-bold text-gray-800">{{ row.name }}</span>
        </template>

        <template #cell-status="{ row }">
          <label class="flex items-center justify-center cursor-pointer">
            <div class="relative" @click.prevent="toggleStatus(row)">
              <input type="checkbox" :checked="row.status" class="sr-only" />
              <div class="block bg-gray-200 w-10 h-6 rounded-full transition" :class="{ 'bg-green-500': row.status }"></div>
              <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform" :class="{ 'translate-x-4': row.status }"></div>
            </div>
          </label>
        </template>
      </BaseTable>
    </div>

    <!-- Notification Modal -->
    <Notification
      :show-notification="showNotification"
      :notification-type="notificationType"
      :notification-message-html="notificationMessage"
      @close="hideNotification"
    />
  </div>
</template>
