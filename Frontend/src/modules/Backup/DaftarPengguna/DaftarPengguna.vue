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
import FormAdd from '@/modules/DaftarPengguna/widgets/FormAdd.vue';
import FormEdit from '@/modules/DaftarPengguna/widgets/FormEdit.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service API
import { list_daftar_pengguna, delete_daftar_pengguna } from '@/service/daftar_pengguna';

// Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Pagination
const itemsPerPage = ref<number>(10);
const totalColumns = ref<number>(5);

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Confirmation
const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// Interface
interface daftar_pengguna {
  id: number;
  kode: string;
  username: string;
  grup: string;
  createdAt: string;
  updatedAt: string;
}

const dataDaftarPengguna = ref<daftar_pengguna[]>([]);

// Modal state
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedDaftarPengguna = ref<any>(null);

function openAddModal() {
  isAddModalOpen.value = true;
}

function openEditModal(daftar_pengguna: any) {
  selectedDaftarPengguna.value = daftar_pengguna;
  isEditModalOpen.value = true;
}

// Fetch data
const search = ref('');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await list_daftar_pengguna({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
    });

    dataDaftarPengguna.value = response.data;
    totalRow.value = response.total;
  } catch (error) {
    displayNotification('Gagal mengambil pengguna', 'error');
  } finally {
    isTableLoading.value = false;
  }
}

onMounted(async () => {
  await fetchData();
  // totalColumns.value = document.querySelectorAll('thead th').length
});

// Delete
async function deleteData(id: number) {
  displayConfirmation(
    'Hapus Pengguna',
    'Apakah Anda yakin ingin menghapus pengguna ini?',
    async () => {
      try {
        isLoading.value = true;
        await delete_daftar_pengguna(id);
        displayNotification('Pengguna berhasil dihapus', 'success');
        await fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus pengguna', 'error');
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
          :loading="isAddModalOpen || isEditModalOpen"
          @click="openAddModal"
          variant="primary"
          type="button"
        >
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
          Tambah Pengguna
        </BaseButton>

        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Cari</label>
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari pengguna..."
            class="w-full sm:w-64 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d] transition"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="rounded-xl border border-gray-200 shadow">
        <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" />
        <table v-else class="table-fixed w-full border-collapse bg-white text-sm">
          <thead class="bg-gray-50 text-gray-700 text-center">
            <tr>
              <th class="w-[20%] px-6 py-3 font-medium">Kode</th>
              <th class="w-[20%] px-6 py-3 font-medium">Nama User</th>
              <th class="w-[20%] px-6 py-3 font-medium">Grup</th>
              <th class="w-[20%] px-6 py-3 font-medium">DateTimes</th>
              <th class="w-[20%] px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <template v-if="dataDaftarPengguna.length > 0">
              <tr
                v-for="pengguna in dataDaftarPengguna"
                :key="pengguna.id"
                class="hover:bg-gray-50 transition-colors text-center"
              >
                <td class="px-4 py-2 text-gray-600">
                  {{ pengguna.kode }}
                </td>
                <td class="px-6 py-4 text-gray-600 break-words">
                  {{ pengguna.name }}
                </td>
                <td class="px-6 py-4 text-gray-600 break-words">
                  {{ pengguna.grup }}
                </td>
                <td class="px-6 py-4 text-gray-600">
                  {{ pengguna.createdAt }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <LightButton @click="openEditModal(pengguna)">
                      <EditIcon />
                    </LightButton>
                    <DangerButton @click="deleteData(pengguna.id)">
                      <DeleteIcon />
                    </DangerButton>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else>
              <td :colspan="totalColumns" class="px-6 py-8 text-center text-gray-500">
                <font-awesome-icon
                  icon="fa-solid fa-database"
                  class="text-2xl mb-2 text-gray-400"
                />
                <p class="text-sm">Belum ada pengguna.</p>
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

    <!-- Modal Tambah -->
    <FormAdd
      :is-modal-open="isAddModalOpen"
      @close="((isAddModalOpen = false), fetchData())"
      @status="
        (payload) =>
          displayNotification(
            payload.error_msg || 'Berhasil Menambah Pengguna',
            payload.error ? 'error' : 'success',
          )
      "
    />

    <!-- Modal Edit -->
    <FormEdit
      :is-modal-open="isEditModalOpen"
      :selected-pengguna="selectedDaftarPengguna"
      @close="((isEditModalOpen = false), fetchData())"
      @status="
        (payload) =>
          displayNotification(
            payload.error_msg || 'Berhasil Update Pengguna',
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
      <BaseButton variant="warning" @click="confirm">Ya</BaseButton>
      <BaseButton variant="secondary" @click="cancel">Tidak</BaseButton>
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
