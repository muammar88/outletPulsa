<script setup lang="ts">
// Library
import { ref, watch, computed, reactive } from 'vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import { add } from '@/service/target_pengumpulan';

// Props & Emits
const props = defineProps<{
  isModalOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; error_msg?: string }): void;
}>();

// --- State ---
const isSubmitting = ref(false);

const formData = ref({
  tahun: '',
  bulan: '',
  infaq: '',
  zakat: '',
  donasi: '',
});

const errors = reactive({
  tahun: '',
  bulan: '',
  infaq: '',
  zakat: '',
  donasi: '',
});

// Options
const currentYear = new Date().getFullYear();
const yearOptions = computed(() => {
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 2; i++) {
    years.push(i);
  }
  return years;
});

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

// Rupiah Formatting
const displayValues = reactive({ infaq: '', zakat: '', donasi: '' });

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

const formatRupiah = (value: string): string => {
  const numericValue = value.replace(/[^\d]/g, '');
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

// Form Handling
const resetForm = () => {
  formData.value = { tahun: '', bulan: '', infaq: '', zakat: '', donasi: '' };
  displayValues.infaq = '';
  displayValues.zakat = '';
  displayValues.donasi = '';
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
  if (!formData.value.tahun) {
    errors.tahun = 'Tahun harus dipilih';
    isValid = false;
  }
  if (!formData.value.bulan) {
    errors.bulan = 'Bulan harus dipilih';
    isValid = false;
  }
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
    await add(submitData);
    emit('status', { error: false, error_msg: 'Target pengumpulan berhasil ditambahkan!' });
    emit('close');
  } catch (error: any) {
    let msg = 'Gagal menambahkan target.';

    if (error.response?.data?.message) {
      msg = error.response.data.message;
    } else if (error.response?.data?.error_msg) {
      msg = error.response.data.error_msg;
    } else if (error.message) {
      msg = error.message;
    }

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
          <h2 class="text-xl font-bold text-gray-800">Tambah Target Pengumpulan</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
            :disabled="isSubmitting"
          >
            <font-awesome-icon icon="fa-solid fa-times" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Tahun -->
            <div>
              <label for="tahun" class="block text-sm font-medium text-gray-700 mb-1"
                >Tahun <span class="text-red-500">*</span></label
              >
              <select
                id="tahun"
                v-model="formData.tahun"
                :class="[
                  'block w-full px-3 py-2 border rounded-md',
                  errors.tahun ? 'border-red-500' : 'border-gray-300',
                ]"
                :disabled="isSubmitting"
              >
                <option value="">Pilih Tahun</option>
                <option v-for="year in yearOptions" :key="year" :value="year">{{ year }}</option>
              </select>
              <p v-if="errors.tahun" class="mt-1 text-xs text-red-600">{{ errors.tahun }}</p>
            </div>
            <!-- Bulan -->
            <div>
              <label for="bulan" class="block text-sm font-medium text-gray-700 mb-1"
                >Bulan <span class="text-red-500">*</span></label
              >
              <select
                id="bulan"
                v-model="formData.bulan"
                :class="[
                  'block w-full px-3 py-2 border rounded-md',
                  errors.bulan ? 'border-red-500' : 'border-gray-300',
                ]"
                :disabled="isSubmitting"
              >
                <option value="">Pilih Bulan</option>
                <option v-for="b in bulanOptions" :key="b.value" :value="b.value">
                  {{ b.label }}
                </option>
              </select>
              <p v-if="errors.bulan" class="mt-1 text-xs text-red-600">{{ errors.bulan }}</p>
            </div>
          </div>

          <!-- Infaq, Zakat, Donasi -->
          <div>
            <label for="infaq" class="block text-sm font-medium text-gray-700 mb-1"
              >Target Infaq <span class="text-red-500">*</span></label
            >
            <input
              id="infaq"
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
            <label for="zakat" class="block text-sm font-medium text-gray-700 mb-1"
              >Target Zakat <span class="text-red-500">*</span></label
            >
            <input
              id="zakat"
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
            <label for="donasi" class="block text-sm font-medium text-gray-700 mb-1"
              >Target Donasi <span class="text-red-500">*</span></label
            >
            <input
              id="donasi"
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
              :disabled="
                !formData.tahun ||
                !formData.bulan ||
                !formData.infaq ||
                !formData.zakat ||
                !formData.donasi ||
                isSubmitting
              "
              >Simpan</BaseButton
            >
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
