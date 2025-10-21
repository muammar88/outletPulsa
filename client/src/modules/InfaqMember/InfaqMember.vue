<script setup lang="ts">
// Library
import { ref, onMounted, watch } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import FormAdd from '@/modules/InfaqMember/widgets/FormAdd.vue';
import FormConfirm from '@/modules/InfaqMember/widgets/FormConfirm.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service
import { getInfaqList } from '@/service/infaq_member';

// State: Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Composable: pagination
const itemsPerPage = ref<number>(10);
const totalColumns = ref<number>(5);

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Composable: notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Composable: confirmation
const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// State Data
interface Infaq {
  id: number;
  invoice: string;
  nominal: number;
  status: string;
  konfirmasi_pembayaran: string;
  tanggal_pembayaran: string;
}

const infaq = ref<Infaq[]>([]);

// Function: Modal
const isModalAddOpen = ref(false);
const isModalConfirmOpen = ref(false);
const selectedInfaq = ref<any>(null);

function openModalAdd() {
  isModalAddOpen.value = true;
}

function openModalDetail(infaqData: any) {
  selectedInfaq.value = infaqData;
  isModalConfirmOpen.value = true;
}

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Function: Fetch Data
const search = ref('');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await getInfaqList({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
    });

    infaq.value = response.data;
    totalRow.value = response.total;
  } catch (error) {
    displayNotification('Gagal mengambil data infaq', 'error');
  } finally {
    isTableLoading.value = false;
  }
}

// Fungsi untuk menangani pencarian
const handleSearch = () => {
  currentPage.value = 1;
  fetchData();
};

let debounceTimer: number;
watch(search, () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    handleSearch();
  }, 500);
});

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
          :loading="isModalAddOpen || isModalConfirmOpen"
          type="button"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
          Bayar Infaq
        </BaseButton>

        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Cari</label>
          <input
            id="search"
            type="text"
            v-model="search"
            placeholder="Cari invoice..."
            class="w-full sm:w-64 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
          />
        </div>
      </div>

      <!-- Table -->

      <div class="overflow-hidden rounded-xl border border-gray-200 shadow">
        <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" />
        <table v-else class="w-full border-collapse bg-white text-sm">
          <thead class="bg-gray-50 text-gray-700 text-center border-b border-gray-300">
            <tr>
              <th class="w-[20%] px-6 py-3 font-medium">Invoice</th>
              <th class="w-[20%] px-6 py-3 font-medium">Nominal</th>
              <th class="w-[20%] px-6 py-3 font-medium">Status</th>
              <th class="w-[25%] px-6 py-3 font-medium">Tanggal Pembayaran Infaq</th>
              <th class="w-[15%] px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-if="infaq && infaq.length > 0">
              <tr v-for="data in infaq" :key="data.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.invoice }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ formatRupiah(data.nominal) }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  <span
                    :class="{
                      'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs':
                        data.status === 'process',
                      'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs':
                        data.status === 'success',
                      'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs':
                        data.status === 'failed',
                    }"
                  >
                    {{ data.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.tanggal_pembayaran }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <BaseButton @click="openModalDetail(data)" variant="warning" type="button">
                      <font-awesome-icon icon="fa-solid fa-clipboard-check" />
                    </BaseButton>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else>
              <td :colspan="totalColumns" class="px-6 py-8 text-center text-gray-500">
                <font-awesome-icon
                  icon="fa-solid fa-database"
                  class="text-4xl mb-2 text-gray-400"
                />
                <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                <p class="text-sm">Belum ada data infaq yang ditemukan.</p>
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

    <!-- Modal FormAdd -->
    <FormAdd
      :is-modal-open="isModalAddOpen"
      @close="
        isModalAddOpen = false;
        fetchData();
      "
      @status="
        (payload: any) =>
          displayNotification(
            payload.error_msg || 'Tambah Infaq gagal',
            payload.error ? 'error' : 'success',
          )
      "
    />

    <!-- Modal FormConfirm -->
    <FormConfirm
      :is-modal-open="isModalConfirmOpen"
      :selected-infaq="selectedInfaq"
      @close="
        isModalConfirmOpen = false;
        fetchData();
      "
      @status="
        (payload: any) =>
          displayNotification(
            payload.error_msg || 'Konfirmasi pembayaran gagal',
            payload.error ? 'error' : 'success',
          )
      "
    />

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
