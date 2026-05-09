<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import BaseButton from '@/components/Button/BaseButton.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import {
  getJenisMonevList,
  getUrutanBagian,
  update_pertanyaan,
  get_info_edit,
} from '@/service/pertanyaan_monev';

interface FormData {
  id: number;
  jenis_monev: string;
  tipe: string;
  bagian: string;
  pertanyaan: string;
  parent_id: number | null;
  bentuk_pertanyaan: string;
}

const props = defineProps<{
  isModalOpen: boolean;
  pertanyaanId: number | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'status', payload: { error: boolean; error_msg: string }): void;
}>();

const isSubmitting = ref(false);
const isLoadingData = ref(false);
const isInitialLoad = ref(false);

const formData = ref<Partial<FormData>>({});

const jenisMonevOptions = ref<string[]>([]);
const bagianMonevOptions = ref<string[]>([]);
const bentukPertanyaanOptions = ['text', 'checkbox', 'currency'];

const errors = reactive({
  jenis_monev: '',
  bagian: '',
  pertanyaan: '',
});

const fetchJenisMonev = async () => {
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
  }
};

const fetchBagianMonev = async (jenisMonev?: string) => {
  isLoadingData.value = true;
  try {
    let jenisMonevParam = jenisMonev || formData.value.jenis_monev || '';
    if (formData.value.parent_id) {
      jenisMonevParam = 'all';
    }

    const response = await getUrutanBagian(jenisMonevParam);
    bagianMonevOptions.value = response.data;

    if (
      !isInitialLoad.value &&
      jenisMonev &&
      !bagianMonevOptions.value.includes(formData.value.bagian || '')
    ) {
      formData.value.bagian = '';
    }
  } catch (err) {
    console.error('Error fetching bagian monev:', err);
    bagianMonevOptions.value = [];
  } finally {
    isLoadingData.value = false;
  }
};

const resetForm = () => {
  formData.value = {};
  Object.keys(errors).forEach((key) => (errors[key] = ''));
  isSubmitting.value = false;
};

const closeModal = () => {
  emit('close');
};

const validateForm = () => {
  let isValid = true;
  Object.keys(errors).forEach((key) => (errors[key] = ''));

  if (!formData.value.pertanyaan?.trim()) {
    errors.pertanyaan = 'Pertanyaan harus diisi';
    isValid = false;
  }

  // Validasi untuk pertanyaan parent
  if (!formData.value.parent_id) {
    if (!formData.value.jenis_monev) {
      errors.jenis_monev = 'Jenis monev harus dipilih';
      isValid = false;
    }

    if (!formData.value.bagian) {
      errors.bagian = 'Bagian harus dipilih';
      isValid = false;
    }
  }

  return isValid;
};

async function handleSubmit() {
  if (!validateForm() || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const payload = {
      ...formData.value,
      tipe: formData.value.jenis_monev?.split('_')[0],
    };

    await update_pertanyaan(payload);
    emit('status', { error: false, error_msg: 'Pertanyaan berhasil diperbarui!' });
    closeModal();
  } catch (error) {
    console.error(error);
    emit('status', { error: true, error_msg: 'Gagal memperbarui pertanyaan.' });
  } finally {
    isSubmitting.value = false;
  }
}

watch(
  () => props.isModalOpen,
  async (newValue) => {
    if (newValue && props.pertanyaanId) {
      resetForm();
      isLoadingData.value = true;
      isInitialLoad.value = true;

      try {
        const response = await get_info_edit(props.pertanyaanId);
        formData.value = response.data;

        await Promise.all([fetchJenisMonev(), fetchBagianMonev()]);
      } catch (error) {
        emit('status', { error: true, error_msg: 'Gagal memuat data pertanyaan.' });
        closeModal();
      } finally {
        isInitialLoad.value = false;
        isLoadingData.value = false;
      }
    }
  },
);

