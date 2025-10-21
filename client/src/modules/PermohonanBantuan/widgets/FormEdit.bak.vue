<script setup lang="ts">
// Library
import BaseButton from '@/components/Button/BaseButton.vue';
import InputFile from '@/components/Form/InputFile.vue';
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import Notification from '@/components/Modal/Notification.vue';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Composable
import { useNotification } from '@/composables/useNotification';

// Service
import {
  edit_permohonan_bantuan,
  get_info_edit_permohonan_bantuan,
  get_list_bank,
  get_list_kegiatan,
  get_list_member,
  get_list_syarat,
} from '@/service/permohonan_bantuan';

// Types
interface SyaratFile {
  id: number;
  name: string;
  path: string;
  syarat_id: number;
}

interface DokumenData {
  id?: number;
  file: File | null;
  file_name?: string;
  path: string;
  status: 'new' | 'keep' | 'replace' | 'remove';
  syarat_id: number;
}

interface Props {
  isModalOpen: boolean;
  selectedPermohonanBantuan: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error_msg?: string; error?: boolean }): void;
}>();

// State: Loading
const isLoading = ref(false);
const isSubmitting = ref(false);

// Composable: notification
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

// Data
const dataKegiatan = ref<Array<{ id: number; name: string }>>([]);
const dataBank = ref<Array<{ id: number; name: string }>>([]);
const dataMember = ref<Array<{ id: number; name: string }>>([]);
const dataKriteriaSyarat = ref<{
  kriteria: Array<{ id: number; name: string }>;
  syarat: Array<SyaratFile>;
}>({
  kriteria: [],
  syarat: [],
});

// State untuk tracking kegiatan awal
const initialKegiatanId = ref<number | null>(null);
const initialSyaratMap = ref<Map<number, any>>(new Map());

// Form
const form = ref<{
  kegiatan_id: number | null;
  bank_id: number | null;
  member_id: number | null;
  nomor_rekening: string;
  atas_nama: string;
}>({
  kegiatan_id: null,
  bank_id: null,
  member_id: null,
  nomor_rekening: '',
  atas_nama: '',
});

const formUploadDynamic = ref<Record<string, DokumenData>>({});
const errors = ref<Record<string, string>>({});

// State untuk perubahan kegiatan
const kegiatanBerubah = ref(false);
const perubahanSyarat = ref<{
  dipertahankan: Array<{ path: string; nama_syarat: string }>;
  dihapus: Array<{ path: string; nama_syarat: string }>;
  perlu_upload: Array<{ syarat_id: number; nama_syarat: string; path: string }>;
}>({
  dipertahankan: [],
  dihapus: [],
  perlu_upload: [],
});

// Function: Reset form
const resetForm = () => {
  form.value = {
    kegiatan_id: null,
    bank_id: null,
    member_id: null,
    nomor_rekening: '',
    atas_nama: '',
  };

  formUploadDynamic.value = {};
  errors.value = {};
  kegiatanBerubah.value = false;
  perubahanSyarat.value = {
    dipertahankan: [],
    dihapus: [],
    perlu_upload: [],
  };
  initialKegiatanId.value = null;
  initialSyaratMap.value.clear();
};

// Function: Close modal
const closeModal = () => {
  if (isSubmitting.value) return;
  resetForm();
  emit('close');
};

