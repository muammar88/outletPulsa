<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import LightButton from '@/components/Button/LightButton.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';

import { formatRupiah } from '@/libs/formatRupiah';

// Service API
import { list, deletes } from '@/service/member';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// State: Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Composable: pagination
const itemsPerPage = ref<number>(100);
const totalColumns = ref<number>(6);

const isModalAddOpen = ref(false);
const isModalEditOpen = ref(false);

const search = ref('');

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Composable: notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Composable: confirmation
const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

interface Member {
  id: number;
  kode: string;
  fullname: string;
  whatsapp_number: string;
  saldo: string;
}

const datas = ref<Member[]>([]);

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await list({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
    });
    datas.value = response.data;
    totalRow.value = response.total;
  } catch (error) {
    displayNotification('Gagal mengambil data bank', 'error');
  } finally {
    isTableLoading.value = false;
  }
}

// Function: Delete Data
async function del(id: number) {
  displayConfirmation(
    'Hapus Data Member',
    'Apakah Anda yakin ingin menghapus data member ini?',
    async () => {
      try {
        isLoading.value = true;
        await deletes({ id: id });
        displayNotification('Data member berhasil dihapus', 'success');
        await fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus data member', 'error');
      } finally {
        isLoading.value = false;
      }
    },
  );
}

onMounted(async () => {
  await fetchData();
});
</script>
<template>
  <div class="mx-auto p-4">
    <!-- Header -->
    <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
    <div v-else class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <BaseButton
          @click="openModalAdd()"
          variant="primary"
          :loading="isModalAddOpen || isModalEditOpen"
          type="button"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" /> Tambah Member
        </BaseButton>

        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Cari</label>
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari member..."
            class="w-full sm:w-64 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 shadow-md">
        <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" />
        <table v-else class="w-full border-collapse bg-white text-sm">
          <thead class="bg-gray-50 text-gray-700 text-center border-b border-gray-300">
            <tr>
              <th
                class="w-[10%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Kode
              </th>
              <th
                class="w-[25%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Nama Lengkap
              </th>
              <th
                class="w-[25%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Nomor Whatsapp
              </th>
              <th
                class="w-[15%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Saldo
              </th>
              <th
                class="w-[10%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Status Agen
              </th>
              <th
                class="w-[10%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-if="datas.length > 0">
              <tr v-for="data in datas" :key="data.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-center align-middle">{{ data.kode }}</td>
                <td class="px-6 py-4 text-center align-middle">{{ data.fullname }}</td>
                <td class="px-6 py-4 text-center align-middle">{{ data.whatsapp_number }}</td>
                <td class="px-6 py-4 text-center align-middle">{{ formatRupiah(data.saldo) }}</td>
                <td class="px-6 py-4 text-center align-middle">-</td>
                <td class="px-6 py-4 text-center align-middle">
                  <div class="flex justify-center gap-2">
                    <LightButton @click="openModalEdit(bank)"><EditIcon /></LightButton>
                    <DangerButton @click="del(data.id)"><DeleteIcon /></DangerButton>
                  </div>
                </td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                  Daftar member tidak ditemukan
                </td>
              </tr>
            </template>
          </tbody>
          <tfoot>
            <Pagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :pages="pages"
              :total-columns="totalColumns"
              :total-row="totalRow"
              @prev-page="prevPage"
              @next-page="nextPage"
              @page-now="pageNow"
            />
          </tfoot>
        </table>
      </div>
    </div>
    <!-- Confirmation -->
    <Confirmation
      :showConfirmDialog="showConfirmDialog"
      :confirmTitle="confirmTitle"
      :confirmMessage="confirmMessage"
    >
      <BaseButton variant="secondary" @click="cancel">Tidak</BaseButton>
      <BaseButton variant="warning" @click="confirm">Ya</BaseButton>
    </Confirmation>
    <!-- Notification -->
    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
