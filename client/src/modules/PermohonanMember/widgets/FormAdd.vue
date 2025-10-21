<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import Notification from '@/components/Modal/Notification.vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import InputFile from '@/components/Form/InputFilePdf.vue';
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import { useNotification } from '@/composables/useNotification';

import { get_info_member, daftar_bank, add_permohonan } from '@/service/permohonan_member';

const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

interface Props {
  isModalOpen: boolean;
  id_kegiatan: number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error_msg?: string; error?: boolean }): void;
}>();

// ========== DEKLARASI VARIABEL REAKTIF (harus di atas) ==========
const formUploadDynamic = ref<Record<string, File | null>>({});
const dataBank = ref<Array<{ id: number; name: string | null }>>([]);
const isSubmitting = ref(false);

// Form data
const form = ref({
  nama_pemohon: '',
  member_id: '',
  nomor_ktp: '',
  nomor_whatsapp: '',
  bank_id: null as number | null,
  nomor_rekening: '',
  atas_nama: '',
});

// Errors
const errors = ref<Record<string, string>>({});

// ========== FUNGSI-FUNGSI ==========

// Fetch data member
const fetchData = async () => {
  try {
    const response = await get_info_member();
    console.log('Response get_info_member:', response); // Debug

    form.value.nama_pemohon = response.nama_pemohon || '';
    form.value.member_id = response.member_id || response.id || '';
    form.value.nomor_ktp = response.nomor_ktp || '';
    form.value.nomor_whatsapp = response.whatsapp_number || response.nomor_whatsapp || '';
  } catch (error) {
    console.error('Error fetching member data:', error);
  }
};

// Get list bank
const listBank = async () => {
  try {
    const response = await daftar_bank();
    dataBank.value = response.data || [];
  } catch (error) {
    console.error('Error fetching bank list:', error);
  }
};

// Validate form
const validateForm = () => {
  let isValid = true;
  errors.value = {};

  console.log('Validating form:', form.value); // Debug
  console.log('File uploads:', formUploadDynamic.value); // Debug

  // Validasi text fields
  if (!form.value.nama_pemohon || !form.value.nama_pemohon.trim()) {
    errors.value.nama_pemohon = 'Nama pemohon tidak boleh kosong.';
    isValid = false;
  }

  if (!form.value.nomor_ktp || !form.value.nomor_ktp.trim()) {
    errors.value.nomor_ktp = 'Nomor KTP tidak boleh kosong.';
    isValid = false;
  }

  if (!form.value.nomor_whatsapp || !form.value.nomor_whatsapp.trim()) {
    errors.value.nomor_whatsapp = 'Nomor WhatsApp tidak boleh kosong.';
    isValid = false;
  }

  // Validasi file uploads
  if (!formUploadDynamic.value.dokumen_foto_ktp) {
    errors.value.foto_ktp = 'Fotokopi KTP wajib diisi.';
    isValid = false;
  }

  if (!formUploadDynamic.value.dokumen_foto_kk) {
    errors.value.foto_kk = 'Fotokopi KK wajib diisi.';
    isValid = false;
  }

  if (!formUploadDynamic.value.dokumen_surat_tidak_mampu) {
    errors.value.surat_tidak_mampu = 'Surat keterangan tidak mampu wajib diisi.';
    isValid = false;
  }

  if (!formUploadDynamic.value.dokumen_surat_keterangan) {
    errors.value.surat_keterangan = 'Surat keterangan wajib diisi.';
    isValid = false;
  }

  if (!formUploadDynamic.value.dokumen_surat_rujukan) {
    errors.value.surat_rujukan = 'Surat rujukan wajib diisi.';
    isValid = false;
  }

  if (!formUploadDynamic.value.dokumen_foto_buku_rekening) {
    errors.value.foto_buku_rekening = 'Fotokopi buku rekening wajib diisi.';
    isValid = false;
  }

  // Validasi bank info
  if (!form.value.bank_id) {
    errors.value.bank_id = 'Bank tidak boleh kosong.';
    isValid = false;
  }

  if (!form.value.nomor_rekening || !form.value.nomor_rekening.trim()) {
    errors.value.nomor_rekening = 'Nomor rekening tidak boleh kosong.';
    isValid = false;
  }

  if (!form.value.atas_nama || !form.value.atas_nama.trim()) {
    errors.value.atas_nama = 'Atas nama tidak boleh kosong.';
    isValid = false;
  }

  console.log('Validation result:', isValid, errors.value); // Debug
  return isValid;
};