// Function: Fetch initial data
async function fetchData() {
  if (!props.selectedPermohonanBantuan?.id) {
    displayNotification('Gagal memuat data. Silakan coba lagi.', 'error');
    return;
  }

  isLoading.value = true;
  try {
    const [InitialResponse, kegiatanResponse, bankResponse, memberResponse] = await Promise.all([
      get_info_edit_permohonan_bantuan(props.selectedPermohonanBantuan.id),
      get_list_kegiatan(),
      get_list_bank(),
      get_list_member(),
    ]);

    // Init form basic
    form.value = {
      kegiatan_id: InitialResponse.data.permohonan.kegiatan_id,
      bank_id: InitialResponse.data.permohonan.bank_id,
      member_id: InitialResponse.data.permohonan.member_id,
      nomor_rekening: InitialResponse.data.permohonan.nomor_akun_bank,
      atas_nama: InitialResponse.data.permohonan.nama_akun_bank,
    };

    // Simpan kegiatan awal
    initialKegiatanId.value = InitialResponse.data.permohonan.kegiatan_id;

    dataKegiatan.value = kegiatanResponse.data;
    dataBank.value = bankResponse.data;
    dataMember.value = [
      {
        id: InitialResponse.data.member.id,
        name: InitialResponse.data.member.fullname,
      },
      ...memberResponse.data,
    ];

    // Fetch syarat kegiatan awal
    await fetchKriteriaSyarat(initialKegiatanId.value!);

    // Init formUploadDynamic dengan dokumen existing
    InitialResponse.data.syarat.forEach((syarat: any, index: number) => {
      const syaratKegiatan = dataKriteriaSyarat.value.syarat[index];

      if (syaratKegiatan) {
        formUploadDynamic.value[`dokumen_${syaratKegiatan.path}`] = {
          id: syarat.id,
          file: null,
          file_name: syarat.path,
          path: syarat.path,
          status: 'keep',
          syarat_id: syaratKegiatan.syarat_id,
        };

        // Simpan map syarat awal berdasarkan syarat_id
        initialSyaratMap.value.set(syaratKegiatan.syarat_id, {
          dokumen_id: syarat.id,
          path: syarat.path,
          key: `dokumen_${syaratKegiatan.path}`,
        });
      }
    });

    console.log('Initial data loaded:', {
      form: form.value,
      formUploadDynamic: formUploadDynamic.value,
      initialSyaratMap: Array.from(initialSyaratMap.value.entries()),
    });
  } catch (error: any) {
    displayNotification('Gagal memuat data. Silakan coba lagi.', 'error');
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
  }
}

// Function: Fetch syarat kegiatan
async function fetchKriteriaSyarat(kegiatan_id: number) {
  isLoading.value = true;
  try {
    const syaratResponse = await get_list_syarat(kegiatan_id);
    dataKriteriaSyarat.value = syaratResponse.data;
  } catch (error: any) {
    displayNotification('Gagal memuat data syarat. Silakan coba lagi.', 'error');
    console.error('Error fetching syarat data:', error);
  } finally {
    isLoading.value = false;
  }
}

// Function: Analisis perubahan syarat saat kegiatan berubah
async function analisaPerubahanSyarat(kegiatanBaruId: number) {
  kegiatanBerubah.value = initialKegiatanId.value !== kegiatanBaruId;

  if (!kegiatanBerubah.value) {
    perubahanSyarat.value = {
      dipertahankan: [],
      dihapus: [],
      perlu_upload: [],
    };
    return;
  }

  // Fetch syarat kegiatan baru
  await fetchKriteriaSyarat(kegiatanBaruId);

  // Buat map syarat baru berdasarkan syarat_id
  const syaratBaruMap = new Map(dataKriteriaSyarat.value.syarat.map((s) => [s.syarat_id, s]));

  const dipertahankan: Array<{ path: string; nama_syarat: string }> = [];
  const dihapus: Array<{ path: string; nama_syarat: string }> = [];
  const perlu_upload: Array<{ syarat_id: number; nama_syarat: string; path: string }> = [];

  // Buat formUploadDynamic baru
  const newFormUpload: Record<string, DokumenData> = {};

  // Cek dokumen lama
  initialSyaratMap.value.forEach((dokumenInfo, syaratId) => {
    if (syaratBaruMap.has(syaratId)) {
      // Syarat masih ada - PERTAHANKAN
      const syaratBaru = syaratBaruMap.get(syaratId)!;
      const newKey = `dokumen_${syaratBaru.path}`;

      newFormUpload[newKey] = {
        id: dokumenInfo.dokumen_id,
        file: null,
        file_name: dokumenInfo.path,
        path: dokumenInfo.path,
        status: 'keep',
        syarat_id: syaratBaru.syarat_id,
      };

      dipertahankan.push({
        path: dokumenInfo.path,
        nama_syarat: syaratBaru.name,
      });

      // Remove dari map agar tidak diproses sebagai syarat baru
      syaratBaruMap.delete(syaratId);
    } else {
      // Syarat tidak ada - HAPUS
      dihapus.push({
        path: dokumenInfo.path,
        nama_syarat: 'Syarat tidak diperlukan',
      });

      // Tandai untuk dihapus
      newFormUpload[dokumenInfo.key] = {
        id: dokumenInfo.dokumen_id,
        file: null,
        path: dokumenInfo.path,
        status: 'remove',
        syarat_id: 0, // dummy
      };
    }
  });

  // Syarat yang tersisa = syarat baru yang perlu upload
  syaratBaruMap.forEach((syarat) => {
    perlu_upload.push({
      syarat_id: syarat.syarat_id,
      nama_syarat: syarat.name,
      path: syarat.path,
    });

    // Tambahkan ke form upload dengan status 'new'
    newFormUpload[`dokumen_${syarat.path}`] = {
      file: null,
      path: '',
      status: 'new',
      syarat_id: syarat.syarat_id,
    };
  });

  // Update state
  perubahanSyarat.value = { dipertahankan, dihapus, perlu_upload };
  formUploadDynamic.value = newFormUpload;

  console.log('Analisis perubahan syarat:', {
    dipertahankan,
    dihapus,
    perlu_upload,
    newFormUpload,
  });
}

