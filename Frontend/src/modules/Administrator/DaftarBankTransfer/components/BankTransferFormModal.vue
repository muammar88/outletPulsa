<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import SelectField from '@/components/Form/SelectField.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { bankService, type Bank } from '@/service/administrator/bank';
import { bankTransferOutletService, type BankTransferOutlet } from '@/service/administrator/bank-transfer-outlet';
import { ref, watch, onMounted } from 'vue';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: BankTransferOutlet | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: BankTransferOutlet): void;
}>();

const defaultForm = (): BankTransferOutlet => ({
  bankId: 0,
  accountName: '',
  accountNumber: '',
});

const form = ref<BankTransferOutlet>(defaultForm());
const errors = ref<Partial<Record<keyof BankTransferOutlet, string>>>({});
const isLoading = ref(false);
const banks = ref<{ id: number; name: string }[]>([]);

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const loadBanks = async () => {
  try {
    const response = await bankService.getAll('', 100, 1);
    const bankList = response.data.data.list.map((b: Bank) => ({
      id: b.id!,
      name: `${b.kode} - ${b.nama}`,
    }));
    banks.value = [{ id: 0, name: '-- Pilih Bank --' }, ...bankList];
  } catch (error) {
    displayNotification('Gagal memuat daftar bank', 'error');
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      errors.value = {};
      if (props.mode === 'edit' && props.initialData) {
        form.value = { ...props.initialData };
      } else {
        form.value = defaultForm();
      }
    }
  }
);

onMounted(() => {
  loadBanks();
});

const handleAccountNumberInput = (val: string) => {
  form.value.accountNumber = val.replace(/[^0-9]/g, '');
};

const validateForm = () => {
  errors.value = {};
  if (!form.value.bankId) {
    errors.value.bankId = 'Bank harus dipilih';
  }
  if (!form.value.accountName) {
    errors.value.accountName = 'Nama rekening harus diisi';
  }
  if (!form.value.accountNumber) {
    errors.value.accountNumber = 'Nomor rekening harus diisi';
  }
  return Object.keys(errors.value).length === 0;
};

const submitForm = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    const payload = {
      bankId: Number(form.value.bankId),
      accountName: form.value.accountName,
      accountNumber: form.value.accountNumber,
    };

    if (props.mode === 'add') {
      await bankTransferOutletService.create(payload);
    } else if (props.mode === 'edit' && form.value.id) {
      await bankTransferOutletService.update(form.value.id, payload);
    }
    emit('submit', form.value);
    emit('close');
  } catch (error: any) {
    displayNotification(
      error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.',
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
    :label="mode === 'add' ? 'Tambah Bank Transfer' : 'Edit Bank Transfer'"
    :submit-label="mode === 'add' ? 'Tambahkan Bank Transfer' : 'Simpan Perubahan'"
    :width="'w-full md:w-1/3'"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="submitForm"
  >
    <div class="space-y-4">
      <SelectField
        id="bankId"
        label="Bank"
        v-model="form.bankId"
        :options="banks"
        :error="errors.bankId"
        required
      />

      <InputText
        id="accountNumber"
        label="Nomor Rekening"
        :model-value="form.accountNumber"
        @update:model-value="handleAccountNumberInput"
        placeholder="Contoh: 1234567890"
        :error="errors.accountNumber"
        required
      />

      <InputText
        id="accountName"
        label="Atas Nama (Pemilik Rekening)"
        v-model="form.accountName"
        placeholder="Contoh: Budi Santoso"
        :error="errors.accountName"
        required
      />
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
