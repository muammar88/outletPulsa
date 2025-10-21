<script setup lang="ts">
// Library
import { ref, onMounted } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import ButtonGreen from '@/components/Button/ButtonGreen.vue';
import LightButton from '@/components/Button/LightButton.vue';
import YellowButton from '@/components/Button/YellowButton.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service API
import { get_riwayat_donasi, delete_riwayat_donasi, update_status } from '@/service/riwayat_donasi';

// State
const isLoading = ref(false);
const isTableLoading = ref(false);

// Pagination
const itemsPerPage = ref<number>(100);
const totalColumns = ref<number>(6);
const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Notification & Confirmation
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();
const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// Interfaces
interface Member {
  id: number;
  username: string;
  nomor_ktp: string;
  whatsapp_number: string;
  alamat: string;
}

interface ProgramDonasi {
  id: number;
  name: string;
  tahun: number;
  status: string;
  deskripsi: string;
}

interface RiwayatDonasi {
  id: number;
  nominal: number;
  status: string;
  status_konfirmasi: string;
  createdAt: string;
  updatedAt: string;
  Member?: Member;
  Program_donasi?: ProgramDonasi;
}

const RiwayatDonasi = ref<RiwayatDonasi[]>([]);

// Search & Filters
const search = ref('');
const status = ref('');
const status_konfirmasi = ref('');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await get_riwayat_donasi({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
      status: status.value,
      konfirmasi_pembayaran: status_konfirmasi.value,
    });
    RiwayatDonasi.value = response.data;
    totalRow.value = response.total;
  } catch (error) {
    displayNotification('Gagal mengambil data riwayat donasi', 'error');
  } finally {
    isTableLoading.value = false;
  }
}

onMounted(fetchData);

async function deleteData(id: number) {
  displayConfirmation(
    'Hapus Data Riwayat Donasi',
    'Apakah Anda yakin ingin menghapus data riwayat donasi ini?',
    async () => {
      try {
        isLoading.value = true;
        await delete_riwayat_donasi(id);
        displayNotification('Data riwayat donasi berhasil dihapus', 'success');
        await fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus data riwayat donasi', 'error');
      } finally {
        isLoading.value = false;
      }
    },
  );
}

async function updatestatus(id: number, newStatus: string) {
  const title = newStatus === 'success' ? 'Approve Donasi' : 'Reject Donasi';
  const message =
    newStatus === 'success'
      ? 'Apakah Anda yakin ingin menyetujui donasi ini?'
      : 'Apakah Anda yakin ingin menolak donasi ini?';

  displayConfirmation(title, message, async () => {
    try {
      isLoading.value = true;
      await update_status(id, newStatus);

      const notifMsg =
        newStatus === 'success' ? 'Donasi berhasil disetujui' : 'Donasi berhasil ditolak';
      displayNotification(notifMsg, 'success');

      // 🔁 Refresh tabel agar data terbaru muncul
      await fetchData();
    } catch (error) {
      displayNotification('Gagal mengubah status donasi', 'error');
    } finally {
      isLoading.value = false;
    }
  });
}
</script>