// Function: Handle file upload
const handleFile = (file: File | null, path: string) => {
  const key = `dokumen_${path}`;

  if (!formUploadDynamic.value[key]) {
    console.warn(`Key ${key} tidak ditemukan di formUploadDynamic`);
    return;
  }

  const existingData = formUploadDynamic.value[key];

  if (file) {
    // User upload file baru
    formUploadDynamic.value[key] = {
      ...existingData,
      file: file,
      file_name: file.name,
      status: existingData.id ? 'replace' : 'new',
    };
  } else {
    // User clear file
    if (existingData.status === 'new') {
      // Kalo new, kembalikan ke null
      formUploadDynamic.value[key] = {
        ...existingData,
        file: null,
        status: 'new',
      };
    } else {
      // Kalo existing, kembalikan ke 'keep'
      formUploadDynamic.value[key] = {
        ...existingData,
        file: null,
        status: 'keep',
      };
    }
  }

  errors.value[key] = '';
  console.log(`File updated for ${key}:`, formUploadDynamic.value[key]);
};

// Function: Validate form
const validateForm = () => {
  let isValid = true;
  errors.value = {};

  // Validate basic fields
  if (!form.value.kegiatan_id) {
    errors.value.kegiatan_id = 'Kegiatan harus diisi';
    isValid = false;
  }

  if (!form.value.bank_id) {
    errors.value.bank_id = 'Bank harus diisi';
    isValid = false;
  }

  if (!form.value.member_id) {
    errors.value.member_id = 'Member harus diisi';
    isValid = false;
  }

  if (!form.value.nomor_rekening.trim()) {
    errors.value.nomor_rekening = 'Nomor rekening harus diisi';
    isValid = false;
  } else if (!/^\d{10,16}$/.test(form.value.nomor_rekening)) {
    errors.value.nomor_rekening = 'Nomor rekening harus 10-16 digit angka';
    isValid = false;
  }

  if (!form.value.atas_nama.trim()) {
    errors.value.atas_nama = 'Atas nama harus diisi';
    isValid = false;
  }

  // Validate dokumen
  dataKriteriaSyarat.value.syarat.forEach((syarat) => {
    const key = `dokumen_${syarat.path}`;
    const dokumen = formUploadDynamic.value[key];

    if (!dokumen) {
      errors.value[key] = `${syarat.name} harus diunggah`;
      isValid = false;
      return;
    }

    // Validasi berdasarkan status
    if (dokumen.status === 'new' && !dokumen.file) {
      errors.value[key] = `${syarat.name} harus diunggah`;
      isValid = false;
    } else if (dokumen.status === 'keep' && !dokumen.id) {
      errors.value[key] = `${syarat.name} tidak valid`;
      isValid = false;
    }
  });

  return isValid;
};

