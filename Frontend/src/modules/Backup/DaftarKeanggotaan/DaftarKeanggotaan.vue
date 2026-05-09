<script setup lang="ts">
// Library
import { ref, onMounted } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import FormAdd from '@/modules/DaftarKeanggotaan/widgets/FormAdd.vue';
import FormEdit from '@/modules/DaftarKeanggotaan/widgets/FormEdit.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service API
import { get_daftar_keanggotaan, delete_keanggotaan } from '@/service/daftar_keanggotaan';

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

interface Data {
  id: number;
  kode: string;
  fullname: string;
  tipe: string;
  nomor_ktp: string;
  nomor_kk: string;
  whatsapp_number: string;
  birth_date: string;
  alamat: string;
  datetime: string;
  desa_name: string;
  kecamatan_name: string;
}

const dataDaftarKeanggotaan = ref<Data[]>([]);

// Function: Modal
const isModalAddOpen = ref(false);
const isModalEditOpen = ref(false);
const selectedKeanggotaan = ref<any>(null);

function openModalAdd() {
  isModalAddOpen.value = true;
}

function openModalEdit(daftar_keanggotaan: any) {
  selectedKeanggotaan.value = daftar_keanggotaan;
  console.log('Keanggotaan Parent', selectedKeanggotaan.value);
  isModalEditOpen.value = true;
}

// Function: Fetch Data
const search = ref('');
const type = ref('');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await get_daftar_keanggotaan({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
      type: type.value,
    });

    dataDaftarKeanggotaan.value = response.data;
    totalRow.value = response.total;
    console.log(dataDaftarKeanggotaan.value);
  } catch (error) {
    displayNotification('Gagal mengambil data daftar keanggotaan', 'error');
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
    'Hapus Data Keanggotaan',
    'Apakah Anda yakin ingin menghapus data keanggotaan ini?',
    async () => {
      try {
        isLoading.value = true;
        await delete_keanggotaan(id);
        displayNotification('Data keanggotaan berhasil dihapus', 'success');
        await fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus data keanggotaan', 'error');
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
          :loading="isModalAddOpen || isModalEditOpen"
          type="button"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
          Tambah Keanggotaan
        </BaseButton>

        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Filter</label>
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari Nama / Kode / Nomor Whatsapp . . ."
            class="w-full sm:w-96 rounded-s-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
          />
          <select
            id="type"
            v-model="type"
            @change="fetchData()"
            class="block w-full sm:w-64 rounded-e-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:ring-2 focus:ring-green-900 focus:border-green-900 transition"
          >
            <option value="perorangan">Perorangan</option>
            <option value="instansi">Instansi</option>
            <option value="">Semua</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 shadow">
        <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" />
        <table v-else class="w-full border-collapse bg-white text-sm">
          <thead class="bg-gray-50 text-gray-700 text-center border-b border-gray-300">
            <tr>
              <th class="w-[10%] px-6 py-3 font-medium">Kode</th>
              <th class="w-[15%] px-6 py-3 font-medium">Tipe Member</th>
              <th class="w-[15%] px-6 py-3 font-medium">Nama Member</th>
              <th class="w-[35%] px-6 py-3 font-medium">Info Member</th>
              <th class="w-[15%] px-6 py-3 font-medium">Datetimes</th>
              <th class="w-[10%] px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-if="dataDaftarKeanggotaan.length > 0">
              <tr
                v-for="data in dataDaftarKeanggotaan"
                :key="data.id"
                class="hover:bg-gray-100 transition-colors"
              >
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.kode }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.tipe.toUpperCase() }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.fullname }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  <table class="border border-gray-300 w-full text-sm text-left">
                    <tbody>
                      <tr class="border border-gray-300">
                        <td class="w-[45%] bg-gray-100 px-4 py-2 font-medium">Desa</td>
                        <td class="px-4 py-2">{{ data.desa_name || '-' }}</td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="w-[45%] bg-gray-100 px-4 py-2 font-medium">Kecamatan</td>
                        <td class="px-4 py-2">{{ data.kecamatan_name || '-' }}</td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="w-[45%] bg-gray-100 px-4 py-2 font-medium">Nomor Whatsapp</td>
                        <td class="px-4 py-2">{{ data.whatsapp_number || '-' }}</td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="w-[45%] bg-gray-100 px-4 py-2 font-medium">Nomor KTP</td>
                        <td class="px-4 py-2">{{ data.nomor_ktp || '-' }}</td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="w-[45%] bg-gray-100 px-4 py-2 font-medium">Nomor KK</td>
                        <td class="px-4 py-2">{{ data.nomor_kk || '-' }}</td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="w-[45%] bg-gray-100 px-4 py-2 font-medium">Tanggal Lahir</td>
                        <td class="px-4 py-2">{{ data.birth_date || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.datetime }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <LightButton @click="openModalEdit(data)">
                      <EditIcon />
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
                <font-awesome-icon icon="fa-solid fa-users" class="text-4xl mb-2 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                <p class="text-sm">Belum ada data keanggotaan.</p>
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
            payload.error_msg || 'Tambah/Update Keanggotaan gagal',
            payload.error ? 'error' : 'success',
          )
      "
    />

    <!-- Modal FormEdit -->
    <FormEdit
      :is-modal-open="isModalEditOpen"
      :selected-keanggotaan="selectedKeanggotaan"
      @close="
        isModalEditOpen = false;
        fetchData();
      "
      @status="
        (payload: any) =>
          displayNotification(
            payload.error_msg || 'Tambah/Update Keanggotaan gagal',
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
