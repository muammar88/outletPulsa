<script setup lang="ts">
// Library
import { ref, watch, computed, reactive } from 'vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import { getJenisMonevList, getUrutanBagian, create_pertanyaan } from '@/service/pertanyaan_monev';

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
const isLoadingData = ref(false);

const formData = ref({
  jenis_monev: '',
  bagian: '',
  pertanyaan: '',
  bentuk_pertanyaan: 'text',
});

const jenisMonevOptions = ref<string[]>([]);
const bagianMonevOptions = ref<string[]>([]);
const bentukPertanyaanOptions = ['text', 'checkbox', 'currency'];

const errors = reactive({
  jenis_monev: '',
  bagian: '',
  pertanyaan: '',
  bentuk_pertanyaan: '',
});

// --- Computed Properties ---
const tipeMonev = computed(() => {
  if (!formData.value.jenis_monev) return '';
  return formData.value.jenis_monev.startsWith('evaluasi') ? 'evaluasi' : 'monitoring';
});

// --- Functions ---
const fetchJenisMonev = async () => {
  if (jenisMonevOptions.value.length > 0) return;
  isLoadingData.value = true;
  try {
    const response = await getJenisMonevList();
    const rawList: string[] = response.data;
    const desiredOrder = [
      'evaluasi_konsumtif',
      'evaluasi_pemberdayaan_ekonomi',
      'evaluasi_pendidikan',
      'monitoring_konsumtif',
      'monitoring_pemberdayaan_ekonomi',
      'monitoring_pendidikan',
    ];
    jenisMonevOptions.value = rawList.sort(
      (a, b) => desiredOrder.indexOf(a) - desiredOrder.indexOf(b),
    );
  } catch (err) {
    console.error('Error fetching jenis monev:', err);
  } finally {
    isLoadingData.value = false;
  }
};

const fetchBagianMonev = async (jenis: string) => {
  isLoadingData.value = true;
  try {
    const response = await getUrutanBagian(jenis);
    bagianMonevOptions.value = response.data;
    if (bagianMonevOptions.value.length > 0) {
      formData.value.bagian = bagianMonevOptions.value[0];
    }
  } catch (err) {
    console.error('Error fetching bagian monev:', err);
  } finally {
    isLoadingData.value = false;
  }
};

const resetForm = () => {
  formData.value = {
    jenis_monev: '',
    bagian: '',
    pertanyaan: '',
    bentuk_pertanyaan: 'text',
  };
  Object.keys(errors).forEach((key) => (errors[key] = ''));
  isSubmitting.value = false;
  bagianMonevOptions.value = [];
};

const closeModal = () => {
  if (isSubmitting.value) return;
  emit('close');
};

const validateForm = (): boolean => {
  Object.keys(errors).forEach((key) => (errors[key] = ''));
  let isValid = true;
  if (!formData.value.jenis_monev) {
    errors.jenis_monev = 'Jenis Monev harus dipilih';
    isValid = false;
  }
  if (!formData.value.bagian) {
    errors.bagian = 'Bagian Monev harus dipilih';
    isValid = false;
  }
  if (!formData.value.pertanyaan.trim()) {
    errors.pertanyaan = 'Pertanyaan tidak boleh kosong';
    isValid = false;
  }
  return isValid;
};

async function handleSubmit() {
  if (!validateForm() || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    await create_pertanyaan({
      ...formData.value,
      tipe: tipeMonev.value,
    });
    emit('status', { error: false, error_msg: 'Pertanyaan berhasil ditambahkan!' });
    emit('close');
  } catch (error) {
    console.error(error);
    emit('status', { error: true, error_msg: 'Gagal menambahkan pertanyaan.' });
    isSubmitting.value = false;
  }
}

// --- Watchers ---
watch(
  () => props.isModalOpen,
  (newValue) => {
    if (newValue) {
      fetchJenisMonev();
    } else {
      resetForm();
    }
  },
);

watch(
  () => formData.value.jenis_monev,
  (newValue) => {
    formData.value.bagian = '';
    bagianMonevOptions.value = [];
    if (newValue) {
      fetchBagianMonev(newValue);
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
          <h2 class="text-xl font-bold text-gray-800">Tambah Pertanyaan Baru</h2>
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
          <!-- Pilih Jenis Monev -->
          <div>
            <label for="jenis_monev" class="block text-sm font-medium text-gray-700 mb-1"
              >Jenis Monev <span class="text-red-500">*</span></label
            >
            <select
              id="jenis_monev"
              v-model="formData.jenis_monev"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.jenis_monev ? 'border-red-500' : 'border-gray-300',
              ]"
              :disabled="isSubmitting"
            >
              <option value="" disabled>Pilih Jenis Monev</option>
              <option v-for="jenis in jenisMonevOptions" :key="jenis" :value="jenis">
                {{ jenis.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) }}
              </option>
            </select>
            <p v-if="errors.jenis_monev" class="mt-1 text-xs text-red-600">
              {{ errors.jenis_monev }}
            </p>
          </div>

          <!-- Pilih Bagian Monev -->
          <div>
            <label for="bagian" class="block text-sm font-medium text-gray-700 mb-1"
              >Bagian Monev <span class="text-red-500">*</span></label
            >
            <select
              id="bagian"
              v-model="formData.bagian"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.bagian ? 'border-red-500' : 'border-gray-300',
              ]"
              :disabled="isSubmitting || !formData.jenis_monev"
            >
              <option value="" disabled>
                {{ !formData.jenis_monev ? 'Pilih Bagian ' : 'Pilih Bagian' }}
              </option>
              <option v-for="b in bagianMonevOptions" :key="b" :value="b">
                {{ b.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) }}
              </option>
            </select>
            <p v-if="errors.bagian" class="mt-1 text-xs text-red-600">{{ errors.bagian }}</p>
          </div>

          <!-- Pertanyaan -->
          <div>
            <label for="pertanyaan" class="block text-sm font-medium text-gray-700 mb-1"
              >Pertanyaan <span class="text-red-500">*</span></label
            >
            <textarea
              id="pertanyaan"
              v-model="formData.pertanyaan"
              rows="3"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.pertanyaan ? 'border-red-500' : 'border-gray-300',
              ]"
              placeholder="Masukkan teks pertanyaan..."
              :disabled="isSubmitting"
            ></textarea>
            <p v-if="errors.pertanyaan" class="mt-1 text-xs text-red-600">
              {{ errors.pertanyaan }}
            </p>
          </div>

          <!-- Bentuk Pertanyaan -->
          <div>
            <label for="bentuk_pertanyaan" class="block text-sm font-medium text-gray-700 mb-1"
              >Bentuk Jawaban <span class="text-red-500">*</span></label
            >
            <select
              id="bentuk_pertanyaan"
              v-model="formData.bentuk_pertanyaan"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.bentuk_pertanyaan ? 'border-red-500' : 'border-gray-300',
              ]"
              :disabled="isSubmitting"
            >
              <option
                v-for="opsi in bentukPertanyaanOptions"
                :key="opsi"
                :value="opsi"
                class="capitalize"
              >
                {{ opsi }}
              </option>
            </select>
            <p v-if="errors.bentuk_pertanyaan" class="mt-1 text-xs text-red-600">
              {{ errors.bentuk_pertanyaan }}
            </p>
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
                !(
                  formData.jenis_monev &&
                  formData.bagian &&
                  formData.pertanyaan.trim() &&
                  formData.bentuk_pertanyaan
                )||
                isSubmitting
              "
            >
              <span>Simpan</span>
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