// Function: Handle submit
const handleSubmit = async () => {
  if (!validateForm()) {
    displayNotification('Mohon lengkapi semua field yang diperlukan', 'error');
    return;
  }

  isSubmitting.value = true;

  const formData = new FormData();

  // ID permohonan
  formData.append('id', String(props.selectedPermohonanBantuan.id));

  // Append dokumen
  Object.entries(formUploadDynamic.value).forEach(([key, data]) => {
    // Skip dokumen yang akan dihapus (sudah di-handle backend)
    if (data.status === 'remove') {
      formData.append(
        `${key}_meta`,
        JSON.stringify({
          id: data.id,
          status: 'remove',
        }),
      );
      return;
    }

    // Append file jika ada
    if (data.file) {
      formData.append(key, data.file);
    }

    // Append metadata
    const meta: any = {
      status: data.status,
      syarat_id: data.syarat_id,
    };

    if (data.id) {
      meta.id = data.id;
    }

    if (data.path) {
      meta.path = data.path;
    }

    if (data.file_name) {
      meta.file_name = data.file_name;
    }

    formData.append(`${key}_meta`, JSON.stringify(meta));
  });

  // Append form fields
  Object.entries(form.value).forEach(([key, value]) => {
    formData.append(key, String(value));
  });

  // Debug
  console.log('FormData yang dikirim:');
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }

  try {
    const response = await edit_permohonan_bantuan(formData);
    console.log('Response:', response);
    emit('status', { error_msg: response.error_msg || response, error: response.error });
    closeModal();
  } catch (error: any) {
    console.error('Error submit:', error);
    displayNotification(
      error.response?.data?.error_msg || error.response?.data?.message || 'Terjadi kesalahan',
      'error',
    );
  } finally {
    isSubmitting.value = false;
  }
};

// Function: Handle escape
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isModalOpen) closeModal();
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
});

// Watch: Modal open
watch(
  () => props.isModalOpen,
  (newVal) => {
    if (newVal) {
      fetchData();
    }
  },
);

// Watch: Kegiatan berubah
watch(
  () => form.value.kegiatan_id,
  async (newVal, oldVal) => {
    if (newVal !== null && oldVal !== undefined && oldVal !== null) {
      // User mengganti kegiatan setelah form ter-load
      await analisaPerubahanSyarat(newVal);
    } else if (newVal === null) {
      dataKriteriaSyarat.value = { kriteria: [], syarat: [] };
      formUploadDynamic.value = {};
    }
  },
);
</script>

