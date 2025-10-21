<script setup lang="ts">
// Library
import { ref, onMounted, computed } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import YellowButton from '@/components/Button/YellowButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseSelect from '@/components/Form/BaseSelect.vue';
import FormAdd from '@/modules/PermohonanBantuan/widgets/FormAdd.vue';
import FormEdit from '@/modules/PermohonanBantuan/widgets/FormEdit.vue';
import FormEditStatus from '@/modules/PermohonanBantuan/widgets/FormEditStatus.vue';

// Composable
import { usePagination } from '@/composables/usePaginations';
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service API
import {
  get_filter_type,
  get_permohonan_bantuan,
  delete_permohonan_bantuan,
} from '@/service/permohonan_bantuan';

// State: Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Composable: pagination
const itemsPerPage = ref<number>(25);
const totalColumns = ref<number>(5);

const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Composable: notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Composable: confirmation
const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

interface permohonanBantuan {
  id: number;
  biaya_disetujui: number;
  nominal_realisasi: number;
  Permohonan: {
    id: number;
    bank_name: string;
    nomor_akun_bank: string;
    nama_akun_bank: string;
    status: string;
    member_id: number;
    member_name: string;
    member_tipe: string;
    desa_name: string | null;
    kecamatan_name: string | null;
    Kegiatan: {
      id: number;
      nama_kegiatan: string;
      sisa_jumlah_dana: number;
      jumlah_dana: number;
      sumber_dana: string;
      area_penyaluran: string;
      status_kegiatan: string;
      tahun: number;
      kriteria: { id: number; name: string }[];
    };
  };
}

const dataPermohonanBantuan = ref<permohonanBantuan[]>([]);

// Function: Modal
const isModalAddOpen = ref(false);
const isModalEditOpen = ref(false);
const isModalEditStatusOpen = ref(false);
const selectedPermohonanBantuan = ref<any>(null);

function openModalAdd() {
  isModalAddOpen.value = true;
}

function openModalEdit(datas: any) {
  selectedPermohonanBantuan.value = datas;
  isModalEditOpen.value = true;
}

function openModalEditStatus(datas: any) {
  selectedPermohonanBantuan.value = datas;
  isModalEditStatusOpen.value = true;
}

// Function: Fetch Data
const kegiatanOption = ref<{ value: string; label: string }[]>([]); // di fetch dari API
const statusRealisasiOption = ref<{ value: string; label: string }[]>([
  { value: 'selesai', label: 'Selesai' },
  { value: 'sedang_berlangsung', label: 'Sedang Berlangsung' },
]);
const selectedKegiatan = ref(null);
const selectedStatusKegiatan = ref('sedang_berlangsung');
const search = ref('');

