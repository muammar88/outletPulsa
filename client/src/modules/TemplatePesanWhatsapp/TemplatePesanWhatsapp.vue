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
import FormAdd from '@/modules/TemplatePesanWhatsapp/widgets/FormAdd.vue';
import FormEdit from '@/modules/TemplatePesanWhatsapp/widgets/FormEdit.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service API
import {
  get_template_pesan_whatsapp,
  delete_template_pesan_whatsapp,
} from '@/service/template_pesan_whatsapp';

// State: Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Composable: pagination
const itemsPerPage = ref<number>(100);
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
interface Data {
  id: number;
  name: string;
  type: string;
  message: string;
  variable: string | any[];
}

const dataTemplates_pesan_whatsapp = ref<Data[]>([]);

// Function: Modal
const isModalAddOpen = ref(false);
const isModalEditOpen = ref(false);
const selectedTemplatePesanWhatsapp = ref<any>(null);

function openModalAdd() {
  isModalAddOpen.value = true;
}

function openModalEdit(template: any) {
  selectedTemplatePesanWhatsapp.value = template;
  isModalEditOpen.value = true;
}

// Function: Fetch Data
const search = ref('');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const response = await get_template_pesan_whatsapp({
      search: search.value,
      perpage: perPage.value,
      pageNumber: currentPage.value,
    });

    dataTemplates_pesan_whatsapp.value = response.data;
    totalRow.value = response.total;
  } catch (error) {
    displayNotification('Gagal mengambil template pesan whatsapp', 'error');
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
    'Hapus Data template pesan whatsapp',
    'Apakah Anda yakin ingin menghapus data template pesan whatsapp ini?',
    async () => {
      try {
        isLoading.value = true;
        await delete_template_pesan_whatsapp(id);
        displayNotification('Data template pesan whatsapp berhasil dihapus', 'success');
        await fetchData();
      } catch (error) {
        displayNotification('Gagal menghapus data template pesan whatsapp', 'error');
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
          Tambah Template Pesan
        </BaseButton>

        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Cari</label>
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari template pesan..."
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
              <th class="w-[15%] px-6 py-3 font-medium">Name</th>
              <th class="w-[15%] px-6 py-3 font-medium">Tipe Pesan</th>
              <th class="w-[30%] px-6 py-3 font-medium">Pesan</th>
              <th class="w-[30%] px-6 py-3 font-medium">Variabel</th>
              <th class="w-[10%] px-6 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <template v-if="dataTemplates_pesan_whatsapp.length > 0">
              <tr
                v-for="data in dataTemplates_pesan_whatsapp"
                :key="data.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.name }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.type }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.message }}
                </td>
                <td class="px-6 py-4 text-center font-medium text-gray-800">
                  {{ data.variable }}
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
                <font-awesome-icon
                  icon="fa-solid fa-database"
                  class="text-4xl mb-2 text-gray-400"
                />
                <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                <p class="text-sm">Belum ada template pesan.</p>
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
            payload.error_msg || 'Tambah Template Pesan Whatsapp berhasil',
            payload.error ? 'error' : 'success',
          )
      "
    />

    <!-- Modal FormEdit -->
    <FormEdit
      :is-modal-open="isModalEditOpen"
      :selected-template-pesan-whatsapp="selectedTemplatePesanWhatsapp"
      @close="((isModalEditOpen = false), fetchData())"
      @status="
        (payload: any) =>
          displayNotification(
            payload.error_msg || 'Update Template Pesan Whatsapp berhasil',
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
