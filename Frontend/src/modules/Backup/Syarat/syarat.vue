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

// Form
import FormAdd from '@/modules/Syarat/widgets/FormAdd.vue';
import FormEdit from '@/modules/Syarat/widgets/FormEdit.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service API
import { get_syarat, delete_syarat } from '@/service/syarat';

// Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Pagination
const itemsPerPage = ref<number>(10);
const totalColumns = ref<number>(4);

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Confirmation
const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

// Interface
interface Syarat {
  id: number;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

const dataSyarat = ref<Syarat[]>([]);

// Modal state
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedSyarat = ref<any>(null);

function openAddModal() {
  isAddModalOpen.value = true;
}

function openEditModal(syarat: any) {
  selectedSyarat.value = syarat;
  isEditModalOpen.value = true;
}

// Fetch data
const search = ref('');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await get_syarat({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
    });

    dataSyarat.value = response.data;
    totalRow.value = response.total;
  } catch (error) {
    displayNotification('Gagal mengambil syarat', 'error');
  } finally {
    isTableLoading.value = false;
  }
}

onMounted(async () => {
  await fetchData();
});

// Delete
async function deleteData(id: number) {
  displayConfirmation('Hapus Syarat', 'Apakah Anda yakin ingin menghapus syarat ini?', async () => {
    try {
      isLoading.value = true;
      await delete_syarat(id);
      displayNotification('Syarat berhasil dihapus', 'success');
      await fetchData();
    } catch (error) {
      displayNotification('Gagal menghapus syarat', 'error');
    } finally {
      isLoading.value = false;
    }
  });
}
</script>

<template>
  <div class="mx-auto p-4">
    <!-- Header -->
    <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
    <div v-else class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <BaseButton @click="openAddModal" variant="primary" type="button">
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
          Tambah Syarat
        </BaseButton>

        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Cari</label>
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari syarat..."
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
              <th class="w-[25%] px-6 py-3 font-medium">Syarat</th>
              <th class="w-[35%] px-6 py-3 font-medium">Path</th>
              <th class="w-[25%] px-6 py-3 font-medium">Datetimes</th>
              <th class="w-[15%] px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <template v-if="dataSyarat.length > 0">
              <tr
                v-for="syarat in dataSyarat"
                :key="syarat.id"
                class="hover:bg-gray-50 transition-colors text-center"
              >
                <td class="px-4 py-2 text-gray-600">
                  {{ syarat.name }}
                </td>
                <td class="px-6 py-4 text-gray-600 break-words">
                  {{ syarat.path }}
                </td>
                <td class="px-6 py-4 text-gray-600">
                  {{ syarat.createdAt }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <LightButton @click="openEditModal(syarat)">
                      <EditIcon />
                    </LightButton>
                    <DangerButton @click="deleteData(syarat.id)">
                      <DeleteIcon />
                    </DangerButton>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else>
              <td :colspan="4" class="px-6 py-8 text-center text-gray-500">
                <font-awesome-icon
                  icon="fa-solid fa-database"
                  class="text-2xl mb-2 text-gray-400"
                />
                <p class="text-sm">Belum ada syarat.</p>
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
      @close="
        isAddModalOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(payload.error_msg || 'Berhasil', payload.error ? 'error' : 'success')
      "
    />

    <!-- Modal Edit -->
    <FormEdit
      :is-modal-open="isEditModalOpen"
      :selected-syarat="selectedSyarat"
      @close="
        isEditModalOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(payload.error_msg || 'Berhasil', payload.error ? 'error' : 'success')
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
