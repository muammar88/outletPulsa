<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { ProdukPrabayarService } from '../services/ProdukPrabayarService';
import { ref, watch } from 'vue';
import type { Produk } from '../types/ProdukPrabayar';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: Produk | null;
  loading: boolean;
  operators: any[];
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
  purchase_price: 0,
  markup: 0,
  operatorId: '' as any,
  status: 'active',
});

const form = ref<Partial<Produk>>(defaultForm());

import { computed, ref, watch } from 'vue';
const selectedKategori = ref('');

const kategoriOptions = computed(() => {
  const kats = new Set<string>();
  props.operators.forEach(op => {
    kats.add(op.kategori?.name || 'Lainnya');
  });
  const arr = Array.from(kats).sort();
  return [
    { id: '', name: '-- Pilih Kategori --' },
    ...arr.map(k => ({ id: k, name: k }))
  ];
});

const operatorOptions = computed(() => {
  let filtered = props.operators;
  if (selectedKategori.value) {
    filtered = filtered.filter(op => (op.kategori?.name || 'Lainnya') === selectedKategori.value);
  }
  return [
    { id: '', name: '-- Pilih Operator --' },
    ...filtered.map(op => ({
      id: op.id,
      name: op.kode ? `${op.name} (${op.kode})` : op.name
    }))
  ];
});

watch(selectedKategori, (newVal, oldVal) => {
  if (oldVal !== '' && !isLoading.value && form.value.operatorId) {
    // Only reset if the newly selected category doesn't contain the currently selected operator
    const currentOp = props.operators.find(o => o.id === form.value.operatorId);
    if (!currentOp || (currentOp.kategori?.name || 'Lainnya') !== newVal) {
      form.value.operatorId = '';
    }
  }
});

const statusOptions = [
  { id: 'active', name: 'Aktif' },
  { id: 'inactive', name: 'Tidak Aktif' },
];

const resetForm = () => {
  form.value = defaultForm();
  errors.value = {};
  selectedKategori.value = '';
};

const loadFormData = async () => {
  if (props.mode === 'edit' && props.initialData) {
    isLoading.value = true;
    try {
      const response = await ProdukPrabayarService.getById(props.initialData.id!);
      const data = response.data.data;
      form.value = {
        kode: data.kode || '',
        name: data.name || '',
        purchase_price: data.purchase_price || 0,
        markup: data.markup || 0,
        status: data.status || 'active',
        operatorId: data.operatorId || '',
        serverId: data.serverId,
      };
      
      if (data.operatorId) {
        const op = props.operators.find(o => o.id === data.operatorId);
        if (op) {
          selectedKategori.value = op.kategori?.name || 'Lainnya';
        }
      } else {
        selectedKategori.value = '';
      }
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
  if (!form.value.operatorId) {
    errors.value.operatorId = 'Operator harus dipilih.';
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
  if (payload.operatorId) {
    payload.operatorId = Number(payload.operatorId);
  }

  try {
    if (props.mode === 'add') {
      await ProdukPrabayarService.create(payload);
      displayNotification('Produk baru berhasil ditambahkan', 'success');
    } else {
      await ProdukPrabayarService.update(props.initialData!.id!, payload);
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
      <SelectField
        v-model="selectedKategori"
        id="kategori"
        label="Pilih Kategori"
        :options="kategoriOptions"
        :error="errors?.kategori"
      />
      <SelectField
        v-model="form.operatorId"
        id="operatorId"
        label="Pilih Operator"
        :options="operatorOptions"
        :error="errors?.operatorId"
        required
      />
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
