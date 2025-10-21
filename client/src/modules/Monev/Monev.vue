<script setup lang="ts">
// library
import BaseButton from '@/components/Button/BaseButton.vue';
import DangerButton from '@/components/Button/DangerButton.vue';
import BaseSelect from '@/components/Form/BaseSelect.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import Pagination from '@/components/Pagination/Pagination.vue';
import SkeletonTable from '@/components/SkeletonTable/SkeletonTable.vue';
import FormPertanyaan from '@/modules/Monev/widgets/FormPertanyaan.vue';
import { onMounted, ref } from 'vue';

// Composables
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePaginations';

// Service API
import ButtonGreen from '@/components/Button/ButtonGreen.vue';
import IconDocumentation from '@/components/Icons/IconDocumentation.vue';
import { get_filter_type, monev_list } from '@/service/monev';

// Interface untuk Monev
export interface Monev {
  id: number;
  fullname: string;
  nomor_ktp: string;
  nomor_akun_bank: string;
  nama_kegiatan: string;
  biaya_disetujui: number;
  tanggal_realisasi: string;
  status_realisasi: string;
  datetimes: string;
  jenis_monev: string[];
  status_monitoring: string;
  status_evaluasi: string;
}

const selectedPermohonan = ref({
  id: 0,
  tipe: '',
});

function openModalPertanyaan(id: number, type: string) {
  selectedPermohonan.value.id = id;
  selectedPermohonan.value.tipe = type;
  isModalPertanyaanOpen.value = true;
}

// Function: Modal
const isModalPertanyaanOpen = ref(false);

// State
const dataMonev = ref<Monev[]>([]);
const selectedKegiatan = ref('');
const selectedYear = ref('');
const kegiatanOptions = ref<{ value: string; label: string }[]>([]);
const yearOptions = ref<{ value: string; label: string }[]>([]);
const isTableLoading = ref(false);

// Pagination
const itemsPerPage = ref<number>(100);
const totalColumns = ref<number>(5);
const { currentPage, perPage, totalRow, totalPages, nextPage, prevPage, pageNow, pages } =
  usePagination(fetchData, { perPage: itemsPerPage.value });

// Composables: notification & confirmation
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();
const { showConfirmDialog, confirmTitle, confirmMessage, confirm, cancel } = useConfirmation();

async function fetchData() {
  isTableLoading.value = true;

  try {
    //Ambil daftar monev
    const [res, filterRes] = await Promise.all([
      monev_list({
        perPage: perPage.value,
        pageNumber: currentPage.value,
        type_kegiatan: selectedKegiatan.value,
        type_year: selectedYear.value,
      }),
      get_filter_type(),
    ]);

    dataMonev.value = res.data;
    totalRow.value = res.total;
    kegiatanOptions.value = filterRes.data.type_kegiatan;
    yearOptions.value = filterRes.data.type_year;
    console.log(filterRes.data);
    console.log(dataMonev.value);
  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    isTableLoading.value = false;
  }
}

onMounted(async () => {
  await fetchData();
});
</script>

