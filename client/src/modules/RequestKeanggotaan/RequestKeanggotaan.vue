<script setup lang="ts">
import Pagination from '@/components/Pagination/Pagination.vue';
import requestKeanggotaanService from '@/service/request_keanggotaan';
import DangerButton from '@/components/Button/DangerButton.vue';
import SuccessButton from '@/components/Button/SuccessButton.vue';
import { computed, onMounted, ref } from 'vue';
import ButtonReject from '@/components/Button/ButtonReject.vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useNotification } from '@/composables/useNotification';
import { useConfirmation } from '@/composables/useConfirmation';

// State: Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Composable: pagination
const itemsPerPage = ref<number>(100);
const totalColumns = ref<number>(7);

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Composable: notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Composable: confirmation
const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// Interface
interface RequestKeanggotaan {
  id: number;
  status: 'verified' | 'unverified' | string;
  tipe: 'perorangan' | 'kelompok' | string;
  fullname: string;
  nomor_ktp: string;
  nomor_kk: string;
  whatsapp_number: string;
  birth_date: string;
  alamat: string;
  username: string;
  nama_desa: string;
  createdAt: string;
  updatedAt: string;
}

// Function: Fetch data
const search = ref('');
const data = ref<RequestKeanggotaan[]>([]);

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await requestKeanggotaanService.list({
      search: search.value,
      perpage: itemsPerPage.value,
      pageNumber: currentPage.value,
      status: filterStatus.value,
    });
    data.value = response.data;
    totalRow.value = response.total || response.data.length || 0;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    isTableLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});

const filterStatus = ref('');
const OptionFilter = [
  { id: 'verified', name: 'Approve' },
  { id: 'unverified', name: 'Reject' },
  { id: '', name: 'Semua' },
];

const handleApprove = async (id: number) => {
  isLoading.value = true;
  try {
    await requestKeanggotaanService.verifikasi({ id, action: 'approve' });
    displayNotification('Berhasil approve data!', 'success');
    fetchData();
  } catch (e) {
    displayNotification('Gagal approve data!', 'error');
  } finally {
    isLoading.value = false;
  }
};

const handleReject = async (id: number) => {
  isLoading.value = true;
  try {
    await requestKeanggotaanService.verifikasi({ id, action: 'reject' });
    displayNotification('Berhasil reject data!', 'success');
    fetchData();
  } catch (e) {
    displayNotification('Gagal reject data!', 'error');
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="container mx-auto px-4 mt-10">
    <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
    <div class="flex justify-end items-center mb-6">
      <div class="inline-flex rounded-md shadow-xs" role="group">
        <label for="search" class="block text-sm font-medium text-gray-700 mr-2 mt-3">Filter</label>
        <input
          type="text"
          id="search"
          class="block w-64 px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-s-lg shadow-sm focus:ring-2 focus:ring-green-900 focus:border-green-900 transition-all duration-200"
          v-model="search"
          @change="fetchData()"
          placeholder="Cari nama / nomor KTP..."
        />
        <select
          v-model="filterStatus"
          style="width: 200px"
          @change="fetchData()"
          class="border-t border-b border-e bg-gray-50 border-gray-300 text-gray-900 text-sm rounded-e-lg focus:ring-green-900 focus:border-green-900 block w-full p-2.5"
        >
          <option v-for="optionC in OptionFilter" :key="optionC.id" :value="optionC.id">
            {{ optionC.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="overflow-hidden rounded-lg border border-gray-200 shadow-md">
      <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" />
      <table v-else class="w-full border-collapse bg-white text-left text-sm text-gray-500">
        <!-- Header dengan grouping -->
        <thead class="bg-gray-50 text-gray-700 text-center border-b border-gray-300">
          <tr>
            <th class="w-[20%] text-center px-6 py-4 font-medium font-bold text-gray-900">Nama</th>
            <th class="w-[15%] text-center px-6 py-4 font-medium font-bold text-gray-900">
              Tgl Lahir
            </th>
            <th class="w-[15%] text-center px-6 py-4 font-medium font-bold text-gray-900">
              WhatsApp
            </th>
            <th class="w-[15%] text-center px-6 py-4 font-medium font-bold text-gray-900">
              Username
            </th>
            <th class="w-[15%] text-center px-6 py-4 font-medium font-bold text-gray-900">Desa</th>
            <th class="w-[10%] text-center px-6 py-4 font-medium font-bold text-gray-900">
              Status
            </th>
            <th class="w-[10%] text-center px-6 py-4 font-medium font-bold text-gray-900">Aksi</th>
          </tr>
        </thead>

        <!-- Isi Data -->
        <tbody class="divide-y divide-gray-100 border-t border-gray-100">
          <tr v-for="(item, idx) in data" :key="item.id">
            <td class="px-3 py-2 text-center">{{ item.fullname }}</td>
            <td class="px-3 py-2 text-center">{{ item.birth_date }}</td>
            <td class="px-3 py-2 text-center">{{ item.whatsapp_number }}</td>
            <td class="px-3 py-2 text-center">{{ item.username }}</td>
            <td class="px-3 py-2 text-center">{{ item.nama_desa }}</td>
            <td class="px-3 py-2 text-center">{{ item.status }}</td>
            <td class="px-3 py-2 text-center">
              <div class="flex flex-col items-center gap-2 w-full max-w-xs">
                <div class="flex flex-col gap-2 items-stretch">
                  <template v-if="item.status === 'verified'">
                    <span
                      class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold"
                    >
                      ✔ Verified
                    </span>
                  </template>
                  <template v-else-if="item.status === 'unverified'">
                    <span
                      class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold"
                    >
                      ✖ Unverified
                    </span>
                  </template>
                  <template v-else>
                    <span
                      class="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold"
                    >
                      ⚠ Unknown
                    </span>
                  </template>

                  <!-- Approve -->
                  <SuccessButton
                    v-if="item.status == 'process'"
                    class="w-full flex justify-center"
                    @click="
                      displayConfirmation(
                        'Konfirmasi Approve',
                        `Yakin mau approve ${item.fullname}?`,
                        () => handleApprove(item.id),
                      )
                    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </SuccessButton>

                  <!-- Reject -->
                  <ButtonReject
                    v-if="item.status == 'process'"
                    class="w-full flex justify-center"
                    @click="
                      displayConfirmation(
                        'Konfirmasi Reject',
                        `Yakin mau reject ${item.fullname}?`,
                        () => handleReject(item.id),
                      )
                    "
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </ButtonReject>
                </div>
              </div>
            </td>
          </tr>

          <!-- Kalau data kosong -->
          <tr v-if="data.length === 0">
            <td :colspan="totalColumns" class="px-6 py-8 text-center text-gray-500">
              <font-awesome-icon icon="fa-solid fa-user-plus" class="text-4xl mb-2 text-gray-400" />
              <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
              <p class="text-sm">Belum ada data request keanggotaan.</p>
            </td>
          </tr>
        </tbody>

        <!-- Footer -->
        <tfoot class="bg-gray-50 font-bold">
          <Pagination
            :total-row="totalRow"
            :currentPage="currentPage"
            :totalPages="totalPages"
            :pages="pages"
            :totalColumns="totalColumns"
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
</template>
