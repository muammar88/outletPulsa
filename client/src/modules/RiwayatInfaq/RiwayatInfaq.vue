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
import FormAdd from '@/modules/RiwayatInfaq/widgets/FormAdd.vue';
import BaseSelect from '@/components/Form/BaseSelect.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { useDynamicLabel } from '@/composables/useDynamicLabel';

// Service API
import { get_riwayat_infaq, delete_riwayat_infaq } from '@/service/riwayat_infaq';

// State: Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Composable: pagination
const itemsPerPage = ref<number>(100);
const totalColumns = ref<number>(6);

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Composable: notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Composable: confirmation
const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// Composable: dynamic label
const { dynamicLabel } = useDynamicLabel();

interface RiwayatInfaq {
  id: number;
  member_id: number;
  member_name: string;
  member_nik: string;
  invoice: string;
  type: string;
  nominal: number;
  kode: string;
  status: string;
  konfirmasi_pembayaran: string;
  datetimes: string;
}

const dataRiwayatInfaq = ref<RiwayatInfaq[]>([]);

// Function: Modal
const isModalAddOpen = ref(false);

function openModalAdd() {
  isModalAddOpen.value = true;
}

// Function: Fetch Data
const search = ref('');
const selectStatus = ref('');
const selectStatusKonfirmasi = ref('belum_dikirim');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await get_riwayat_infaq({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
      status: selectStatus.value,
      konfirmasi_pembayaran: selectStatusKonfirmasi.value,
    });

    dataRiwayatInfaq.value = response.data;
    totalRow.value = response.total;
    console.log(dataRiwayatInfaq.value);
  } catch (error) {
    displayNotification('Gagal mengambil data riwayat_infaq', 'error');
  } finally {
    isTableLoading.value = false;
  }
}

onMounted(async () => {
  await fetchData();
});

// Function: Delete Data
async function deleteData(id: number) {
  displayConfirmation(
    'Hapus Data Riwayat Infaq',
    'Apakah Anda yakin ingin menghapus data riwayat infaq ini?',
    async () => {
      try {
        isLoading.value = true;
        await delete_riwayat_infaq(id);
        displayNotification('Data riwayat infaq berhasil dihapus', 'success');
        await fetchData();
      } catch (error: any) {
        displayNotification(error.response.data.error_msg, 'error');
      } finally {
        isLoading.value = false;
      }
    },
  );
}
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
          :loading="isModalAddOpen"
          type="button"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
          {{ dynamicLabel('Tambah Riwayat Infaq') }}
        </BaseButton>

        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto gap-2">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Filter</label>

          <!-- Status -->
          <BaseSelect
            v-model="selectStatus"
            :options="[
              { value: 'process', label: 'Proses' },
              { value: 'success', label: 'Sukses' },
              { value: 'failed', label: 'Gagal' },
            ]"
            placeholder="Semua Status"
            @change="fetchData"
          />

          <!-- Status Konfirmasi -->
          <BaseSelect
            v-model="selectStatusKonfirmasi"
            :options="[
              { value: 'belum_dikirim', label: 'Belum Dikirim' },
              { value: 'sudah_dikirim', label: 'Sudah Dikirim' },
            ]"
            placeholder="Semua Status Konfirmasi"
            @change="fetchData"
          />

          <!-- Search -->
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari Nama / Nomor Nik / Nomor Akun..."
            class="w-full sm:w-86 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
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
                class="w-[30%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Info Member
              </th>
              <th
                class="w-[30%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Info Pemasukan
              </th>
              <th
                class="w-[10%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Status
              </th>
              <th
                class="w-[10%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Status Konfirmasi
              </th>
              <th
                class="w-[10%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Datetimes
              </th>
              <th
                class="w-[10%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-if="dataRiwayatInfaq.length > 0">
              <tr
                v-for="riwayat_infaq in dataRiwayatInfaq"
                :key="riwayat_infaq.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 text-start align-top">
                  <table class="w-full border border-gray-300 rounded-lg">
                    <tbody>
                      <tr class="border border-gray-300">
                        <td class="w-[40%] bg-gray-100 px-4 py-2 font-medium">Nama Munfiq</td>
                        <td class="px-4 py-2 font-medium">
                          {{ riwayat_infaq.member_name }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="w-[45%] bg-gray-100 px-4 py-2 font-medium">NIK Munfiq</td>
                        <td class="px-4 py-2 font-medium">
                          {{ riwayat_infaq.member_nik }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td class="px-6 py-4 text-start font-medium text-gray-800 align-top">
                  <table class="w-full border border-gray-300 rounded-lg">
                    <tbody>
                      <tr class="border border-gray-300">
                        <td class="w-[40%] bg-gray-100 px-4 py-2 font-medium">Invoice</td>
                        <td class="px-4 py-2 font-medium">
                          {{ riwayat_infaq.invoice }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="w-[40%] bg-gray-100 px-4 py-2 font-medium">Nominal</td>
                        <td class="px-4 py-2 font-medium">
                          {{ $formatToRupiah(riwayat_infaq.nominal) }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td class="px-6 py-4 text-center font-bold text-gray-800">
                  <span
                    :class="{
                      'text-green-500': riwayat_infaq.status === 'success',
                      'text-yellow-500': riwayat_infaq.status === 'process',
                      'text-red-500': riwayat_infaq.status === 'failed',
                    }"
                  >
                    {{
                      {
                        success: 'SUKSES',
                        process: 'PROSES',
                        failed: 'GAGAL',
                      }[riwayat_infaq.status]
                    }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center font-bold text-gray-800">
                  <span
                    :class="
                      riwayat_infaq.konfirmasi_pembayaran === 'sudah_dikirim'
                        ? 'text-green-500'
                        : 'text-red-500'
                    "
                  >
                    {{
                      riwayat_infaq.konfirmasi_pembayaran === 'sudah_dikirim'
                        ? 'SUDAH DIKIRIM'
                        : 'BELUM DIKIRIM'
                    }}
                  </span>
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ riwayat_infaq.datetimes }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <DangerButton @click="deleteData(riwayat_infaq.id)"
                      ><DeleteIcon
                    /></DangerButton>
                  </div>
                </td>
              </tr>
            </template>
            <!-- Empty State -->
            <tr v-else>
              <td :colspan="totalColumns" class="px-6 py-8 text-center text-gray-500">
                <font-awesome-icon
                  icon="fa-solid fa-hand-holding-dollar"
                  class="text-4xl mb-2 text-gray-400"
                />
                <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                <p class="text-sm">Belum ada data riwayat infaq.</p>
              </td>
            </tr>
          </tbody>
          <!-- Pagination -->
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

    <!-- Modal FormAdd -->
    <FormAdd
      :is-modal-open="isModalAddOpen"
      @close="((isModalAddOpen = false), fetchData())"
      @status="
        (payload: any) =>
          displayNotification(
            payload.error_msg || 'Tambah/Update RiwayatInfaq gagal',
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
