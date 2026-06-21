<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { bankService, type Bank } from '@/service/administrator/bank';
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: Bank | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: Bank): void;
}>();

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const errors = ref<Record<string, string>>({});
const isLoading = ref(false);

const defaultForm = (): Bank => ({
  kode: '',
  nama: '',
  image: '',
});

const form = ref<Bank>(defaultForm());
const selectedFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      errors.value = {};
      selectedFile.value = null;
      if (props.mode === 'edit' && props.initialData) {
        form.value = { ...props.initialData };
        imagePreview.value = props.initialData.image || null;
      } else {
        form.value = defaultForm();
        imagePreview.value = null;
      }
    }
  }
);

const kodeBank = computed({
  get: () => form.value.kode,
  set: (val: string) => {
    form.value.kode = val.replace(/[^A-Za-z]/g, '').toUpperCase();
  }
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  // Max 200KB
  if (file.size > 200 * 1024) {
    displayNotification('Ukuran file maksimal 200KB.', 'error' );
    if (fileInputRef.value) fileInputRef.value.value = '';
    return;
  }

  // File type validation (jpg, jpeg, png)
  if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
    displayNotification('Format file harus JPG, JPEG, atau PNG.', 'error' );
    if (fileInputRef.value) fileInputRef.value.value = '';
    return;
  }

  selectedFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const triggerFileInput = () => {
  if (fileInputRef.value && !imagePreview.value) {
    fileInputRef.value.click();
  }
};

const removeImage = () => {
  selectedFile.value = null;
  imagePreview.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

const validateForm = () => {
  errors.value = {};
  if (!form.value.kode) {
    errors.value.kode = 'Kode bank harus diisi';
  }
  if (!form.value.nama) {
    errors.value.nama = 'Nama bank harus diisi';
  }
  return Object.keys(errors.value).length === 0;
};

const submitForm = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    const formData = new FormData();
    if (form.value.kode) formData.append('kode', form.value.kode);
    if (form.value.nama) formData.append('nama', form.value.nama);
    if (selectedFile.value) {
      formData.append('image', selectedFile.value);
    }

    if (props.mode === 'add') {
      await bankService.create(formData as any);
    } else if (props.mode === 'edit' && form.value.id) {
      await bankService.update(form.value.id, formData as any);
    }
    emit('submit', form.value);
    emit('close');
  } catch (error: any) {
    displayNotification(
      error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data bank.',
      'error'
    );
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    :label="mode === 'add' ? 'Tambah Bank Baru' : 'Edit Bank'"
    :submit-label="mode === 'add' ? 'Tambahkan Bank' : 'Simpan Perubahan'"
    :width="'w-full md:w-1/3'"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="submitForm"
  >
    <div class="space-y-4">
      <div class="w-1/3">
        <InputText
          id="kode"
          label="Kode Bank"
          v-model="kodeBank"
          placeholder="Contoh: BCA"
          :error="errors.kode"
          required
          :maxlength="3"
        />
      </div>

      <InputText
        id="nama"
        label="Nama Bank"
        v-model="form.nama"
        placeholder="Contoh: Bank Central Asia"
        :error="errors.nama"
        required
      />

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Logo Bank (Opsional)</label>
        <div 
          class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
          @click="triggerFileInput"
        >
          <!-- Hidden File Input -->
          <input id="file-upload" type="file" class="sr-only" accept=".jpg,.jpeg,.png" @change="handleFileChange" ref="fileInputRef" />
          
          <!-- Kosong (Upload Zone) -->
          <div class="space-y-1 text-center" v-if="!imagePreview">
            <div class="w-12 h-12 mx-auto bg-green-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg class="h-6 w-6 text-green-600" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <div class="flex text-sm text-gray-600 justify-center mt-4">
              <label for="file-upload" class="relative cursor-pointer bg-transparent rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none">
                <span>Klik untuk unggah</span>
              </label>
              <p class="pl-1">atau seret ke sini</p>
            </div>
            <p class="text-xs text-gray-500 mt-2 font-medium">PNG, JPG, JPEG (Max. 200KB)</p>
            <p class="text-[10px] text-gray-400 mt-1">Dimensi: 300x150 px (Otomatis disesuaikan)</p>
          </div>
          
          <!-- Terisi (Preview) -->
          <div v-else class="relative w-full flex flex-col items-center justify-center animate-fade-in">
            <div class="relative group/image">
              <img :src="imagePreview" alt="Preview" class="h-32 object-contain rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 bg-white p-3" />
              
              <!-- Hover Overlay for Replace -->
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-[2px]">
                 <label for="file-upload" class="cursor-pointer text-white flex flex-col items-center font-medium text-sm">
                    <svg class="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Ganti Foto
                 </label>
              </div>
            </div>

            <button type="button" @click.stop="removeImage" class="mt-5 inline-flex items-center px-4 py-1.5 border border-transparent text-xs font-semibold rounded-full shadow-sm text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors">
              <svg class="-ml-1 mr-1.5 h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Hapus Gambar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Overlay for Errors -->
    <Notification
      :showNotification="showNotification"
      :notificationType="notificationType"
      :notificationMessage="notificationMessage"
      @close="hideNotification"
    />
  </BaseFormModal>
</template>
