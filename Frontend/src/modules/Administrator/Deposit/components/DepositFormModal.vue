<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import InputCurrency from '@/components/Form/InputCurrency.vue';
import SelectField from '@/components/Form/SelectField.vue';
import TextArea from '@/components/Form/TextArea.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { depositService } from '@/service/administrator/deposit';
import { ref, watch } from 'vue';

type RiwayatSaldo = {
  id?: number;
  member_id: number | '';
  nominal: number;
  status: string;
  ket: string;
};

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: RiwayatSaldo | null;
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

const defaultForm = (): RiwayatSaldo => ({
  member_id: '',
  nominal: 0,
  status: 'deposit',
  ket: '',
});

const form = ref<RiwayatSaldo>(defaultForm());

const statusOptions = [
  { id: 'pembelian_pulsa', name: 'Pembelian Pulsa' },
  { id: 'deposit', name: 'Deposit' },
  { id: 'transfer_pulsa', name: 'Transfer Pulsa' },
  { id: 'pencairan_fee_agen', name: 'Pencairan Fee Agen' },
];

const resetForm = () => {
  form.value = defaultForm();
  errors.value = {};
};

const loadFormData = async () => {
  if (props.mode === 'edit' && props.initialData) {
    isLoading.value = true;
    try {
      const response = await depositService.getById(props.initialData.id!);
      const data = response.data.data;
      form.value = {
        member_id: data.member_id || '',
        nominal: data.nominal || 0,
        status: data.status || 'deposit',
        ket: data.ket || '',
      };
    } catch (error) {
      console.error('Gagal mengambil detail riwayat:', error);
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

  if (props.mode === 'add' && !form.value.member_id) {
    errors.value.member_id = 'ID Member tidak boleh kosong.';
    isValid = false;
  }
  
  if (props.mode === 'add' && form.value.nominal <= 0) {
    errors.value.nominal = 'Nominal harus lebih dari 0.';
    isValid = false;
  }

  if (!form.value.status) {
    errors.value.status = 'Kategori tidak boleh kosong.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload: any = { ...form.value };
  
  if (payload.member_id) {
    payload.member_id = parseInt(payload.member_id as string, 10);
  }

  try {
    if (props.mode === 'add') {
      await depositService.create(payload);
      displayNotification('Data riwayat saldo berhasil ditambahkan', 'success');
    } else {
      await depositService.update(props.initialData!.id!, { status: payload.status, ket: payload.ket });
      displayNotification('Data riwayat saldo berhasil diperbarui', 'success');
    }

    emit('close');
  } catch (error: any) {
    console.error('Submit error:', error);
    const errMessage = error.response?.data?.message || 'Gagal menyimpan data riwayat saldo';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    :label="mode === 'add' ? 'Tambah Riwayat Saldo' : 'Edit Kategori/Keterangan'"
    :submit-label="mode === 'add' ? 'Simpan' : 'Perbarui'"
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
          v-if="mode === 'add'"
          v-model="form.member_id"
          id="member_id"
          label="ID Member"
          type="number"
          placeholder="Masukkan ID Member (angka)"
          required
          :errorMessage="errors?.member_id"
        />

        <InputCurrency
          v-if="mode === 'add'"
          v-model="form.nominal"
          id="nominal"
          label="Nominal"
          placeholder="Masukkan Nominal"
          :error="errors?.nominal"
        />

        <SelectField
          v-model="form.status"
          id="status"
          label="Kategori"
          :options="statusOptions"
          :error="errors?.status"
        />

        <TextArea
          v-model="form.ket"
          id="ket"
          label="Keterangan"
          placeholder="Tambahkan Keterangan"
          :error="errors?.ket"
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
