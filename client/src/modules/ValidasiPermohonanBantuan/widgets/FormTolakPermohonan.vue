<script setup lang="ts">
// Library
import BaseButton from '@/components/Button/BaseButton.vue';
import TextArea from '@/components/Form/TextArea.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

// Composable
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service
import {
  get_info_reject_permohonan,
  reject_permohonan,
} from '@/service/validasi_permohonan_bantuan';

// Composable: notification & confirmation
const { showNotification, notificationType, notificationMessage, displayNotification } =
  useNotification();

const { showConfirmDialog, confirmTitle, confirmMessage, displayConfirmation, confirm, cancel } =
  useConfirmation();

interface Props {
  isModalOpen: boolean;
  selectedValidasiPermohonanBantuan: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error_msg?: string; error?: boolean }): void;
}>();

// State Loading
const isLoading = ref(false);

// Function: Close modal
const closeModal = () => {
  if (isSubmitting.value) return;
  resetForm();
  emit('close');
};

// Function: Reset form
const resetForm = () => {
  form.value = {
    alasan_penolakan: '',
  };
  errors.value = {};
};

//  Function: Fetch data
const InitialData = ref<any>(null);
async function fetchData() {
  try {
    const response = await get_info_reject_permohonan(
      props.selectedValidasiPermohonanBantuan.realisasi_id,
    );
    InitialData.value = response.data;
  } catch (error) {
    displayNotification('Gagal memuat data', 'error');
  }
}

// Function: Validate form
const errors = ref<Record<string, string>>({
  alasan_penolakan: '',
});

const validateForm = () => {
  let isValid = true;
  errors.value = {};

  if (!props.selectedValidasiPermohonanBantuan?.realisasi_id) {
    displayNotification('Data tidak valid. Silahkan tutup dan buka kembali modal.', 'error');
    isValid = false;
    return isValid;
  }

  // Validate: alasan penolakan wajib diisi
  if (!form.value.alasan_penolakan || form.value.alasan_penolakan.trim() === '') {
    errors.value.alasan_penolakan = 'Alasan penolakan wajib diisi';
    isValid = false;
  }

  return isValid;
};

// Function: Handle submit (dengan pilihan send_wa)
const isSubmitting = ref(false);

const form = ref({
  alasan_penolakan: '' as string,
});

