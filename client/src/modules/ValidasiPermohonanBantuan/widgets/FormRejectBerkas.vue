<script setup lang="ts">
// Library
import BaseButton from '@/components/Button/BaseButton.vue';
import TextArea from '@/components/Form/TextArea.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import Notification from '@/components/Modal/Notification.vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';

// Composable
import { useConfirmation } from '@/composables/useConfirmation';
import { useNotification } from '@/composables/useNotification';

// Service
import { reject_berkas } from '@/service/validasi_permohonan_bantuan';

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

// Form
const form = ref({
  alasan_penolakan: null as string | null,
});

// Function: Close modal
const closeModal = () => {
  if (isSubmitting.value) return;
  resetForm();
  emit('close');
};

// Function: Reset form
const resetForm = () => {
  form.value = {
    alasan_penolakan: null,
  };
  errors.value = {};
};

// Function: Validate form
const errors = ref<Record<string, string>>({
  alasan_penolakan: '',
});

const validateForm = () => {
  let isValid = true;
  errors.value = {};

  if (!props.selectedValidasiPermohonanBantuan.realisasi_id) {
    displayNotification('Form Invalid, Silahkan keluar dan isi form kembali.', 'error');
    isValid = false;
  }

  if (!props.selectedValidasiPermohonanBantuan.validasi_id) {
    displayNotification('Form Invalid, Silahkan keluar dan isi form kembali.', 'error');
    isValid = false;
  }

  // Validate: file wajib diisi (karena ini edit file)
  if (!form.value.alasan_penolakan) {
    errors.value.alasan_penolakan = 'Alasan penolakan wajib diisi';
    isValid = false;
  }

  return isValid;
};

// Function: Handle submit
const isSubmitting = ref(false);

const handleSubmit = async () => {
  console.log(props.selectedValidasiPermohonanBantuan);
  if (!validateForm()) return;
  displayConfirmation(
    'Konfirmasi Penolakan Berkas',
    'Apakah anda yakin ingin menolak berkas ini?',
    async () => {
      isSubmitting.value = true;

      const formData = {
        id: props.selectedValidasiPermohonanBantuan.realisasi_id,
        validasi_id: props.selectedValidasiPermohonanBantuan.validasi_id,
        alasan_penolakan: form.value.alasan_penolakan,
      };

      try {
        const response = await reject_berkas(formData);

        if (response.error) {
          displayNotification(response.error_msg || 'Gagal mengupdate file', 'error');
        } else {
          emit('status', {
            error_msg: response.error_msg || 'File berhasil diupdate',
            error: false,
          });
          closeModal();
        }
      } catch (error: any) {
        console.error('Error updating file:', error);
        displayNotification(
          error.response?.data?.error_msg ||
            error.response?.data?.message ||
            'Gagal mengupdate file',
          'error',
        );
      } finally {
        isSubmitting.value = false;
        closeModal();
      }
    },
  );
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
      <div class="relative max-w-xl w-full bg-white shadow-2xl rounded-2xl p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <h2 id="modal-title" class="text-xl font-bold text-gray-800">Tolak Berkas</h2>
          <button
            class="text-gray-400 text-lg hover:text-gray-600"
            @click="closeModal"
            aria-label="Tutup modal"
          >
            <font-awesome-icon icon="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Form Upload File Baru -->
        <div class="space-y-2">
          <TextArea
            id="alasan_penolakan"
            v-model="form.alasan_penolakan"
            label="Alasan Penolakan"
            placeholder="Contoh: Foto buram, tidak terbaca; Data tidak sesuai; Format file salah; dll."
            note="Alasan akan ditampilkan kepada pemohon"
            :error="errors.alasan_penolakan"
            :required="true"
            :rows="4"
          />
        </div>

        <!-- Warning Box -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div class="flex items-start gap-2">
            <font-awesome-icon
              icon="fa-solid fa-triangle-exclamation"
              class="text-yellow-600 text-sm mt-0.5"
            />
            <div class="text-xs text-yellow-800">
              <p>
                Status berkas akan berubah menjadi <strong>"Ditolak"</strong> dan pemohon perlu
                mengupload ulang berkas yang sesuai.
              </p>
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
            type="button"
            variant="primary"
            :disabled="!form.alasan_penolakan || isSubmitting"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">
              <font-awesome-icon icon="fa-solid fa-spinner" spin class="mr-2" />
              Menyimpan...
            </span>
            <span v-else>Tolak Berkas </span>
          </BaseButton>
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
    <BaseButton variant="secondary" @click="cancel">Tidak</BaseButton>
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
