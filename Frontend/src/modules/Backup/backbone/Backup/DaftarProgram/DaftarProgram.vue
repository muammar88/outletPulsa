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
import FormAdd from '@/modules/DaftarProgram/widgets/FormAdd.vue';
import FormEdit from '@/modules/DaftarProgram/widgets/FormEdit.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service API
import {
  get_daftar_program,
  edit_daftar_program,
  delete_daftar_program,
} from '@/service/daftar_program';

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
interface DaftarProgram {
  id: number;
  name: string;
  desc: string;
  createdAt: string;
  updatedAt: string;
}

const DaftardataProgram = ref<DaftarProgram[]>([]);

// Modal state
const isAddModalOpen = ref(false);
const isEditModalOpen = ref(false);
const DaftarselectedProgram = ref<any>(null);

function openAddModal() {
  isAddModalOpen.value = true;
}

function openEditModal(program: any) {
  DaftarselectedProgram.value = program;
  isEditModalOpen.value = true;
}

// Fetch data
const search = ref('');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await get_daftar_program({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
    });

    DaftardataProgram.value = response.data;
    totalRow.value = response.total;
  } catch (error) {
    displayNotification('Gagal mengambil program', 'error');
  } finally {
    isTableLoading.value = false;
  }
}

onMounted(async () => {
  await fetchData();
});

// Delete
async function deleteData(id: number) {
  displayConfirmation(
    'Hapus Daftar Program',
    'Apakah anda yakin ingin menghapus Program ini?',
    async () => {
      try {
        isLoading.value = true;
        await delete_daftar_program(id);
        displayNotification('Daftar Program Berhasil Dihapus.', 'success');
        await fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus Program', 'error');
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
        <BaseButton @click="openAddModal" variant="primary" type="button">
          <font-awesome-icon icon="fa-solid fa-plus" class="mr-2" />
          Tambah Daftar Program
        </BaseButton>

        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Cari</label>
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari program..."
            class="w-full sm:w-64 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-[#14532d] focus:ring-2 focus:ring-[#14532d] transition"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 shadow-md">
        <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" />
        <table v-else class="table-fixed w-full border-collapse bg-white text-sm">
          <!-- tambahkan border-b di thead -->
          <thead class="bg-gray-50 text-gray-700 text-center border-b border-gray-300">
            <tr>
              <th class="w-[25%] px-6 py-4 font-medium font-bold text-gray-900">Daftar Program</th>
              <th class="w-[40%] px-6 py-4 font-medium font-bold text-gray-900">Deskripsi</th>
              <th class="w-[20%] px-6 py-4 font-medium font-bold text-gray-900">Datetimes</th>
              <th class="w-[20%] px-6 py-4 font-medium font-bold text-gray-900">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-100">
            <template v-if="DaftardataProgram.length > 0">
              <tr
                v-for="program in DaftardataProgram"
                :key="program.id"
                class="hover:bg-gray-50 transition-colors text-left"
              >
                <td class="px-4 py-2 text-gray-600">
                  {{ program.name }}
                </td>
                <td class="px-6 py-4 text-gray-600 break-words text-left">
                  {{ program.desc }}
                </td>
                <td class="px-6 py-4 text-gray-600 text-center">
                  {{ program.createdAt }}
                </td>
                <td class="px-6 py-4">
                  <div class="flex justify-center gap-2">
                    <LightButton @click="openEditModal(program)">
                      <EditIcon />
                    </LightButton>
                    <DangerButton @click="deleteData(program.id)">
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
                <p class="text-sm">Belum ada Daftar Program.</p>
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
          displayNotification(
            payload.error_msg || 'Program Berhasil Ditambahkan.',
            payload.error ? 'error' : 'success',
          )
      "
    />

    <!-- Modal Edit -->
    <FormEdit
      :is-modal-open="isEditModalOpen"
      :selected-program="DaftarselectedProgram"
      @close="
        isEditModalOpen = false;
        fetchData();
      "
      @status="
        (payload) =>
          displayNotification(
            payload.error_msg || 'Deskripsi Berhasil Diupdate!',
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
