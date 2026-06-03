<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import InputCurrency from '@/components/Form/InputCurrency.vue';
import InputPassword from '@/components/Form/InputPassword.vue';
import SelectField from '@/components/Form/SelectField.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { agenService } from '@/service/administrator/agen';
import { ref, watch } from 'vue';

type Agen = {
  id?: number;
  kode?: string;
  fullname: string;
  whatsappnumber: string;
  kode_agen?: string;
  password?: string;
  password_confirmation?: string;
  saldo?: number;
  status?: string;
};

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: Agen | null;
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

const defaultForm = (): Agen => ({
  fullname: '',
  whatsappnumber: '',
  kode_agen: '',
  password: '',
  password_confirmation: '',
  saldo: 0,
  status: 'unverified',
});

const form = ref<Agen>(defaultForm());

const statusOptions = [
  { id: 'verfied', name: 'Verified' },
  { id: 'unverified', name: 'Unverified' },
];

const resetForm = () => {
  form.value = defaultForm();
  errors.value = {};
};

const loadFormData = async () => {
  if (props.mode === 'edit' && props.initialData) {
    isLoading.value = true;
    try {
      const response = await agenService.getById(props.initialData.id!);
      const data = response.data.data;
      form.value = {
        fullname: data.fullname || '',
        whatsappnumber: data.whatsappnumber || '',
        kode_agen: data.kode_agen || '',
        saldo: data.saldo || 0,
        status: data.status || 'unverified',
      };
    } catch (error) {
      console.error('Gagal mengambil detail agen:', error);
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

  if (!form.value.fullname.trim()) {
    errors.value.fullname = 'Nama lengkap tidak boleh kosong.';
    isValid = false;
  }
  if (!form.value.whatsappnumber.trim()) {
    errors.value.whatsappnumber = 'Nomor WhatsApp tidak boleh kosong.';
    isValid = false;
  }
  if (props.mode === 'edit' && form.value.kode_agen && props.initialData?.kode && form.value.kode_agen === props.initialData.kode) {
    errors.value.kode_agen = 'Kode agen tidak boleh kode agen sendiri.';
    isValid = false;
  }
  if (props.mode === 'add') {
    if (!form.value.password || form.value.password.length < 6) {
      errors.value.password = 'Password minimal 6 karakter.';
      isValid = false;
    }
    if (form.value.password !== form.value.password_confirmation) {
      errors.value.password_confirmation = 'Konfirmasi password tidak cocok.';
      isValid = false;
    }
  } else if (props.mode === 'edit' && form.value.password) {
    if (form.value.password.length < 6) {
      errors.value.password = 'Password minimal 6 karakter.';
      isValid = false;
    }
    if (form.value.password !== form.value.password_confirmation) {
      errors.value.password_confirmation = 'Konfirmasi password tidak cocok.';
      isValid = false;
    }
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload = { ...form.value };
  delete payload.password_confirmation;

  try {
    if (props.mode === 'add') {
      await agenService.create(payload);
      displayNotification('Agen baru berhasil ditambahkan', 'success');
    } else {
      await agenService.update(props.initialData!.id!, payload);
      displayNotification('Data agen berhasil diperbarui', 'success');
    }

    emit('close');
  } catch (error: any) {
    console.error('Submit error:', error);
    const errMessage = error.response?.data?.message || 'Gagal menyimpan data agen';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    :label="mode === 'add' ? 'Tambah Agen Baru' : 'Edit Data Agen'"
    :submit-label="mode === 'add' ? 'Tambahkan Agen' : 'Perbarui Perubahan'"
    :width="`w-full max-w-2xl`"
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="md:col-span-2">
        <InputText
          v-model="form.fullname"
          id="fullname"
          label="Nama Lengkap"
          placeholder="Masukkan nama lengkap"
          required
          :errorMessage="errors?.fullname"
        />
      </div>
      <InputText
        v-model="form.whatsappnumber"
        id="whatsappnumber"
        label="Nomor WhatsApp"
        placeholder="Cth: 08123456789"
        required
        :errorMessage="errors?.whatsappnumber"
      />
      <InputText
        v-model="form.kode_agen"
        id="kode_agen"
        label="Kode Agen (Opsional)"
        placeholder="Masukkan kode agen"
        :errorMessage="errors?.kode_agen"
      />
      <SelectField
        v-model="form.status"
        id="status"
        label="Status Verifikasi"
        :options="statusOptions"
        :error="errors?.status"
      />
      <InputCurrency
        v-model="form.saldo"
        id="saldo"
        label="Saldo Awal"
        placeholder="Cth: 150000"
        :error="errors?.saldo"
      />
      <InputPassword
        v-model="form.password"
        id="password"
        label="Password"
        :placeholder="mode === 'add' ? 'Password' : 'Kosongkan jika tidak diubah'"
        :required="mode === 'add' || !!form.password"
        :error="errors?.password"
      />
      <InputPassword
        v-model="form.password_confirmation"
        id="password_confirmation"
        label="Konfirmasi Password"
        :placeholder="mode === 'add' ? 'Konf Password' : 'Kosongkan jika tidak diubah'"
        :required="mode === 'add' || !!form.password"
        :error="errors?.password_confirmation"
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
