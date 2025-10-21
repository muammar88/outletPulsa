<script setup lang="ts">
// Library
import BaseButton from '@/components/Button/BaseButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import LightButton from '@/components/Button/LightButton.vue';
import YellowButton from '@/components/Button/YellowButton.vue';
import BaseSelect from '@/components/Form/BaseSelect.vue';
import DeleteIcon from '@/components/Icons/DeleteIcon.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import FormAdd from '@/modules/PermohonanBantuan/widgets/FormAdd.vue';
import FormEdit from '@/modules/PermohonanBantuan/widgets/FormEdit.vue';
import FormEditStatus from '@/modules/PermohonanBantuan/widgets/FormEditStatus.vue';
import { onMounted, ref } from 'vue';

// Composable
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';

// Service API
import {
  delete_permohonan_bantuan,
  get_filter_type,
  get_permohonan_bantuan,
} from '@/service/permohonan_bantuan';

// State: Loading
const isLoading = ref(false);
const isTableLoading = ref(false);

// Composable: pagination
const itemsPerPage = ref<number>(10);
const totalColumns = ref<number>(3);

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
const kegiatanOption = ref<{ value: string; label: string }[]>([]);
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

// Function: Format Area Penyaluran
function formatAreaPenyaluran(area: string): string {
  const areaMap: Record<string, string> = {
    semua_pemohon: 'SEMUA PEMOHON',
    kabupaten: 'KABUPATEN',
    instansi: 'INSTANSI',
    kecamatan: 'KECAMATAN',
    desa: 'DESA',
  };
  return areaMap[area] || '-';
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
            placeholder="Cari Nama / NIK Pemohon..."
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
              <th class="w-[60%] px-4 py-3 font-medium">Info Permohonan & Kegiatan</th>
              <th class="w-[40%] px-4 py-3 font-medium">Kriteria Persyaratan</th>
              <th class="w-[10%] px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 text-xs align-top">
            <template v-if="dataPermohonanBantuan.length > 0">
              <tr
                v-for="data in dataPermohonanBantuan"
                :key="data.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <!-- Kolom Info Permohonan & Kegiatan -->
                <td class="px-4 py-4">
                  <!-- Header Card -->
                  <div class="bg-gradient-to-r from-gray-800 to-gray-500 rounded-lg px-4 py-3 mb-3">
                    <div class="flex justify-between items-start">
                      <div>
                        <h3 class="text-white font-bold text-base">
                          {{ data.Permohonan.member_name }}
                        </h3>
                        <p class="text-white text-xs mt-1">
                          {{ data.Permohonan.desa_name || '-' }},
                          {{ data.Permohonan.kecamatan_name || '-' }}
                        </p>
                      </div>
                      <div class="text-right">
                        <span
                          class="inline-block px-2 py-1 bg-white/20 text-white rounded text-xs font-semibold"
                        >
                          {{
                            data.Permohonan.member_tipe === 'perorangan' ? 'PERORANGAN' : 'INSTANSI'
                          }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Info Grid -->
                  <div class="grid grid-cols-2 gap-3">
                    <!-- Info Kegiatan -->
                    <div class="bg-white rounded-lg p-3 space-y-2 shadow-md">
                      <h4 class="font-semibold text-gray-800 text-xs mb-2 flex items-center gap-2">
                        <font-awesome-icon
                          icon="fa-solid fa-calendar-days"
                          class="text-green-600"
                        />
                        Info Kegiatan
                      </h4>
                      <div class="space-y-1 text-xs">
                        <div class="flex justify-between gap-2">
                          <span class="text-gray-600">Kegiatan:</span>
                          <span class="font-semibold text-gray-800 text-right">{{
                            data.Permohonan.Kegiatan.nama_kegiatan
                          }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Total Dana:</span>
                          <span class="font-semibold text-gray-800">
                            {{
                              data.Permohonan.Kegiatan.jumlah_dana
                                ? $formatToRupiah(data.Permohonan.Kegiatan.jumlah_dana)
                                : '-'
                            }}
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Sisa Dana:</span>
                          <span class="font-bold text-red-600">
                            {{
                              data.Permohonan.Kegiatan.sisa_jumlah_dana
                                ? $formatToRupiah(data.Permohonan.Kegiatan.sisa_jumlah_dana)
                                : '-'
                            }}
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Sumber:</span>
                          <span class="font-semibold text-gray-800">
                            {{
                              data.Permohonan.Kegiatan.sumber_dana === 'zakat' ? 'ZAKAT' : 'INFAQ'
                            }}
                          </span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Tahun:</span>
                          <span class="font-semibold text-gray-800">{{
                            data.Permohonan.Kegiatan.tahun
                          }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">Status:</span>
                          <span class="font-bold text-yellow-600">
                            {{
                              data.Permohonan.Kegiatan.status_kegiatan === 'sedang_berlangsung'
                                ? 'BERLANGSUNG'
                                : 'SELESAI'
                            }}
                          </span>
                        </div>
                        <div class="flex justify-between gap-2">
                          <span class="text-gray-600">Area:</span>
                          <span class="font-semibold text-gray-800 text-right">
                            {{ formatAreaPenyaluran(data.Permohonan.Kegiatan.area_penyaluran) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Info Bank -->
                    <div class="bg-white rounded-lg p-3 space-y-2 shadow-md">
                      <h4 class="font-semibold text-gray-800 text-xs mb-2 flex items-center gap-2">
                        <font-awesome-icon
                          icon="fa-solid fa-building-columns"
                          class="text-green-600"
                        />
                        Info Bank
                      </h4>
                      <div class="space-y-1 text-xs">
                        <div class="flex justify-between">
                          <span class="text-gray-600">Bank:</span>
                          <span class="font-semibold text-gray-800">{{
                            data.Permohonan.bank_name
                          }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span class="text-gray-600">No. Rek:</span>
                          <span class="font-semibold text-gray-800">{{
                            data.Permohonan.nomor_akun_bank
                          }}</span>
                        </div>
                        <div class="flex justify-between gap-2">
                          <span class="text-gray-600">A/N:</span>
                          <span class="font-semibold text-gray-800 text-right">{{
                            data.Permohonan.nama_akun_bank
                          }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Info Realisasi -->
                  <div class="mt-3 bg-white border border-gray-100 rounded-lg p-3 shadow-md">
                    <div class="flex justify-between items-center text-xs">
                      <div class="flex items-center gap-2">
                        <font-awesome-icon
                          icon="fa-solid fa-money-bill-wave"
                          class="text-green-600"
                        />
                        <span class="font-semibold text-gray-700">Biaya Disetujui:</span>
                      </div>
                      <span v-if="data.biaya_disetujui" class="font-bold text-green-700">
                        {{ $formatToRupiah(data.biaya_disetujui) }}
                      </span>
                      <span v-else class="font-bold text-red-700">
                        {{ 'Belum disetujui' }}
                      </span>
                    </div>
                    <div
                      v-if="data.nominal_realisasi"
                      class="flex justify-between items-center text-xs mt-2 pt-2 border-t border-green-200"
                    >
                      <div class="flex items-center gap-2">
                        <font-awesome-icon icon="fa-solid fa-check-circle" class="text-green-600" />
                        <span class="font-semibold text-gray-700">Nominal Realisasi:</span>
                      </div>
                      <span class="font-bold text-green-700">
                        {{ $formatToRupiah(data.nominal_realisasi) }}
                      </span>
                    </div>
                  </div>
                </td>

                <!-- Kolom Kriteria -->
                <td class="px-4 py-4">
                  <div class="bg-gray-50 rounded-lg p-4">
                    <h4 class="font-semibold text-gray-800 text-xs mb-3 flex items-center gap-2">
                      <font-awesome-icon icon="fa-solid fa-list-check" class="text-green-600" />
                      Kriteria Persyaratan ({{ data.Permohonan.Kegiatan.kriteria.length }})
                    </h4>
                    <ul class="space-y-2">
                      <li
                        v-for="kriteria in data.Permohonan.Kegiatan.kriteria"
                        :key="kriteria.id"
                        class="flex items-start gap-2 text-xs"
                      >
                        <span
                          class="inline-block w-2 h-2 bg-green-500 rounded-full mt-1 flex-shrink-0"
                        ></span>
                        <span class="text-gray-700">{{ kriteria.name }}</span>
                      </li>
                    </ul>
                    <div
                      v-if="data.Permohonan.Kegiatan.kriteria.length === 0"
                      class="text-center text-gray-400 text-xs py-4"
                    >
                      <font-awesome-icon icon="fa-solid fa-inbox" class="text-2xl mb-2" />
                      <p>Tidak ada kriteria</p>
                    </div>
                  </div>
                </td>

                <!-- Kolom Aksi -->
                <td class="px-4 py-4">
                  <div class="flex flex-col gap-2 items-center">
                    <LightButton @click="openModalEdit(data)" title="Lihat Detail">
                      <font-awesome-icon icon="fa-solid fa-info" />
                    </LightButton>
                    <LightButton @click="openModalEditStatus(data)" title="Edit Status">
                      <font-awesome-icon icon="fa-solid fa-pen" />
                    </LightButton>
                    <DangerButton @click="deleteData(data.id)" title="Hapus">
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
