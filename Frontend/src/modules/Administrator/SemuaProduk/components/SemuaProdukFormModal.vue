<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { semuaProdukService } from '../services/semuaProdukService';
import { ref, watch } from 'vue';
import type { Produk } from '../types/semuaProduk';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: Produk | null;
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

const defaultForm = (): Partial<Produk> => ({
  kode: '',
  name: '',
  type: 'prabayar',
  purchase_price: 0,
  markup: 0,
  status: 'active',
});

const form = ref<Partial<Produk>>(defaultForm());

const typeOptions = [
  { id: 'prabayar', name: 'Prabayar' },
  { id: 'pascabayar', name: 'Pascabayar' },
];

const statusOptions = [
  { id: 'active', name: 'Aktif' },
  { id: 'inactive', name: 'Tidak Aktif' },
];

const resetForm = () => {
  form.value = defaultForm();
  errors.value = {};
};

const loadFormData = async () => {
  if (props.mode === 'edit' && props.initialData) {
    isLoading.value = true;
    try {
      const response = await semuaProdukService.getById(props.initialData.id!);
      const data = response.data.data;
      form.value = {
        kode: data.kode || '',
        name: data.name || '',
        type: data.type || 'prabayar',
        purchase_price: data.purchase_price || 0,
        markup: data.markup || 0,
        status: data.status || 'active',
        operatorId: data.operatorId,
        serverId: data.serverId,
      };
    } catch (error) {
      console.error('Gagal mengambil detail produk:', error);
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

  if (!form.value.kode?.trim()) {
    errors.value.kode = 'Kode produk tidak boleh kosong.';
    isValid = false;
  }
  if (!form.value.name?.trim()) {
    errors.value.name = 'Nama produk tidak boleh kosong.';
    isValid = false;
  }
  if (form.value.purchase_price === undefined || form.value.purchase_price < 0) {
    errors.value.purchase_price = 'Harga beli harus angka positif.';
    isValid = false;
  }
  if (form.value.markup === undefined || form.value.markup < 0) {
    errors.value.markup = 'Markup harus angka positif.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload = { ...form.value };

  try {
    if (props.mode === 'add') {
      await semuaProdukService.create(payload);
      displayNotification('Produk baru berhasil ditambahkan', 'success');
    } else {
      await semuaProdukService.update(props.initialData!.id!, payload);
      displayNotification('Data produk berhasil diperbarui', 'success');
    }

    emit('close');
  } catch (error: any) {
    console.error('Submit error:', error);
    const errMessage = error.response?.data?.message || 'Gagal menyimpan data produk';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  }
};
</script>

<template>
  <div>
    <BaseFormModal
    :form-status="show"
    :label="mode === 'add' ? 'Tambah Produk Baru' : 'Edit Data Produk'"
    :submit-label="mode === 'add' ? 'Tambahkan Produk' : 'Perbarui Perubahan'"
    :width="`w-full max-w-2xl`"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="handleSubmit"
  >
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <LoadingSpinner label="Mengambil data terbaru..." />
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InputText
        v-model="form.kode"
        id="kode"
        label="Kode Produk"
        placeholder="Cth: P10"
        required
        :errorMessage="errors?.kode"
      />
      <InputText
        v-model="form.name"
        id="name"
        label="Nama Produk"
        placeholder="Cth: Pulsa Telkomsel 10.000"
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
      <InputText
        v-model="form.purchase_price"
        id="purchase_price"
        label="Harga Beli"
        type="number"
        placeholder="Cth: 9500"
        required
        :errorMessage="errors?.purchase_price"
      />
      <InputText
        v-model="form.markup"
        id="markup"
        label="Markup Harga"
        type="number"
        placeholder="Cth: 500"
        required
        :errorMessage="errors?.markup"
      />
      <SelectField
        v-model="form.status"
        id="status"
        label="Status Aktif"
        :options="statusOptions"
        :error="errors?.status"
      />
    </div>
  </BaseFormModal>

  <Notification
    :show-notification="showNotification"
    :notification-type="notificationType"
    :notification-message-html="notificationMessage"
    @close="hideNotification"
  />
  </div>
</template>
