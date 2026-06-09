<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import { useNotification } from '@/composables/useNotification';
import { operatorPascabayarTripayService, type OperatorPascabayarTripay } from '@/service/administrator/operatorPascabayarTripay';
import type { KategoriPascabayarTripay } from '@/service/administrator/kategoriPascabayarTripay';
import { ref, watch, computed } from 'vue';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: OperatorPascabayarTripay | null;
  loading: boolean;
  kategoriList: KategoriPascabayarTripay[];
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

type FormData = { name: string; kode: string; kategoriId: string };

const defaultForm = (): FormData => ({ name: '', kode: '', kategoriId: '' });
const form = ref<FormData>(defaultForm());

// Map kategori ke format options SelectField
const kategoriOptions = computed(() =>
  props.kategoriList.map((k) => ({ id: String(k.id), name: k.name || '-' })),
);

const resetForm = () => {
  form.value = defaultForm();
  errors.value = {};
};

const loadFormData = async () => {
  if (props.mode === 'edit' && props.initialData) {
    isLoading.value = true;
    try {
      const response = await operatorPascabayarTripayService.getById(props.initialData.id);
      const data = response.data.data;
      form.value = {
        name: data.name || '',
        kode: data.kode || '',
        kategoriId: data.kategoriId ? String(data.kategoriId) : '',
      };
    } catch (error) {
      console.error('Gagal mengambil detail operator:', error);
      form.value = {
        name: props.initialData.name || '',
        kode: props.initialData.kode || '',
        kategoriId: props.initialData.kategoriId ? String(props.initialData.kategoriId) : '',
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
    errors.value.name = 'Nama operator tidak boleh kosong.';
    isValid = false;
  }
  if (!form.value.kode.trim()) {
    errors.value.kode = 'Kode operator tidak boleh kosong.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload = {
    name: form.value.name,
    kode: form.value.kode,
    kategoriId: form.value.kategoriId ? Number(form.value.kategoriId) : undefined,
  };

  try {
    if (props.mode === 'add') {
      await operatorPascabayarTripayService.create(payload);
      displayNotification('Operator baru berhasil ditambahkan', 'success');
    } else {
      await operatorPascabayarTripayService.update(props.initialData!.id, payload);
      displayNotification('Data operator berhasil diperbarui', 'success');
    }
    emit('close');
  } catch (error: any) {
    const errMessage = error.response?.data?.message || 'Gagal menyimpan data operator';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    :label="mode === 'add' ? 'Tambah Operator Pascabayar Tripay' : 'Edit Operator Pascabayar Tripay'"
    :submit-label="mode === 'add' ? 'Tambahkan Operator' : 'Perbarui Perubahan'"
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
          id="operator-name"
          label="Nama Operator"
          placeholder="Masukkan nama operator"
          required
          :errorMessage="errors?.name"
        />
        <InputText
          v-model="form.kode"
          id="operator-kode"
          label="Kode Operator"
          placeholder="Masukkan kode operator"
          required
          :errorMessage="errors?.kode"
        />
        <SelectField
          v-model="form.kategoriId"
          id="operator-kategori"
          label="Kategori (Opsional)"
          :options="kategoriOptions"
          :error="errors?.kategoriId"
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