<template>
  <div class="mx-auto p-4">
    <!-- Loading -->
    <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />

    <div v-else class="space-y-4">
      <!-- Search & Filter -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <div class="flex items-center w-full sm:w-auto gap-2">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Filter</label>

          <select
            v-model="status"
            @change="fetchData"
            class="block w-full sm:w-48 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:ring-2 focus:ring-green-900 focus:border-green-900 transition"
          >
            <option value="">Semua Status</option>
            <option value="SUCCESS">Success</option>
            <option value="PROCESS">Process</option>
            <option value="FAILED">Failed</option>
          </select>
          <select
            v-model="status_konfirmasi"
            @change="fetchData"
            class="block w-full sm:w-48 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:ring-2 focus:ring-green-900 focus:border-green-900 transition"
          >
            <option value="">Semua Konfirmasi</option>
            <option value="sudah_dikirim">Sudah dikirim</option>
            <option value="belum_dikirim">Belum dikirim</option>
          </select>
          <input
            id="search"
            type="text"
            v-model="search"
            @input="fetchData"
            placeholder="Cari Nama / Nomor Nik / Nomor Akun..."
            class="w-full sm:w-64 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto rounded-xl border border-gray-200 shadow">
        <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" />
        <table v-else class="w-full border-collapse bg-white text-sm">
          <thead class="bg-gray-50 text-gray-700 text-center border-b border-gray-300">
            <tr>
              <th class="w-[20%] px-6 py-3 font-medium">Info Donasi</th>
              <th class="w-[30%] px-6 py-3 font-medium">Info Pemasukan</th>
              <th class="w-[10%] px-6 py-3 font-medium">Status</th>
              <th class="w-[20%] px-6 py-3 font-medium">Status Konfirmasi</th>
              <th class="w-[10%] px-6 py-3 font-medium">Datetimes</th>
              <th class="w-[10%] px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <template v-if="RiwayatDonasi.length">
              <tr
                v-for="data in RiwayatDonasi"
                :key="data.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <!-- Info Member -->
                <td class="px-6 py-4 text-left font-medium text-gray-800 align-top">
                  <table class="w-full border border-gray-300 rounded-lg">
                    <tbody>
                      <tr class="border-b border-gray-300">
                        <th class="w-[5%] px-4 py-2 text-left font-medium bg-gray-100">Nama</th>
                        <td class="px-4 py-2 text-right">{{ data.Member?.username }}</td>
                      </tr>
                      <tr class="border-b border-gray-300">
                        <th class="px-4 py-2 text-left font-medium bg-gray-100">NIK</th>
                        <td class="px-4 py-2 text-right">
                          {{
                            data.Member?.nomor_ktp
                              ? data.Member.nomor_ktp.replace(
                                  /^(\d{4})(\d+)(\d{4})$/,
                                  (_, start, middle, end) =>
                                    start + '*'.repeat(middle.length) + end,
                                )
                              : ''
                          }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                <!-- Info Program & Nominal -->
                <td class="px-6 py-4 text-left font-medium text-gray-800 align-top">
                  <table class="w-full border border-gray-300 rounded-lg">
                    <tbody>
                      <tr class="border-b border-gray-300">
                        <th class="w-[40%] px-4 py-2 text-left font-medium bg-gray-100">
                          Nama Program
                        </th>
                        <td class="px-4 py-2 text-right">{{ data.Program_donasi?.name }}</td>
                      </tr>
                      <tr class="border-b border-gray-300">
                        <th class="px-4 py-2 text-left font-medium bg-gray-100">Tahun</th>
                        <td class="px-4 py-2 text-right">{{ data.Program_donasi?.tahun }}</td>
                      </tr>
                      <tr class="border-b border-gray-300">
                        <th class="px-4 py-2 text-left font-medium bg-gray-100">Status Program</th>
                        <td class="px-4 py-2 text-right">
                          {{ data.Program_donasi?.status.replace(/_/g, ' ').toUpperCase() }}
                        </td>
                      </tr>
                      <tr class="border-b border-gray-300">
                        <th class="px-4 py-2 text-left font-medium bg-gray-100">Nominal</th>
                        <td class="px-4 py-2 text-right">
                          Rp {{ Number(data.nominal).toLocaleString('id-ID') }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                <!-- Status -->
                <td
                  class="px-6 py-4 text-center font-medium"
                  :class="{
                    'text-green-600 font-semibold':
                      data.status === 'SUCCESS' || data.status === 'success',
                    'text-yellow-600 font-semibold':
                      data.status === 'PROCESS' || data.status === 'process',
                    'text-red-600 font-semibold':
                      data.status === 'FAILED' || data.status === 'failed',
                  }"
                >
                  {{ data.status.replace(/_/g, ' ').toUpperCase() }}
                </td>

                <!-- Status Konfirmasi -->
                <td
                  class="px-6 py-4 text-center font-medium"
                  :class="{
                    'text-green-600 font-semibold':
                      data.status_konfirmasi === 'SUDAH_DIKIRIM' ||
                      data.status_konfirmasi === 'sudah_dikirim',
                    'text-red-600 font-semibold':
                      data.status_konfirmasi === 'BELUM_DIKIRIM' ||
                      data.status_konfirmasi === 'belum_dikirim',
                  }"
                >
                  {{ data.status_konfirmasi.replace(/_/g, ' ').toUpperCase() }}
                </td>

                <!-- Datetimes -->
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ new Date(data.createdAt).toLocaleString('id-ID') }}
                </td>

                <!-- Aksi -->
                <td class="px-6 py-4">
                  <div class="flex flex-col gap-2 items-center">
                    <LightButton
                      title="Approve Donasi"
                      @click="updatestatus(data.id, 'success')"
                      v-if="data.status_konfirmasi === 'sudah_dikirim' && data.status !== 'success'"
                    >
                      <font-awesome-icon icon="fa-solid fa-check" />
                    </LightButton>
                    <LightButton
                      title="Reject Donasi"
                      @click="updatestatus(data.id, 'failed')"
                      v-if="data.status_konfirmasi === 'sudah_dikirim' && data.status === 'success'"
                    >
                      <font-awesome-icon icon="fa-solid fa-times" />
                    </LightButton>
                    <DangerButton @click="deleteData(data.id)">
                      <DeleteIcon />
                    </DangerButton>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else>
              <td :colspan="totalColumns" class="px-6 py-8 text-center text-gray-500">
                <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                <p class="text-sm">Belum ada data riwayat donasi.</p>
              </td>
            </tr>
          </tbody>

          <!-- Pagination -->
          <tfoot class="bg-gray-100 font-bold">
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

<style>
.text-xs {
  font-size: 0.75rem; /* kecilin font */
}
.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}
.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}
</style>