// Handle file upload
const handleFileUpload = (field: string) => (file: File | null) => {
  if (!file) {
    formUploadDynamic.value[`dokumen_${field}`] = null;
    return;
  }

  const fileSizeKB = Math.round(file.size / 1024);
  if (fileSizeKB > 1000) {
    errors.value[field] = 'Ukuran file maksimal 1000 KB';
    return;
  }

  formUploadDynamic.value[`dokumen_${field}`] = file;
  errors.value[field] = '';
  console.log(`File uploaded for ${field}:`, file.name); // Debug
};

// Submit handler
const handleSubmit = async () => {
  if (!validateForm()) {
    console.log('Validation failed'); // Debug
    return;
  }

  isSubmitting.value = true;

  const formData = new FormData();

  // Append form fields
  formData.append('kegiatan_id', props.id_kegiatan);

  // Append member_id jika ada
  if (form.value.member_id) {
    formData.append('member_id', form.value.member_id);
  }

  // Append other form fields
  Object.entries(form.value).forEach(([key, value]) => {
    if (value !== null && value !== '' && key !== 'nama_pemohon' && key !== 'member_id') {
      formData.append(key, value as string | Blob);
    }
  });

  // Append files
  Object.entries(formUploadDynamic.value).forEach(([key, file]) => {
    if (file) {
      formData.append(key, file);
    }
  });

  console.log('Isi formData:');
  formData.forEach((value, key) => {
    console.log(`${key}:`, value);
  });

  try {
    const response = await add_permohonan(formData);

    console.log('Submit response:', response);
    emit('status', { error_msg: response.error_msg || response, error: response.error });
    displayNotification(
      response.error_msg || 'Data berhasil disimpan!',
      response.error ? 'error' : 'success',
    );
  } catch (error: any) {
    console.error('Submit error:', error);
    displayNotification(
      error.response?.data?.error_msg ||
        error.response?.data?.message ||
        'Terjadi kesalahan saat menyimpan data.',
      'error',
    );
  } finally {
    isSubmitting.value = false;
    closeModal();
  }
};

// Close modal
const closeModal = () => {
  if (isSubmitting.value) return;
  resetForm();
  emit('close');
};

// Reset form
const resetForm = () => {
  form.value = {
    nama_pemohon: '',
    member_id: '',
    nomor_ktp: '',
    nomor_whatsapp: '',
    bank_id: null,
    nomor_rekening: '',
    atas_nama: '',
  };
  formUploadDynamic.value = {};
  errors.value = {};
};

// Handle escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isModalOpen) closeModal();
};

// ========== LIFECYCLE HOOKS ==========
onMounted(() => {
  fetchData();
  listBank();
  document.addEventListener('keydown', handleEscape);
});