<template>
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
    enter-to-class="opacity-100 translate-y-0 sm:scale-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100 translate-y-0 sm:scale-100"
    leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
  >
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <LoadingSpinner v-if="isLoading" label="Memuat halaman..." />
      <div v-else class="relative max-w-4xl w-full bg-white shadow-2xl rounded-2xl p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 id="modal-title" class="text-xl font-bold text-gray-800">Edit Permohonan Bantuan</h2>
          <button
            class="text-gray-400 text-lg hover:text-gray-600"
            @click="closeModal"
            aria-label="Tutup modal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <div class="px-1 py-1 space-y-4 max-h-[64vh] overflow-y-auto pr-2">
          <!-- Alert Perubahan Kegiatan -->
          <div
            v-if="kegiatanBerubah"
            class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg"
          >
            <div class="flex items-start gap-3">
              <font-awesome-icon
                icon="fa-solid fa-exclamation-triangle"
                class="text-amber-500 mt-1"
              />
              <div class="flex-1 space-y-2">
                <h3 class="font-semibold text-amber-800">
                  Kegiatan Berubah - Perhatikan Perubahan Dokumen
                </h3>

                <div v-if="perubahanSyarat.dipertahankan.length > 0" class="text-sm">
                  <p class="font-medium text-green-700">
                    ✓ Dokumen Dipertahankan ({{ perubahanSyarat.dipertahankan.length }}):
                  </p>
                  <ul class="ml-4 list-disc text-gray-700">
                    <li v-for="item in perubahanSyarat.dipertahankan" :key="item.path">
                      {{ item.nama_syarat }} - {{ item.path }}
                    </li>
                  </ul>
                </div>

                <div v-if="perubahanSyarat.dihapus.length > 0" class="text-sm">
                  <p class="font-medium text-red-700">
                    ✗ Dokumen Akan Dihapus ({{ perubahanSyarat.dihapus.length }}):
                  </p>
                  <ul class="ml-4 list-disc text-gray-700">
                    <li v-for="item in perubahanSyarat.dihapus" :key="item.path">
                      {{ item.path }}
                    </li>
                  </ul>
                </div>

                <div v-if="perubahanSyarat.perlu_upload.length > 0" class="text-sm">
                  <p class="font-medium text-blue-700">
                    ↑ Perlu Upload Dokumen Baru ({{ perubahanSyarat.perlu_upload.length }}):
                  </p>
                  <ul class="ml-4 list-disc text-gray-700">
                    <li v-for="item in perubahanSyarat.perlu_upload" :key="item.syarat_id">
                      {{ item.nama_syarat }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Kegiatan -->
          <div>
            <SelectField
              id="kegiatan_id"
              v-model="form.kegiatan_id"
              :options="[{ id: null, name: 'Pilih Kegiatan' }, ...dataKegiatan]"
              label="Pilih Kegiatan"
              placeholder="Pilih kegiatan"
              :required="true"
              :error="errors.kegiatan_id"
            />
          </div>

          <!-- Kriteria -->
          <div v-if="dataKriteriaSyarat.kriteria.length" class="space-y-2">
            <h3 class="text-sm font-medium text-gray-700">Kriteria:</h3>
            <ul
              class="px-6 py-2 list-disc list-outside text-gray-600 bg-gray-200 rounded-lg border border-gray-300"
            >
              <li v-for="kriteria in dataKriteriaSyarat.kriteria" :key="kriteria.id">
                {{ kriteria.name }}
              </li>
            </ul>
          </div>

          <!-- Syarat / Dokumen -->
          <div
            v-if="dataKriteriaSyarat.syarat.length"
            class="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div v-for="syaratFile in dataKriteriaSyarat.syarat" :key="syaratFile.id">
              <InputFile
                :id="`dokumen_${syaratFile.path}`"
                :label="syaratFile.name"
                :error="errors[`dokumen_${syaratFile.path}`]"
                :initial-file-name="formUploadDynamic[`dokumen_${syaratFile.path}`]?.file_name"
                :accept="'.pdf'"
                :showPreview="false"
                :maxSize="1000"
                :required="true"
                @file-selected="handleFile($event, syaratFile.path)"
              />
            </div>
          </div>

          <!-- Bank & Rekening -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <SelectField
                id="bank_id"
                v-model="form.bank_id"
                :options="[{ id: null, name: 'Pilih Bank' }, ...dataBank]"
                label="Pilih Bank"
                placeholder="Pilih bank"
                :required="true"
                :error="errors.bank_id"
              />
            </div>
            <div>
              <InputText
                id="nomor_rekening"
                v-model="form.nomor_rekening"
                label="Nomor Rekening"
                placeholder="Masukkan nomor rekening"
                :error="errors.nomor_rekening"
                :required="true"
                maxlength="16"
              />
            </div>
            <div>
              <InputText
                id="atas_nama"
                v-model="form.atas_nama"
                label="Atas Nama"
                placeholder="Masukkan atas nama"
                :required="true"
                :error="errors.atas_nama"
              />
            </div>
            <div>
              <SelectField
                id="member_id"
                v-model="form.member_id"
                :options="[{ id: null, name: 'Pilih Member' }, ...dataMember]"
                label="Pilih Member"
                placeholder="Pilih member"
                :required="true"
                :error="errors.member_id"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3">
          <BaseButton
            @click="closeModal"
            type="button"
            :disabled="isSubmitting"
            variant="secondary"
          >
            Batal
          </BaseButton>
          <BaseButton
            type="submit"
            variant="primary"
            :disabled="isSubmitting"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">Menyimpan...</span>
            <span v-else>Simpan</span>
          </BaseButton>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
