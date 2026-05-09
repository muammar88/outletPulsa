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
import FormAdd from '@/modules/Bank/widgets/FormAdd.vue';
import FormEdit from '@/modules/Bank/widgets/FormEdit.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service API
import { get_bank, delete_bank } from '@/service/bank';

// State: Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Composable: pagination
const itemsPerPage = ref<number>(100);
const totalColumns = ref<number>(3);

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Composable: notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Composable: confirmation
const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// State Data Bank
const BASE_URL = import.meta.env.VITE_APP_API_BASE_URL;

interface Bank {
  id: number;
  img: string;
  name: string;
}

const dataBanks = ref<Bank[]>([]);

// Function: Modal
const isModalAddOpen = ref(false);
const isModalEditOpen = ref(false);
const selectedBank = ref<any>(null);

function openModalAdd() {
  isModalAddOpen.value = true;
}

function openModalEdit(bank: any) {
  selectedBank.value = bank;
  console.log('selectedBank Parent', selectedBank.value);
  isModalEditOpen.value = true;
}

// Function: Fetch Data
const search = ref('');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await get_bank({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
    });

    dataBanks.value = response.data;
    totalRow.value = response.total;
    console.log(dataBanks.value);
  } catch (error) {
    displayNotification('Gagal mengambil data bank', 'error');
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
    'Hapus Data Bank',
    'Apakah Anda yakin ingin menghapus data bank ini?',
    async () => {
      try {
        isLoading.value = true;
        await delete_bank(id);
        displayNotification('Data bank berhasil dihapus', 'success');
        await fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus data bank', 'error');
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
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" /> Tambah Bank
        </BaseButton>

        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Cari</label>
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari bank..."
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
                Logo Bank
              </th>
              <th
                class="w-[70%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Nama Bank
              </th>
              <th
                class="w-[20%] text-center px-6 py-4 font-medium font-bold text-gray-900 text-center"
              >
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-if="dataBanks.length > 0">
              <tr
                v-for="bank in dataBanks"
                :key="bank.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 text-center align-middle">
                  <center>
                    <div
                      v-if="bank.img && bank.img !== '-'"
                      class="relative rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden"
                      style="width: 100px; height: 33px"
                      :class="{ 'bg-gray-200': !bank.img || bank.img === '-' }"
                    >
                      <img
                        :src="BASE_URL + '/uploads/img/bank/' + bank.img"
                        :alt="`Foto Bank ${bank.name}`"
                        class="object-contain max-w-full max-h-full mx-auto"
                        @error="bank.img = '-'"
                      />
                    </div>
                    <div
                      v-else
                      class="bg-gray-200 text-gray-500 text-center px-4 relative aspect-video max-w-sm rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden"
                    >
                      <p class="text-sm font-medium">Gambar tidak tersedia</p>
                    </div>
                  </center>
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ bank.name }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <LightButton @click="openModalEdit(bank)"><EditIcon /></LightButton>
                    <DangerButton @click="deleteData(bank.id)"><DeleteIcon /></DangerButton>
                  </div>
                </td>
              </tr>
            </template>
            <!-- Empty State -->
            <tr v-else>
              <td :colspan="totalColumns" class="px-6 py-8 text-center text-gray-500">
                <font-awesome-icon icon="fa-solid fa-bank" class="text-4xl mb-2 text-gray-400" />
                <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                <p class="text-sm">Belum ada data bank.</p>
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
      @close="
        isModalAddOpen = false;
        fetchData();
      "
      @status="
        (payload: any) =>
          displayNotification(
            payload.error_msg || 'Tambah/Update Bank gagal',
            payload.error ? 'error' : 'success',
          )
      "
    />
    <!-- Modal FormEdit -->
    <FormEdit
      :is-modal-open="isModalEditOpen"
      :selected-bank="selectedBank"
      @close="
        isModalEditOpen = false;
        fetchData();
      "
      @status="
        (payload: any) =>
          displayNotification(
            payload.error_msg || 'Tambah/Update Bank gagal',
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
