<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { ProdukPascabayarService } from '../services/ProdukPascabayarService';
import { ref, watch } from 'vue';
import type { Produk } from '../types/ProdukPascabayar';

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
  fee: 0,
  comission: 0,
  outletFee: 0,
  status: 'active',
});

const form = ref<Partial<Produk>>(defaultForm());


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
      const response = await ProdukPascabayarService.getById(props.initialData.id!);
      const data = response.data.data;
      form.value = {
        kode: data.kode || '',
        name: data.name || '',
        fee: data.fee || 0,
        comission: data.comission || 0,
        outletFee: data.outletFee || 0,
        status: data.status || 'active',
        kategoriId: data.kategoriId,
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
  if (form.value.fee === undefined || form.value.fee < 0) {
    errors.value.fee = 'Fee harus angka positif.';
    isValid = false;
  }
  if (form.value.comission === undefined || form.value.comission < 0) {
    errors.value.comission = 'Komisi harus angka positif.';
    isValid = false;
  }
  if (form.value.outletFee === undefined || form.value.outletFee < 0) {
    errors.value.outletFee = 'Outlet Fee harus angka positif.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload = { ...form.value };

  try {
    if (props.mode === 'add') {
      await ProdukPascabayarService.create(payload);
      displayNotification('Produk baru berhasil ditambahkan', 'success');
    } else {
      await ProdukPascabayarService.update(props.initialData!.id!, payload);
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
      <InputText
        v-model="form.fee"
        id="fee"
        label="Fee"
        type="number"
        placeholder="Cth: 9500"
        required
        :errorMessage="errors?.fee"
      />
      <InputText
        v-model="form.comission"
        id="comission"
        label="Komisi Pusat"
        type="number"
        placeholder="Cth: 500"
        required
        :errorMessage="errors?.comission"
      />
      <InputText
        v-model="form.outletFee"
        id="outletFee"
        label="Outlet Fee"
        type="number"
        placeholder="Cth: 1500"
        required
        :errorMessage="errors?.outletFee"
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