const handleSubmit = async (sendWa: boolean) => {
  if (!validateForm()) return;

  const confirmMsg = sendWa
    ? 'Permohonan akan ditolak dan notifikasi WhatsApp akan dikirim ke pemohon. Lanjutkan?'
    : 'Permohonan akan ditolak tanpa mengirim notifikasi WhatsApp. Lanjutkan?';

  displayConfirmation('Konfirmasi Penolakan Permohonan', confirmMsg, async () => {
    isSubmitting.value = true;

    const payload = {
      id: props.selectedValidasiPermohonanBantuan.realisasi_id,
      alasan_penolakan: form.value.alasan_penolakan.trim(),
      send_wa: sendWa,
    };

    try {
      const response = await reject_permohonan(payload);

      if (response.error) {
        displayNotification(response.error_msg || 'Gagal menolak permohonan', 'error');
      } else {
        emit('status', {
          error_msg:
            response.error_msg ||
            `Permohonan berhasil ditolak${sendWa ? ' dan notifikasi WA terkirim' : ''}`,
          error: false,
        });
        closeModal();
      }
    } catch (error: any) {
      console.error('Error reject permohonan:', error);
      displayNotification(
        error.response?.data?.error_msg ||
          error.response?.data?.message ||
          'Gagal menolak permohonan',
        'error',
      );
    } finally {
      isSubmitting.value = false;
      closeModal();
    }
  });
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

//  Watch: Handler
watch(
  () => props.isModalOpen,
  (newVal) => {
    if (newVal) {
      fetchData();
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
      <LoadingSpinner v-if="isLoading" label="Menolak permohonan..." />
      <div v-else class="relative max-w-xl w-full bg-white shadow-2xl rounded-2xl p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div>
              <h2 id="modal-title" class="text-xl font-bold text-gray-800">Tolak Permohonan</h2>
            </div>
          </div>
          <button
            class="text-gray-400 text-lg hover:text-gray-600"
            @click="closeModal"
            aria-label="Tutup modal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Info Pemohon -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-800 text-sm mb-2 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-info-circle" />
            Informasi Permohonan
          </h3>
          <div class="space-y-1 text-xs text-blue-700">
            <p><strong>Pemohon:</strong> {{ InitialData?.member?.name || '-' }}</p>
            <p>
              <strong>Kegiatan:</strong>
              {{ InitialData?.kegiatan?.name || '-' }}
            </p>
            <p>
              <strong>Lokasi:</strong> {{ InitialData?.lokasi?.desa || '-' }},
              {{ InitialData?.lokasi?.kecamatan || '-' }}
            </p>
          </div>
        </div>

        <!-- Form Alasan Penolakan -->
        <div class="px-1 py-1 space-y-4 max-h-[40vh] overflow-y-auto pr-2">
          <div class="space-y-2">
            <TextArea
              id="alasan_penolakan"
              v-model="form.alasan_penolakan"
              label="Alasan Penolakan"
              placeholder="Contoh: Berkas tidak lengkap, data tidak sesuai persyaratan, tidak memenuhi kriteria bantuan, dll."
              note="Alasan penolakan akan diinformasikan kepada pemohon (jika pilih Tolak + Kirim WA)"
              :error="errors.alasan_penolakan"
              :required="true"
              :rows="5"
            />
          </div>
        </div>

        <!-- Warning Box -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex items-start gap-3">
            <font-awesome-icon
              icon="fa-solid fa-triangle-exclamation"
              class="text-yellow-600 text-lg mt-0.5"
            />
            <div class="text-xs text-yellow-800">
              <p class="font-semibold mb-1">Perhatian!</p>
              <p>
                Setelah permohonan ditolak, status akan berubah menjadi
                <strong>"Ditolak"</strong> dan permohonan tidak akan muncul lagi di daftar validasi.
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <div class="text-center">
            <div class="flex flex-col gap-3 mx-auto">
              <button
                :disabled="isLoading || !form.alasan_penolakan"
                @click="handleSubmit(true)"
                class="flex items-center justify-between px-6 py-4 bg-green-50 border-2 border-green-300 rounded-lg hover:bg-green-100 hover:border-green-400 transition-all group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <font-awesome-icon icon="fa-brands fa-whatsapp" class="text-white text-lg" />
                  </div>
                  <div class="text-left">
                    <p class="font-bold text-gray-800">Tolak + Kirim WhatsApp</p>
                    <p class="text-xs text-gray-600">Pemohon akan menerima notifikasi WhatsApp</p>
                  </div>
                </div>
                <font-awesome-icon
                  icon="fa-solid fa-arrow-right"
                  class="text-green-600 group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                :disabled="isLoading || !form.alasan_penolakan"
                @click="handleSubmit(false)"
                class="flex items-center justify-between px-6 py-4 bg-red-50 border-2 border-red-300 rounded-lg hover:bg-red-100 hover:border-red-400 transition-all group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-check" class="text-white text-lg" />
                  </div>
                  <div class="text-left">
                    <p class="font-bold text-red-800">Tolak Saja</p>
                    <p class="text-xs text-red-600">Tanpa mengirim notifikasi WhatsApp</p>
                  </div>
                </div>
                <font-awesome-icon
                  icon="fa-solid fa-arrow-right"
                  class="text-red-600 group-hover:translate-x-1 transition-transform"
                />
              </button>
            </div>
          </div>

          <div class="flex justify-center">
            <BaseButton @click="closeModal" type="button" :full-width="true" variant="secondary">
              <font-awesome-icon icon="fa-solid fa-xmark" class="mr-2" />
              Batal
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Confirmation -->
  <Confirmation
    :showConfirmDialog="showConfirmDialog"
    :confirmTitle="confirmTitle"
    :confirmMessage="confirmMessage"
  >
    <BaseButton variant="secondary" @click="cancel">Batal</BaseButton>
    <BaseButton variant="danger" @click="confirm">Ya, Tolak</BaseButton>
  </Confirmation>

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
