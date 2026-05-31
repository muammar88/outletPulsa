<script setup lang="ts">
// Library
import BaseButton from '@/components/Button/BaseButton.vue';
import InputCurrency from '@/components/Form/InputCurrency.vue';
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
  approve_permohonan,
  get_info_approve_permohonan,
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

// State
const isLoading = ref(false);
const currentStep = ref(1);
const sendWaOption = ref<boolean | null>(null);

// Data awal
const InitialData = ref<any>(null);

// Form
const form = ref({
  biaya_disetujui: 0,
  catatan: '',
});

// Function: Close modal
const closeModal = () => {
  if (isSubmitting.value) return;
  resetForm();
  emit('close');
};

// Function: Reset form
const resetForm = () => {
  currentStep.value = 1;
  sendWaOption.value = null;
  form.value = {
    biaya_disetujui: 0,
    catatan: '',
  };
  errors.value = {};
  InitialData.value = null;
};

// Function: Fetch data
async function fetchData() {
  if (!props.selectedValidasiPermohonanBantuan?.realisasi_id) {
    displayNotification('Data tidak valid silahkan tutup dan buka kembali', 'error');
    return;
  }

  isLoading.value = true;
  try {
    const response = await get_info_approve_permohonan(
      props.selectedValidasiPermohonanBantuan.realisasi_id,
    );

    if (response.error) {
      displayNotification(response.error_msg || 'Gagal memuat data', 'error');
      return;
    }

    InitialData.value = response.data;
  } catch (error: any) {
    displayNotification('Gagal memuat data', 'error');
    console.error('Error fetching data:', error);
  } finally {
    isLoading.value = false;
  }
}

// Function: Step 1 - Pilih WA atau tidak
const handleStep1 = (withWa: boolean) => {
  sendWaOption.value = withWa;
  currentStep.value = 2;
};

// Function: Back to step 1
const backToStep1 = () => {
  currentStep.value = 1;
  sendWaOption.value = null;
};

// Function: Validate form
const errors = ref<Record<string, string>>({
  biaya_disetujui: '',
});

const validateForm = () => {
  let isValid = true;
  errors.value = {};

  // Validate biaya disetujui
  if (!form.value.biaya_disetujui || form.value.biaya_disetujui <= 0) {
    errors.value.biaya_disetujui = 'Biaya disetujui harus lebih dari 0';
    isValid = false;
  }

  // Cek apakah melebihi sisa dana
  if (form.value.biaya_disetujui > (InitialData.value?.sisa_dana || 0)) {
    errors.value.biaya_disetujui = `Biaya melebihi sisa dana (${formatToRupiah(InitialData.value?.sisa_dana || 0)})`;
    isValid = false;
  }

  // Cek apakah melebihi maksimal bantuan
  if (
    InitialData.value?.kegiatan?.maksimal_bantuan &&
    form.value.biaya_disetujui > InitialData.value.kegiatan.maksimal_bantuan
  ) {
    errors.value.biaya_disetujui = `Biaya melebihi maksimal bantuan (${formatToRupiah(InitialData.value.kegiatan.maksimal_bantuan)})`;
    isValid = false;
  }

  return isValid;
};

// Function: Handle submit (Step 2)
const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!validateForm()) return;

  const confirmMsg = sendWaOption.value
    ? 'Permohonan akan disetujui dan notifikasi WhatsApp akan dikirim ke pemohon. Lanjutkan?'
    : 'Permohonan akan disetujui tanpa mengirim notifikasi WhatsApp. Lanjutkan?';

  displayConfirmation('Konfirmasi Persetujuan Permohonan', confirmMsg, async () => {
    isSubmitting.value = true;

    const payload = {
      id: props.selectedValidasiPermohonanBantuan.realisasi_id,
      biaya_disetujui: form.value.biaya_disetujui,
      catatan: form.value.catatan.trim(),
      send_wa: sendWaOption.value || false,
    };

    try {
      const response = await approve_permohonan(payload);

      if (response.error) {
        displayNotification(response.error_msg || 'Gagal menyetujui permohonan', 'error');
      } else {
        emit('status', {
          error_msg:
            response.error_msg ||
            `Permohonan berhasil disetujui${sendWaOption.value ? ' dan notifikasi WA terkirim' : ''}`,
          error: false,
        });
        closeModal();
      }
    } catch (error: any) {
      console.error('Error approve permohonan:', error);
      displayNotification(
        error.response?.data?.error_msg ||
          error.response?.data?.message ||
          'Gagal menyetujui permohonan',
        'error',
      );
    } finally {
      isSubmitting.value = false;
      closeModal();
    }
  });
};

