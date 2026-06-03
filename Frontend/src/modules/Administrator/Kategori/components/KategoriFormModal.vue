<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { kategoriService, type Kategori } from '@/service/administrator/kategori';
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: Kategori | null;
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

const defaultForm = (): Kategori => ({
  kode: '',
  name: '',
  type: 'prabayar',
});

const form = ref<Kategori>(defaultForm());

const typeOptions = [
  { id: 'prabayar', name: 'Prabayar' },
  { id: 'pascabayar', name: 'Pascabayar' },
];

const resetForm = () => {
  form.value = defaultForm();
  errors.value = {};
};

const loadFormData = async () => {
  if (props.mode === 'edit' && props.initialData) {
    isLoading.value = true;
    try {
      const response = await kategoriService.getById(props.initialData.id!);
      const data = response.data.data;
      form.value = {
        kode: data.kode || '',
        name: data.name || '',
        type: data.type || 'prabayar',
      };
    } catch (error) {
      console.error('Gagal mengambil detail kategori:', error);
      form.value = { ...defaultForm(), ...props.initialData };
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

  if (!form.value.kode.trim()) {
    errors.value.kode = 'Kode kategori tidak boleh kosong.';
    isValid = false;
  }
  if (!form.value.name.trim()) {
    errors.value.name = 'Nama kategori tidak boleh kosong.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload = { ...form.value };

  try {
    if (props.mode === 'add') {
      await kategoriService.create(payload);
      displayNotification('Kategori baru berhasil ditambahkan', 'success');
    } else {
      await kategoriService.update(props.initialData!.id!, payload);
      displayNotification('Data kategori berhasil diperbarui', 'success');
    }

    emit('close');
  } catch (error: any) {
    console.error('Submit error:', error);
    const errMessage = error.response?.data?.message || 'Gagal menyimpan data kategori';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    :label="mode === 'add' ? 'Tambah Kategori Baru' : 'Edit Data Kategori'"
    :submit-label="mode === 'add' ? 'Tambahkan Kategori' : 'Perbarui Perubahan'"
    :width="`w-full max-w-xl`"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="handleSubmit"
  >
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <LoadingSpinner label="Mengambil data terbaru..." />
    </div>

    <div v-else>
      <div class="mb-2 text-xs text-red-500 italic text-right">
        * Wajib diisi
      </div>
      <div class="grid grid-cols-1 gap-4">
        <InputText
          v-model="form.kode"
          id="kode"
          label="Kode Kategori"
          placeholder="Cth: PLS, DATA, PASCABAYAR"
          required
          :errorMessage="errors?.kode"
        />
        <InputText
          v-model="form.name"
          id="name"
          label="Nama Kategori"
          placeholder="Masukkan nama kategori"
          required
          :errorMessage="errors?.name"
        />
        <SelectField
          v-model="form.type"
          id="type"
          label="Tipe Produk"
          :options="typeOptions"
          :error="errors?.type"
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