async function fetchData() {
  isTableLoading.value = true;
  try {
    const [response, filterTypeResponse] = await Promise.all([
      get_permohonan_bantuan({
        search: search.value,
        perpage: perPage.value,
        pageNumber: currentPage.value,
        type_kegiatan: selectedKegiatan.value,
        type_status_kegiatan: selectedStatusKegiatan.value,
      }),
      get_filter_type(),
    ]);

    dataPermohonanBantuan.value = response.data;
    totalRow.value = response.total;

    kegiatanOption.value = filterTypeResponse.data;
  } catch (error) {
    displayNotification('Gagal mengambil data permohonan bantuan', 'error');
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
    'Hapus Data Permohonan Bantuan',
    'Apakah Anda yakin ingin menghapus data permohonan bantuan ini?',
    async () => {
      try {
        isLoading.value = true;
        await delete_permohonan_bantuan(id);
        displayNotification('Data permohonan bantuan berhasil dihapus', 'success');
        await fetchData();
      } catch (error: any) {
        displayNotification(error.response.data.error_msg || error.response.data.message, 'error');
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
          Tambah Permohonan Bantuan
        </BaseButton>

        <!-- Search -->
        <div class="flex items-center w-full sm:w-auto gap-2">
          <label for="search" class="mr-2 text-sm font-medium text-gray-600">Filter</label>

          <!-- Kegiatan -->
          <BaseSelect
            v-model="selectedKegiatan"
            :options="kegiatanOption"
            placeholder="Semua Kegiatan"
            @change="fetchData"
          />

          <!-- Status Kegiatan -->
          <BaseSelect
            v-model="selectedStatusKegiatan"
            :options="statusRealisasiOption"
            placeholder="Semua Status"
            @change="fetchData"
          />
          <!-- Search -->
          <input
            id="search"
            type="text"
            v-model="search"
            @change="fetchData"
            placeholder="Cari Nama / NIK Pemohon . . ."
            class="w-full sm:w-86 rounded-lg border-gray-300 shadow-sm px-3 py-2 text-gray-700 focus:border-green-900 focus:ring-2 focus:ring-green-900 transition"
          />
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-hidden rounded-xl border border-gray-200 shadow">
        <SkeletonTable v-if="isTableLoading" :columns="totalColumns" :rows="itemsPerPage" />
        <table v-else class="w-full border-collapse bg-white text-sm">
          <thead class="bg-gray-50 text-gray-700 text-center border-b border-gray-300">
            <tr>
              <th class="w-[30%] px-4 py-3 font-medium">Info Permohonan</th>
              <th class="w-[30%] px-4 py-3 font-medium">Info Penyaluran</th>
              <th class="w-[30%] px-4 py-3 font-medium">Kriteria</th>
              <th class="w-[10%] px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-sm align-top">
            <template v-if="dataPermohonanBantuan.length > 0">
              <tr
                v-for="data in dataPermohonanBantuan"
                :key="data.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-4 py-4 text-start font-medium text-gray-800">
                  <table class="w-full border border-gray-300 rounded-lg">
                    <tbody>
                      <tr class="border-b border-gray-300">
                        <td class="w-[40%] bg-gray-100 px-4 py-2 font-bold">NAMA PEMOHON</td>
                        <td class="px-4 py-2 font-medium w-full text-right">
                          {{ data.Permohonan.member_name }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="bg-gray-100 px-4 py-2 font-bold">TIPE PEMOHON</td>
                        <td class="px-4 py-2 font-bold w-full text-right text-red-600">
                          {{
                            data.Permohonan.member_tipe == 'perorangan' ? 'PERORANGAN' : 'INSTANSI'
                          }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="bg-gray-100 px-4 py-2 font-bold">DESA PEMOHON</td>
                        <td class="px-4 py-2 font-medium w-full text-right">
                          {{ data.Permohonan.desa_name || '-' }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="bg-gray-100 px-4 py-2 font-bold">KEC. PEMOHON</td>
                        <td class="px-4 py-2 font-medium w-full text-right">
                          {{ data.Permohonan.kecamatan_name || '-' }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="bg-gray-100 px-4 py-2 font-bold">INFO BANK</td>
                        <td class="px-4 py-2 font-medium w-full text-right">
                          <p>BANK: {{ data.Permohonan.bank_name }}</p>
                          <p>REK: {{ data.Permohonan.nomor_akun_bank }}</p>
                          <p>AN: {{ data.Permohonan.nama_akun_bank }}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td class="px-4 py-4 text-start font-medium text-gray-800">
                  <table class="w-full border border-gray-300 rounded-lg">
                    <tbody>
                      <tr class="border-b border-gray-300">
                        <td class="w-[40%] bg-gray-100 px-4 py-2 font-bold">NAMA KEGIATAN</td>
                        <td class="px-4 py-2 font-medium w-full text-right">
                          {{ data.Permohonan.Kegiatan.nama_kegiatan }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="bg-gray-100 px-4 py-2 font-bold">JUMLAH DANA</td>
                        <td class="px-4 py-2 font-medium w-full text-right">
                          {{
                            data.Permohonan.Kegiatan.jumlah_dana
                              ? $formatToRupiah(data.Permohonan.Kegiatan.jumlah_dana)
                              : '-'
                          }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="bg-gray-100 px-4 py-2 font-bold">SISA DANA</td>
                        <td class="px-4 py-2 font-bold w-full text-right text-red-600">
                          {{
                            data.Permohonan.Kegiatan.sisa_jumlah_dana
                              ? $formatToRupiah(data.Permohonan.Kegiatan.sisa_jumlah_dana)
                              : '-'
                          }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="bg-gray-100 px-4 py-2 font-bold">SUMBER DANA</td>
                        <td class="px-4 py-2 font-medium w-full text-right">
                          {{ data.Permohonan.Kegiatan.sumber_dana == 'zakat' ? 'ZAKAT' : 'INFAQ' }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="bg-gray-100 px-4 py-2 font-bold">TAHUN KEGIATAN</td>
                        <td class="px-4 py-2 font-medium w-full text-right">
                          {{ data.Permohonan.Kegiatan.tahun }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="bg-gray-100 px-4 py-2 font-bold">STATUS KEGIATAN</td>
                        <td class="px-4 py-2 font-bold w-full text-right text-yellow-600">
                          {{
                            data.Permohonan.Kegiatan.status_kegiatan == 'sedang_berlansung'
                              ? 'SELESAI'
                              : 'SEDANG BERLANGSUNG'
                          }}
                        </td>
                      </tr>
                      <tr class="border border-gray-300">
                        <td class="bg-gray-100 px-4 py-2 font-bold">AREA PENYALURAN</td>
                        <td class="px-4 py-2 font-medium w-full text-right">
                          <span v-if="data.Permohonan.Kegiatan.area_penyaluran === 'semua_pemohon'">
                            SEMUA PEMOHON
                          </span>
                          <span
                            v-else-if="data.Permohonan.Kegiatan.area_penyaluran === 'kabupaten'"
                          >
                            KABUPATEN
                          </span>
                          <span v-else-if="data.Permohonan.Kegiatan.area_penyaluran === 'instansi'">
                            INSTANSI
                          </span>
                          <span
                            v-else-if="data.Permohonan.Kegiatan.area_penyaluran === 'kecamatan'"
                          >
                            KECAMATAN
                          </span>
                          <span v-else-if="data.Permohonan.Kegiatan.area_penyaluran === 'desa'">
                            DESA
                          </span>
                          <span v-else> - </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td class="px-4 py-4 font-medium text-gray-800">
                  <ul class="list-disc list-outside">
                    <li v-for="kriteria in data.Permohonan.Kegiatan.kriteria" :key="kriteria.id">
                      {{ kriteria.name }}
                    </li>
                  </ul>
                </td>
                <td class="px-4 py-4">
                  <div class="flex flex-col gap-2 items-center">
                    <LightButton @click="openModalEdit(data)">
                      <font-awesome-icon icon="fa-solid fa-info" />
                    </LightButton>
                    <YellowButton @click="openModalEditStatus(data)">
                      <font-awesome-icon icon="fa-solid fa-ban" />
                    </YellowButton>
                    <DangerButton @click="deleteData(data.id)">
                      <DeleteIcon />
                    </DangerButton>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr v-else>
              <td :colspan="totalColumns" class="px-4 py-8 text-center text-gray-500">
                <font-awesome-icon
                  icon="fa-solid fa-file-signature"
                  class="text-4xl mb-2 text-gray-400"
                />
                <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data</h3>
                <p class="text-sm">Belum ada data permohonan bantuan.</p>
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
            payload.error_msg || 'Tambah/Update PermohonanBantuan gagal',
            payload.error ? 'error' : 'success',
          )
      "
    />

    <!-- Modal FormEdit -->
    <FormEdit
      :is-modal-open="isModalEditOpen"
      :selected-permohonan-bantuan="selectedPermohonanBantuan"
      @close="
        isModalEditOpen = false;
        fetchData();
      "
      @status="
        (payload: any) =>
          displayNotification(
            payload.error_msg || 'Tambah/Update PermohonanBantuan gagal',
            payload.error ? 'error' : 'success',
          )
      "
    />

    <!-- Modal FormEditStatus -->
    <FormEditStatus
      :is-modal-open="isModalEditStatusOpen"
      :selected-permohonan-bantuan="selectedPermohonanBantuan"
      @close="
        isModalEditStatusOpen = false;
        fetchData();
      "
      @status="
        (payload: any) =>
          displayNotification(
            payload.error_msg || 'Tambah/Update Permohonan Bantuan gagal',
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