// Computed: Format rupiah helper (jika belum ada global)
const formatToRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(value);
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

// Watch: Handler
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
      <LoadingSpinner v-if="isLoading" label="Memuat data..." />
      <div v-else class="relative max-w-2xl w-full bg-white shadow-2xl rounded-2xl p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div>
              <h2 id="modal-title" class="text-xl font-bold text-gray-800">
                {{ currentStep === 1 ? 'Setujui Permohonan' : 'Input Biaya Disetujui' }}
              </h2>
              <p class="text-sm text-gray-500">
                {{
                  currentStep === 1
                    ? 'Pilih metode pemberitahuan'
                    : 'Masukkan jumlah bantuan yang disetujui'
                }}
              </p>
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

        <!-- Step Indicator -->
        <div class="flex items-center justify-center gap-2">
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                currentStep === 1 ? 'bg-green-600 text-white' : 'bg-green-100 text-green-600',
              ]"
            >
              1
            </div>
            <span class="text-xs font-semibold text-gray-600">Pilih Metode</span>
          </div>
          <div class="w-16 h-1 bg-gray-200">
            <div
              :class="['h-full transition-all', currentStep === 2 ? 'bg-green-600' : 'bg-gray-200']"
              :style="{ width: currentStep === 2 ? '100%' : '0%' }"
            ></div>
          </div>
          <div class="flex items-center gap-2">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                currentStep === 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500',
              ]"
            >
              2
            </div>
            <span class="text-xs font-semibold text-gray-600">Input Biaya</span>
          </div>
        </div>

        <!-- Info Permohonan -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
          <h3 class="font-semibold text-blue-800 text-sm mb-3 flex items-center gap-2">
            <font-awesome-icon icon="fa-solid fa-circle-info" />
            Informasi Permohonan
          </h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs text-blue-800">
            <p>
              <span class="font-semibold text-blue-900">Pemohon:</span>
              {{ InitialData?.member?.name || '-' }}
            </p>
            <p>
              <span class="font-semibold text-blue-900">Kegiatan:</span>
              {{ InitialData?.kegiatan?.name || '-' }}
            </p>
            <p>
              <span class="font-semibold text-blue-900">Lokasi:</span>
              {{ InitialData?.lokasi?.desa || '-' }}, {{ InitialData?.lokasi?.kecamatan || '-' }}
            </p>
            <p>
              <span class="font-semibold text-blue-900">Sisa Dana:</span>
              <span class="font-bold text-green-700">
                {{ formatToRupiah(InitialData?.sisa_dana || 0) }}</span
              >
            </p>
            <p v-if="InitialData?.kegiatan?.maksimal_bantuan">
              <span class="font-semibold text-blue-900">Maksimal Bantuan:</span>
              <span class="font-bold text-orange-600">{{
                formatToRupiah(InitialData.kegiatan.maksimal_bantuan)
              }}</span>
            </p>
          </div>
        </div>

        <!-- STEP 1: Pilih Metode Pemberitahuan -->
        <div v-if="currentStep === 1" class="space-y-4">
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-2">
              Apakah Anda ingin mengirim notifikasi WhatsApp ke pemohon?
            </p>
            <div class="flex flex-col gap-3 mx-auto">
              <button
                @click="handleStep1(true)"
                class="flex items-center justify-between px-6 py-4 bg-green-50 border-2 border-green-300 rounded-lg hover:bg-green-100 hover:border-green-400 transition-all group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <font-awesome-icon icon="fa-brands fa-whatsapp" class="text-white text-lg" />
                  </div>
                  <div class="text-left">
                    <p class="font-bold text-gray-800">Approve + Kirim WhatsApp</p>
                    <p class="text-xs text-gray-600">Pemohon akan menerima notifikasi WhatsApp</p>
                  </div>
                </div>
                <font-awesome-icon
                  icon="fa-solid fa-arrow-right"
                  class="text-green-600 group-hover:translate-x-1 transition-transform"
                />
              </button>

              <button
                @click="handleStep1(false)"
                class="flex items-center justify-between px-6 py-4 bg-gray-50 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition-all group"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                    <font-awesome-icon icon="fa-solid fa-check" class="text-white text-lg" />
                  </div>
                  <div class="text-left">
                    <p class="font-bold text-gray-800">Approve Saja</p>
                    <p class="text-xs text-gray-600">Tanpa mengirim notifikasi WhatsApp</p>
                  </div>
                </div>
                <font-awesome-icon
                  icon="fa-solid fa-arrow-right"
                  class="text-gray-600 group-hover:translate-x-1 transition-transform"
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

        <!-- STEP 2: Input Biaya Disetujui -->
        <div v-if="currentStep === 2" class="space-y-4">
          <!-- Form Input -->
          <div class="space-y-4">
            <InputCurrency
              id="biaya_disetujui"
              v-model.number="form.biaya_disetujui"
              label="Jumlah Bantuan Disetujui"
              placeholder="Masukkan jumlah bantuan"
              :error="errors.biaya_disetujui"
              :required="true"
            />

            <TextArea
              id="catatan"
              v-model="form.catatan"
              k
              label="Catatan (Opsional)"
              placeholder="Tambahkan catatan jika diperlukan..."
              :rows="3"
            />
          </div>

          <!-- Info Badge -->
          <div class="flex items-center gap-2 text-xs">
            <span
              :class="[
                'px-3 py-1 rounded-full font-semibold',
                sendWaOption ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700',
              ]"
            >
              <font-awesome-icon
                :icon="sendWaOption ? 'fa-brands fa-whatsapp' : 'fa-solid fa-check'"
                class="mr-1"
              />
              {{ sendWaOption ? 'Dengan WhatsApp' : 'Tanpa WhatsApp' }}
            </span>
          </div>

          <!-- Warning Box -->
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <div class="flex items-start gap-3">
              <font-awesome-icon
                icon="fa-solid fa-circle-check"
                class="text-green-600 text-lg mt-0.5"
              />
              <div class="text-xs text-green-800">
                <p class="font-semibold mb-1">Perhatian!</p>
                <p>
                  Permohonan akan disetujui dengan biaya
                  <strong>{{ formatToRupiah(form.biaya_disetujui) }}</strong
                  >. Status akan berubah menjadi <strong>"Disetujui"</strong> dan permohonan tidak
                  akan muncul lagi di daftar validasi.
                </p>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-between gap-3">
            <BaseButton
              @click="backToStep1"
              type="button"
              :disabled="isSubmitting"
              variant="secondary"
            >
              <font-awesome-icon icon="fa-solid fa-arrow-left" class="mr-2" />
              Kembali
            </BaseButton>

            <BaseButton
              type="button"
              variant="success"
              :disabled="!form.biaya_disetujui || form.biaya_disetujui <= 0 || isSubmitting"
              @click="handleSubmit"
            >
              <span v-if="isSubmitting">Memproses... </span>
              <span v-else>
                <font-awesome-icon icon="fa-solid fa-check" class="mr-2" />
                Setujui Permohonan
              </span>
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
    <BaseButton variant="success" @click="confirm">Ya, Setujui</BaseButton>
  </Confirmation>

  <!-- Notification -->
  <Notification
    :showNotification="showNotification"
    :notificationType="notificationType"
    :notificationMessage="notificationMessage"
    @close="showNotification = false"
  />
</template>
