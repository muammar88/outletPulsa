<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { operatorService, type Operator } from '@/service/administrator/operator';
import { kategoriService, type Kategori } from '@/service/administrator/kategori';
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: Operator | null;
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
const kategoriOptions = ref<{ id: number; name: string }[]>([]);

const defaultForm = (): Operator => ({
  kode: '',
  name: '',
  status: 'active',
  kategoriId: null,
});

const form = ref<Operator>(defaultForm());

const fetchKategoriOptions = async () => {
  try {
    const res = await kategoriService.getAll('', 100, 1);
    kategoriOptions.value = res.data.data.list.map((k: Kategori) => ({
      id: k.id!,
      name: `${k.name} (${k.type})`
    }));
  } catch (error) {
    console.error('Gagal mengambil daftar kategori:', error);
  }
};

const resetForm = () => {
  form.value = defaultForm();
  errors.value = {};
};

const loadFormData = async () => {
  if (props.mode === 'edit' && props.initialData) {
    isLoading.value = true;
    try {
      const response = await operatorService.getById(props.initialData.id!);
      const data = response.data.data;
      form.value = {
        kode: data.kode || '',
        name: data.name || '',
        status: data.status || 'active',
        kategoriId: data.kategoriId || null,
      };
    } catch (error) {
      console.error('Gagal mengambil detail operator:', error);
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
      if (kategoriOptions.value.length === 0) {
        await fetchKategoriOptions();
      }
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
    errors.value.kode = 'Kode operator tidak boleh kosong.';
    isValid = false;
  }
  if (!form.value.name.trim()) {
    errors.value.name = 'Nama operator tidak boleh kosong.';
    isValid = false;
  }
  if (!form.value.kategoriId) {
    errors.value.kategoriId = 'Kategori harus dipilih.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload = { ...form.value };

  try {
    if (props.mode === 'add') {
      await operatorService.create(payload);
      displayNotification('Operator baru berhasil ditambahkan', 'success');
    } else {
      await operatorService.update(props.initialData!.id!, payload);
      displayNotification('Data operator berhasil diperbarui', 'success');
    }

    emit('close');
  } catch (error: any) {
    console.error('Submit error:', error);
    const errMessage = error.response?.data?.message || 'Gagal menyimpan data operator';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    :label="mode === 'add' ? 'Tambah Operator Baru' : 'Edit Data Operator'"
    :submit-label="mode === 'add' ? 'Tambahkan Operator' : 'Perbarui Perubahan'"
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
          label="Kode Operator"
          placeholder="Cth: TSEL, ISAT, XL"
          required
          :errorMessage="errors?.kode"
        />
        <InputText
          v-model="form.name"
          id="name"
          label="Nama Operator"
          placeholder="Masukkan nama operator"
          required
          :errorMessage="errors?.name"
        />
        <SelectField
          v-model="form.kategoriId"
          id="kategoriId"
          label="Kategori"
          :options="kategoriOptions"
          :error="errors?.kategoriId"
        />
        <SelectField
          v-model="form.status"
          id="status"
          label="Status Operator"
          :options="[
            { id: 'active', name: 'Aktif' },
            { id: 'non_active', name: 'Non Aktif' }
          ]"
          :error="errors?.status"
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