<template>
  <div class="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg min-h-screen">
    <!-- Filter Section -->
    <div class="flex gap-4 justify-end items-center mb-4">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-700">Filter:</span>
      </div>
      <BaseSelect
        v-model="selectedKegiatan"
        :options="kegiatanOptions"
        placeholder="Semua Kegiatan"
        class="min-w-[200px]"
        @change="fetchData"
      />
      <BaseSelect
        v-model="selectedYear"
        :options="yearOptions"
        placeholder="Semua Tahun"
        class="min-w-[150px]"
        @change="fetchData"
      />
    </div>

    <!-- Table Section -->
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <SkeletonTable v-if="isTableLoading" :columns="5" :rows="itemsPerPage" />
      <div v-else class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead class="bg-gray-100 text-gray-700 text-center border-b border-gray-300">
            <tr>
              <th class="px-6 py-4 font-semibold text-sm tracking-wider w-[28%]">Info Pemohon</th>
              <th class="px-6 py-4 font-semibold text-sm tracking-wider w-[28%]">
                Info Program Bantuan
              </th>
              <th class="px-6 py-4 font-semibold text-sm tracking-wider w-[22%]">Info Monev</th>
              <th class="px-6 py-4 font-semibold text-sm tracking-wider w-[12%]">Datetimes</th>
              <th class="px-6 py-4 font-semibold text-sm tracking-wider w-[10%]">Aksi</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="(item, index) in dataMonev"
              :key="index"
              class="hover:bg-gray-50 transition-all duration-200 group"
            >
              <!-- Info Pemohon -->
              <td class="align-top px-4 py-4">
                <div
                  class="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                >
                  <table class="w-full">
                    <tbody>
                      <tr class="border-b border-gray-200">
                        <th
                          class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 text-left font-semibold text-xs text-gray-900 uppercase w-[45%]"
                        >
                          Nama Pemohon
                        </th>
                        <td class="px-4 py-3 text-sm text-gray-800 font-medium">
                          {{ item.fullname }}
                        </td>
                      </tr>
                      <tr class="border-b border-gray-200">
                        <th
                          class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 text-left font-semibold text-xs text-gray-900 uppercase"
                        >
                          Nomor KTP
                        </th>
                        <td class="px-4 py-3 text-sm text-gray-700 font-mono">
                          {{ item.nomor_ktp }}
                        </td>
                      </tr>
                      <tr>
                        <th
                          class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 text-left font-semibold text-xs text-gray-900 uppercase"
                        >
                          Nomor Rekening
                        </th>
                        <td class="px-4 py-3 text-sm text-gray-700 font-mono">
                          {{ item.nomor_akun_bank }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>

              <!-- Info Program Bantuan -->
              <td class="align-top px-4 py-4">
                <div
                  class="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                >
                  <table class="w-full">
                    <tbody>
                      <tr class="border-b border-gray-200">
                        <th
                          class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 text-left font-semibold text-xs text-gray-900 uppercase w-[45%]"
                        >
                          Nama Kegiatan
                        </th>
                        <td class="px-4 py-3 text-sm text-gray-800 font-medium">
                          {{ item.nama_kegiatan }}
                        </td>
                      </tr>
                      <tr class="border-b border-gray-200">
                        <th
                          class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 text-left font-semibold text-xs text-gray-900 uppercase"
                        >
                          Biaya Disetujui
                        </th>
                        <td class="px-4 py-3 text-sm text-gray-800 font-semibold">
                          {{
                            item.biaya_disetujui === null
                              ? '0'
                              : $formatToRupiah(item.biaya_disetujui)
                          }}
                        </td>
                      </tr>
                      <tr class="border-b border-gray-200">
                        <th
                          class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 text-left font-semibold text-xs text-gray-900 uppercase"
                        >
                          Status Realisasi
                        </th>
                        <td class="px-4 py-3">
                          <span
                            :class="
                              item.status_realisasi === 'sudah_direalisasi'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-orange-100 text-orange-800 border-orange-300'
                            "
                            class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border"
                          >
                            <span
                              :class="
                                item.status_realisasi === 'sudah_direalisasi'
                                  ? 'bg-green-500'
                                  : 'bg-orange-500'
                              "
                              class="w-2 h-2 rounded-full mr-2"
                            ></span>
                            {{
                              item.status_realisasi === 'sudah_direalisasi'
                                ? 'Sudah Direalisasi'
                                : 'Belum Direalisasi'
                            }}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th
                          class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 text-left font-semibold text-xs text-gray-900 uppercase"
                        >
                          Tanggal Realisasi
                        </th>
                        <td class="px-4 py-3 text-sm text-gray-700">
                          {{ item.tanggal_realisasi || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>

              <!-- Info Monev -->
              <td class="align-top px-4 py-4">
                <div
                  class="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 overflow-hidden shadow-sm"
                >
                  <table class="w-full">
                    <tbody>
                      <tr class="border-b border-gray-200">
                        <th
                          class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 text-left font-semibold text-xs text-gray-900 uppercase w-[45%]"
                        >
                          Jenis Monev
                        </th>
                        <td class="px-4 py-3">
                          <div class="flex flex-wrap gap-1.5">
                            <span
                              v-for="(jenis, idx) in item.jenis_monev"
                              :key="idx"
                              class="inline-flex items-center bg-gradient-to-r from-green-700 to-green-600 text-white px-2.5 py-1 rounded-md text-xs font-medium shadow-sm"
                            >
                              {{
                                jenis
                                  .replace('monitoring_', 'M: ')
                                  .replace('evaluasi_', 'E: ')
                                  .replace(/_/g, ' ')
                                  .toUpperCase()
                              }}
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr class="border-b border-gray-200">
                        <th
                          class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 text-left font-semibold text-xs text-gray-900 uppercase"
                        >
                          Status Monitoring
                        </th>
                        <td class="px-4 py-3">
                          <span
                            :class="
                              item.status_monitoring === 'selesai'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-gray-100 text-gray-600 border-gray-300'
                            "
                            class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border"
                          >
                            {{
                              item.status_monitoring ? item.status_monitoring.toUpperCase() : '-'
                            }}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th
                          class="bg-gradient-to-r from-gray-100 to-gray-50 px-4 py-3 text-left font-semibold text-xs text-gray-900 uppercase"
                        >
                          Status Evaluasi
                        </th>
                        <td class="px-4 py-3">
                          <span
                            :class="
                              item.status_evaluasi === 'selesai'
                                ? 'bg-green-100 text-green-800 border-green-300'
                                : 'bg-gray-100 text-gray-600 border-gray-300'
                            "
                            class="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border"
                          >
                            {{ item.status_evaluasi ? item.status_evaluasi.toUpperCase() : '-' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>

              <!-- Datetimes -->
              <td class="px-4 py-4 text-center align-middle text-sm">
                {{ item.datetimes }}
              </td>

              <!-- Aksi -->
              <td class="align-middle text-center px-4 py-4">
                <div class="flex flex-col justify-center gap-2">
                  <ButtonGreen
                    class="w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                    @click="openModalPertanyaan(item.id, 'evaluasi')"
                  >
                    <IconDocumentation class="w-6 h-4" />
                    <span>Evaluasi</span>
                  </ButtonGreen>
                  <DangerButton
                    class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-2.5 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                    @click="openModalPertanyaan(item.id, 'monitoring')"
                  >
                    <IconDocumentation class="w-6 h-4" />
                    <span>Monitoring</span>
                  </DangerButton>
                </div>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="dataMonev.length === 0">
              <td :colspan="totalColumns" class="text-center py-12">
                <div class="flex flex-col items-center justify-center">
                  <div class="bg-gray-100 rounded-full p-6 mb-4">
                    <svg
                      class="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <p class="text-gray-500 font-medium text-lg">Tidak ada data tersedia</p>
                  <p class="text-gray-400 text-sm mt-1">
                    Silakan ubah filter atau tambahkan data baru
                  </p>
                </div>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <Pagination
              :current-page="currentPage"
              :total-pages="totalPages"
              :total-columns="totalColumns"
              :total-row="totalRow"
              :next-page="nextPage"
              :prev-page="prevPage"
              :pages="pages"
              :page-now="pageNow"
            />
          </tfoot>
        </table>
      </div>
    </div>

    <!-- Modal FormPertanyaan -->
    <FormPertanyaan
      :is-modal-open="isModalPertanyaanOpen"
      :permohonan_id="selectedPermohonan.id"
      :tipe="selectedPermohonan.tipe"
      @close="((isModalPertanyaanOpen = false), fetchData())"
      @status="
        (payload: any) =>
          displayNotification(
            payload.error_msg || 'Gagal mengirim jawaban',
            payload.error ? 'error' : 'success',
          )
      "
    />

    <!-- Notification & Confirmation -->
    <Confirmation
      :showConfirmDialog="showConfirmDialog"
      :confirmTitle="confirmTitle"
      :confirmMessage="confirmMessage"
    >
      <BaseButton variant="secondary" @click="cancel">Batal</BaseButton>
      <BaseButton variant="danger" @click="confirm">Ya, Hapus</BaseButton>
    </Confirmation>

    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="showNotification = false"
    />
  </div>
</template>
