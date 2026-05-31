<script setup lang="ts">
// Library
import { ref, watch, reactive } from 'vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import { edit, detail } from '@/service/target_pengumpulan';

// Props & Emits
const props = defineProps<{
  isModalOpen: boolean;
  tahun: number;
  bulan: number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; error_msg?: string }): void;
}>();

// --- State ---
const isSubmitting = ref(false);
const isLoadingData = ref(false);

const formData = ref({
  id: null,
  tahun: '',
  bulan: '',
  infaq: '',
  zakat: '',
  donasi: '',
});

const errors = reactive({ infaq: '', zakat: '', donasi: '' });
const displayValues = reactive({ infaq: '', zakat: '', donasi: '' });

// Rupiah Formatting
watch(
  () => formData.value.infaq,
  (newVal) => {
    displayValues.infaq = formatRupiah(newVal);
  },
);
watch(
  () => formData.value.zakat,
  (newVal) => {
    displayValues.zakat = formatRupiah(newVal);
  },
);
watch(
  () => formData.value.donasi,
  (newVal) => {
    displayValues.donasi = formatRupiah(newVal);
  },
);

const formatRupiah = (value: string | number): string => {
  const numericValue = String(value).replace(/[^\d]/g, '');
  if (!numericValue) return '';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(parseInt(numericValue));
};

const handleCurrencyInput = (field: 'infaq' | 'zakat' | 'donasi', event: Event) => {
  formData.value[field] = (event.target as HTMLInputElement).value.replace(/[^\d]/g, '');
};

const bulanOptions = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

const getBulanName = (bulan: number) => {
  return bulanOptions.find((b) => b.value === bulan)?.label || 'Unknown';
};

// Data Handling
async function loadTargetData() {
  if (!props.tahun || !props.bulan) return;
  isLoadingData.value = true;
  try {
    const response = await detail({ tahun: props.tahun, bulan: props.bulan });
    const data = response.data;
    formData.value = {
      id: data.id,
      tahun: String(data.tahun),
      bulan: String(data.bulan),
      infaq: String(data.infaq || ''),
      zakat: String(data.zakat || ''),
      donasi: String(data.donasi || ''),
    };
  } catch (error) {
    emit('status', { error: true, error_msg: 'Gagal memuat data target.' });
    closeModal();
  } finally {
    isLoadingData.value = false;
  }
}

const resetForm = () => {
  formData.value = { id: null, tahun: '', bulan: '', infaq: '', zakat: '', donasi: '' };
  Object.keys(errors).forEach((key) => (errors[key] = ''));
  isSubmitting.value = false;
};

const closeModal = () => {
  if (isSubmitting.value) return;
  emit('close');
};

const validateForm = (): boolean => {
  Object.keys(errors).forEach((key) => (errors[key] = ''));
  let isValid = true;
  if (!formData.value.infaq) {
    errors.infaq = 'Infaq tidak boleh kosong';
    isValid = false;
  }
  if (!formData.value.zakat) {
    errors.zakat = 'Zakat tidak boleh kosong';
    isValid = false;
  }
  if (!formData.value.donasi) {
    errors.donasi = 'Donasi tidak boleh kosong';
    isValid = false;
  }
  return isValid;
};

async function handleSubmit() {
  if (!validateForm() || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const submitData = {
      ...formData.value,
      tahun: parseInt(formData.value.tahun),
      bulan: parseInt(formData.value.bulan),
      infaq: parseInt(formData.value.infaq),
      zakat: parseInt(formData.value.zakat),
      donasi: parseInt(formData.value.donasi),
    };
    await edit(submitData);
    emit('status', { error: false, error_msg: 'Target pengumpulan berhasil diperbarui!' });
  } catch (error: any) {
    const msg = error.response?.data?.error_msg || error.message || 'Gagal memperbarui target.';
    emit('status', { error: true, error_msg: msg });
  } finally {
    isSubmitting.value = false;
  }
}

watch(
  () => props.isModalOpen,
  (newVal) => {
    if (newVal) {
      resetForm();
      loadTargetData();
    }
  },
);
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="transform scale-95 opacity-0"
    enter-to-class="transform scale-100 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform scale-100 opacity-100"
    leave-to-class="transform scale-95 opacity-0"
  >
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-75 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="w-full max-w-lg mx-4 p-6 bg-white rounded-lg shadow-xl">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-bold text-gray-800">Edit Target Pengumpulan</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
            :disabled="isSubmitting"
          >
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>
        </div>

        <LoadingSpinner v-if="isLoadingData" label="Memuat data..." />
        <form v-else @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
              <input
                type="text"
                :value="formData.tahun"
                disabled
                class="block w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
              <input
                type="text"
                :value="getBulanName(Number(formData.bulan))"
                disabled
                class="block w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
              />
            </div>
          </div>

          <!-- Infaq, Zakat, Donasi -->
          <div>
            <label for="infaq-edit" class="block text-sm font-medium text-gray-700 mb-1"
              >Target Infaq <span class="text-red-500">*</span></label
            >
            <input
              id="infaq-edit"
              :value="displayValues.infaq"
              @input="handleCurrencyInput('infaq', $event)"
              type="text"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.infaq ? 'border-red-500' : 'border-gray-300',
              ]"
              placeholder="Rp 0"
              :disabled="isSubmitting"
            />
            <p v-if="errors.infaq" class="mt-1 text-xs text-red-600">{{ errors.infaq }}</p>
          </div>
          <div>
            <label for="zakat-edit" class="block text-sm font-medium text-gray-700 mb-1"
              >Target Zakat <span class="text-red-500">*</span></label
            >
            <input
              id="zakat-edit"
              :value="displayValues.zakat"
              @input="handleCurrencyInput('zakat', $event)"
              type="text"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.zakat ? 'border-red-500' : 'border-gray-300',
              ]"
              placeholder="Rp 0"
              :disabled="isSubmitting"
            />
            <p v-if="errors.zakat" class="mt-1 text-xs text-red-600">{{ errors.zakat }}</p>
          </div>
          <div>
            <label for="donasi-edit" class="block text-sm font-medium text-gray-700 mb-1"
              >Target Donasi <span class="text-red-500">*</span></label
            >
            <input
              id="donasi-edit"
              :value="displayValues.donasi"
              @input="handleCurrencyInput('donasi', $event)"
              type="text"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.donasi ? 'border-red-500' : 'border-gray-300',
              ]"
              placeholder="Rp 0"
              :disabled="isSubmitting"
            />
            <p v-if="errors.donasi" class="mt-1 text-xs text-red-600">{{ errors.donasi }}</p>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <BaseButton
              type="button"
              variant="secondary"
              @click="closeModal"
              :disabled="isSubmitting"
              >Batal</BaseButton
            >
            <BaseButton
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
              >Perbarui</BaseButton
            >
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
