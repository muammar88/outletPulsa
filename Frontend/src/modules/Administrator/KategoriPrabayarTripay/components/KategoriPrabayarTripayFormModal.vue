<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import { useNotification } from '@/composables/useNotification';
import { kategoriPrabayarTripayService, type KategoriPrabayarTripay } from '@/service/administrator/kategoriPrabayarTripay';
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: KategoriPrabayarTripay | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
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

type FormData = { name: string; type: string };

const defaultForm = (): FormData => ({ name: '', type: '' });
const form = ref<FormData>(defaultForm());

const resetForm = () => {
  form.value = defaultForm();
  errors.value = {};
};

const loadFormData = async () => {
  if (props.mode === 'edit' && props.initialData) {
    isLoading.value = true;
    try {
      const response = await kategoriPrabayarTripayService.getById(props.initialData.id);
      const data = response.data.data;
      form.value = {
        name: data.name || '',
        type: data.type || '',
      };
    } catch (error) {
      console.error('Gagal mengambil detail kategori:', error);
      form.value = {
        name: props.initialData.name || '',
        type: props.initialData.type || '',
      };
    } finally {
      isLoading.value = false;
    }
  } else {
    resetForm();
  }
};

watch(
  () => props.show,
  async (isShow) => {
    if (isShow) {
      await loadFormData();
    } else {
      resetForm();
    }
  },
);

const validateForm = () => {
  let isValid = true;
  errors.value = {};

  if (!form.value.name.trim()) {
    errors.value.name = 'Nama kategori tidak boleh kosong.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  try {
    if (props.mode === 'add') {
      await kategoriPrabayarTripayService.create({ name: form.value.name, type: form.value.type });
      displayNotification('Kategori baru berhasil ditambahkan', 'success');
    } else {
      await kategoriPrabayarTripayService.update(props.initialData!.id, {
        name: form.value.name,
        type: form.value.type,
      });
      displayNotification('Data kategori berhasil diperbarui', 'success');
    }
    emit('close');
  } catch (error: any) {
    const errMessage = error.response?.data?.message || 'Gagal menyimpan data kategori';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    :label="mode === 'add' ? 'Tambah Kategori Prabayar Tripay' : 'Edit Kategori Prabayar Tripay'"
    :submit-label="mode === 'add' ? 'Tambahkan Kategori' : 'Perbarui Perubahan'"
    :width="`w-full max-w-lg`"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="handleSubmit"
  >
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <LoadingSpinner label="Mengambil data terbaru..." />
    </div>

    <div v-else>
      <div class="mb-2 text-xs text-red-500 italic text-right">* Wajib diisi</div>
      <div class="grid grid-cols-1 gap-4">
        <InputText
          v-model="form.name"
          id="kategori-name"
          label="Nama Kategori"
          placeholder="Masukkan nama kategori"
          required
          :errorMessage="errors?.name"
        />
        <InputText
          v-model="form.type"
          id="kategori-type"
          label="Kode / Tipe (Opsional)"
          placeholder="Contoh: PPOB, PULSA"
          :errorMessage="errors?.type"
        />
      </div>
    </div>
  </BaseFormModal>

  <!-- Notification Modal -->
  <Notification
    :show-notification="showNotification"
    :notification-type="notificationType"
    :notification-message-html="notificationMessage"
    @close="hideNotification"
  />
</template>