watch(
  () => props.id_kegiatan,
  (newVal) => {
    if (newVal) {
      console.log('🔥 props.id_kegiatan udah ready:', newVal);
    }
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleEscape);
});
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
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      @click.self="closeModal"
    >
      <div
        class="relative max-w-4xl w-full bg-white shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <div class="sticky top-0 bg-white z-10 p-6 pb-4 border-b">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 id="modal-title" class="text-xl font-bold text-gray-800">
                UPLOAD SYARAT PRASYARAT PERMOHONAN BANTUAN
              </h2>
            </div>
            <button
              class="text-gray-400 text-lg hover:text-gray-600"
              @click="closeModal"
              aria-label="Tutup modal"
            >
              <font-awesome-icon icon="fa-solid fa-xmark" />
            </button>
          </div>

          <!-- Form -->
          <div class="space-y-4">
            <!-- Row 1: Nama, KTP, WhatsApp -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputText
                id="nama_pemohon"
                v-model="form.nama_pemohon"
                readonly
                label="Nama Pemohon Bantuan"
                type="text"
                placeholder="Nama Pemohon"
                :error="errors.nama_pemohon"
              />
              <InputText
                id="nomor_ktp"
                readonly
                v-model="form.nomor_ktp"
                label="Nomor KTP Pemohon Bantuan"
                type="text"
                placeholder="1177123787123716"
                :error="errors.nomor_ktp"
              />
              <InputText
                readonly
                id="nomor_whatsapp"
                v-model="form.nomor_whatsapp"
                label="Nomor Whatsapp Pemohon Bantuan"
                type="text"
                placeholder="08526280141"
                :error="errors.nomor_whatsapp"
              />
            </div>

            <!-- Row 2: Foto KTP & KK -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFile
                id="foto_ktp"
                label="Fotokopi Kartu Tanda Penduduk ( KTP)"
                buttonText="Choose File"
                accept=".pdf"
                :error="errors.foto_ktp"
                :maxSize="1000"
                @file-selected="(file) => handleFileUpload('foto_ktp')(file)"
              />
              <InputFile
                id="foto_kk"
                label="Fotokopi Kartu Keluarga (KK)"
                buttonText="Choose File"
                accept=".pdf"
                :error="errors.foto_kk"
                :maxSize="1000"
                @file-selected="(file) => handleFileUpload('foto_kk')(file)"
              />
            </div>

            <!-- Row 3: Surat Keterangan -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFile
                id="surat_tidak_mampu"
                label="Surat Keterangan Tidak Mampu yang Ditandatangi oleh Reje Kampung dan Imam Kampung"
                buttonText="Choose File"
                accept=".pdf"
                :error="errors.surat_tidak_mampu"
                :maxSize="1000"
                @file-selected="(file) => handleFileUpload('surat_tidak_mampu')(file)"
              />
              <InputFile
                id="surat_keterangan"
                label="Surat Keterangan dari Puskesmas / Rumah Sakit / Bidan Desa Setempat yang Menyatakan Ibu Hamil, Anak Stunting atau Anak Berpotensi Stunting."
                buttonText="Choose File"
                accept=".pdf"
                :error="errors.surat_keterangan"
                :maxSize="1000"
                @file-selected="(file) => handleFileUpload('surat_keterangan')(file)"
              />
            </div>

            <!-- Row 4: Surat Rujukan & Buku Rekening -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputFile
                id="surat_rujukan"
                label="Surat Rujukan dari Rumah Sakit / Puskesmas Setempat Terbaru (untuk bantuan berobat)"
                buttonText="Choose File"
                accept=".pdf"
                :error="errors.surat_rujukan"
                :maxSize="1000"
                @file-selected="(file) => handleFileUpload('surat_rujukan')(file)"
              />
              <InputFile
                id="foto_buku_rekening"
                label="Fotokopi Buku Rekening Bank Aceh Syariah"
                buttonText="Choose File"
                accept=".pdf"
                :error="errors.foto_buku_rekening"
                :maxSize="1000"
                @file-selected="(file) => handleFileUpload('foto_buku_rekening')(file)"
              />
            </div>

            <!-- Row 5: Bank Info -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SelectField
                id="bank_id"
                v-model="form.bank_id"
                :options="[{ id: null, name: 'Pilih Bank' }, ...dataBank]"
                label="Pilih Bank"
                placeholder="Pilih Bank"
                :required="true"
                :error="errors.bank_id"
              />
              <InputText
                id="nomor_rekening"
                v-model="form.nomor_rekening"
                label="Nomor Rekening"
                type="text"
                placeholder="Nomor Rekening"
                :error="errors.nomor_rekening"
              />
              <InputText
                id="atas_nama"
                v-model="form.atas_nama"
                label="Atas Nama"
                type="text"
                placeholder="Atas Nama"
                :error="errors.atas_nama"
              />
            </div>

            <!-- Submit Button -->
            <div class="flex justify-end gap-3 mt-4">
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
