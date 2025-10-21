<script setup lang="ts">
// Library
import { ref, onMounted } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import EditIcon from '@/components/Icons/EditIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';

// Form
import FormEdit from '@/modules/DaftarTab/widgets/FormEdit.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service API
import { get_tab } from '@/service/daftar_tab';

// Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Pagination
const itemsPerPage = ref<number>(20);
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
interface Tab {
  id: number;
  name: string;
  icon: string;
  path: string;
  desc: string;
}

const dataTab = ref<Tab[]>([]);

// Modal state
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const selectedTab = ref<any>(null);

function openAddModal() {
  isAddModalOpen.value = true;
}

function openEditModal(tab: any) {
  selectedTab.value = tab;
  isEditModalOpen.value = true;
}

// Fetch data
const search = ref('');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await get_tab({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
    });

    dataTab.value = response.data;
    totalRow.value = response.total;
  } catch (error) {
    displayNotification('Gagal mengambil tab', 'error');
  } finally {
    isTableLoading.value = false;
  }
}

onMounted(async () => {
  await fetchData();
  totalColumns.value = document.querySelectorAll('thead th').length;
});
</script>

<template>
  <div class="mx-auto p-4">
    <!-- Header -->
    <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
    <div v-else class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-end gap-4">
        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Cari</label>
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari Nama Tab..."
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
              <th class="w-[20%] px-6 py-3 font-medium">Nama Tab</th>
              <th class="w-[15%] px-6 py-3 font-medium">Icon</th>
              <th class="w-[25%] px-6 py-3 font-medium">path</th>
              <th class="w-[50%] px-6 py-3 font-medium">Deskripsi</th>
              <th class="w-[10%] px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <template v-if="dataTab.length > 0">
              <tr
                v-for="tab in dataTab"
                :key="tab.id"
                class="hover:bg-gray-50 transition-colors text-center"
              >
                <td class="px-4 py-2 text-gray-600 text-left">
                  {{ tab.name }}
                </td>
                <td class="px-6 py-4 text-gray-600 text-left">
                  {{ tab.icon }}
                </td>
                <td class="px-6 py-4 text-gray-600 text-left">
                  {{ tab.path }}
                </td>
                <td class="px-6 py-4 text-gray-600 text-left">
                  {{ tab.desc }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <LightButton @click="openEditModal(tab)">
                      <EditIcon />
                    </LightButton>
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
                <p class="text-sm">Belum ada Tab.</p>
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
    <!-- Modal Edit -->
    <FormEdit
      :is-modal-open="isEditModalOpen"
      :selected-tab="selectedTab"
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