watch(
  () => formData.value.jenis_monev,
  async (newJenis, oldJenis) => {
    if (!isInitialLoad.value && newJenis !== oldJenis && !formData.value.parent_id && newJenis) {
      await fetchBagianMonev(newJenis);
    }
  },
);

const formatText = (text: string) => {
  if (!text) return '';
  return text.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};
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
          <h2 class="text-xl font-bold text-gray-800">Edit Pertanyaan Monev</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600"
            :disabled="isSubmitting"
          >
            <font-awesome-icon icon="fa-solid fa-times"></font-awesome-icon>
          </button>
        </div>

        <LoadingSpinner v-if="isLoadingData" label="Memuat data..." />
        <form v-else-if="formData.id" @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Pertanyaan -->
          <div>
            <label for="edit_pertanyaan" class="block text-sm font-medium text-gray-700 mb-1"
              >Pertanyaan <span class="text-red-500">*</span></label
            >
            <textarea
              id="edit_pertanyaan"
              v-model="formData.pertanyaan"
              rows="3"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.pertanyaan ? 'border-red-500' : 'border-gray-300',
              ]"
              placeholder="Pertanyaan Monev"
              :disabled="isSubmitting"
            ></textarea>
            <p v-if="errors.pertanyaan" class="mt-1 text-xs text-red-600">
              {{ errors.pertanyaan }}
            </p>
          </div>

          <!-- Jenis Monev (Hanya untuk parent) -->
          <div v-if="!formData.parent_id">
            <label for="edit_jenis_monev" class="block text-sm font-medium text-gray-700 mb-1"
              >Jenis Monev <span class="text-red-500">*</span></label
            >
            <select
              id="edit_jenis_monev"
              v-model="formData.jenis_monev"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.jenis_monev ? 'border-red-500' : 'border-gray-300',
              ]"
              :disabled="isSubmitting"
            >
              <option value="" disabled>Pilih Jenis Monev</option>
              <option v-for="jenis in jenisMonevOptions" :key="jenis" :value="jenis">
                {{ formatText(jenis) }}
              </option>
            </select>
            <p v-if="errors.jenis_monev" class="mt-1 text-xs text-red-600">
              {{ errors.jenis_monev }}
            </p>
          </div>

          <!-- Bagian (Hanya untuk parent) -->
          <div v-if="!formData.parent_id">
            <label for="edit_bagian" class="block text-sm font-medium text-gray-700 mb-1"
              >Bagian <span class="text-red-500">*</span></label
            >
            <select
              id="edit_bagian"
              v-model="formData.bagian"
              :class="[
                'block w-full px-3 py-2 border rounded-md',
                errors.bagian ? 'border-red-500' : 'border-gray-300',
              ]"
              :disabled="isSubmitting || isLoadingData"
            >
              <option value="" disabled>Pilih Bagian</option>
              <option v-for="b in bagianMonevOptions" :key="b" :value="b">
                {{ formatText(b) }}
              </option>
            </select>
            <p v-if="errors.bagian" class="mt-1 text-xs text-red-600">{{ errors.bagian }}</p>
          </div>

          <!-- Bentuk Jawaban -->
          <div>
            <label for="edit_bentuk_jawaban" class="block text-sm font-medium text-gray-700 mb-1"
              >Bentuk Jawaban <span class="text-red-500">*</span></label
            >
            <select
              id="edit_bentuk_jawaban"
              v-model="formData.bentuk_pertanyaan"
              class="block w-full px-3 py-2 border rounded-md border-gray-300 capitalize"
              :disabled="isSubmitting"
            >
              <option v-for="opsi in bentukPertanyaanOptions" :key="opsi" :value="opsi">
                {{ opsi }}
              </option>
            </select>
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
                  (!formData.parent_id ? formData.jenis_monev && formData.bagian : true) &&
                  formData.pertanyaan?.trim() &&
                  formData.bentuk_pertanyaan
                ) || isSubmitting
              "
            >
              <span>Simpan Perubahan</span>
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>