<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import InputPassword from '@/components/Form/InputPassword.vue';
import SelectField from '@/components/Form/SelectField.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { memberService } from '@/service/administrator/member';
import { ref, watch } from 'vue';

type Member = {
  id?: number;
  kode?: string;
  fullname: string;
  whatsappnumber: string;
  kode_agen?: string;
  password?: string;
  saldo?: number;
  status?: string;
  type?: string;
  agenType?: string;
};

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: Member | null;
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

const defaultForm = (): Member => ({
  kode: '',
  fullname: '',
  whatsappnumber: '',
  kode_agen: '',
  password: '',
  saldo: 0,
  status: 'unverified',
  type: 'outletpulsa',
  agenType: 'silver',
});

const form = ref<Member>(defaultForm());

const typeOptions = [
  { id: 'outletpulsa', name: 'Outlet Pulsa' },
  { id: 'amra', name: 'AMRA' },
];

const statusOptions = [
  { id: 'verfied', name: 'Verified' },
  { id: 'unverified', name: 'Unverified' },
];

const agenTypeOptions = [
  { id: 'silver', name: 'Silver' },
  { id: 'gold', name: 'Gold' },
  { id: 'platinum', name: 'Platinum' },
];

const resetForm = () => {
  form.value = defaultForm();
  errors.value = {};
};

const loadFormData = async () => {
  if (props.mode === 'edit' && props.initialData) {
    isLoading.value = true;
    try {
      const response = await memberService.getById(props.initialData.id!);
      const data = response.data.data;
      form.value = {
        kode: data.kode || '',
        fullname: data.fullname || '',
        whatsappnumber: data.whatsappnumber || '',
        kode_agen: data.kode_agen || '',
        saldo: data.saldo || 0,
        status: data.status || 'unverified',
        type: data.type || 'outletpulsa',
        agenType: data.agenType || 'silver',
      };
    } catch (error) {
      console.error('Gagal mengambil detail member:', error);
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

  if (!form.value.kode?.trim() && props.mode === 'add') {
    errors.value.kode = 'Kode member tidak boleh kosong.';
    isValid = false;
  }
  if (!form.value.fullname.trim()) {
    errors.value.fullname = 'Nama lengkap tidak boleh kosong.';
    isValid = false;
  }
  if (!form.value.whatsappnumber.trim()) {
    errors.value.whatsappnumber = 'Nomor WhatsApp tidak boleh kosong.';
    isValid = false;
  }
  if (props.mode === 'add' && (!form.value.password || form.value.password.length < 6)) {
    errors.value.password = 'Password minimal 6 karakter.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  const payload = { ...form.value };

  try {
    if (props.mode === 'add') {
      await memberService.create(payload);
      displayNotification('Member baru berhasil ditambahkan', 'success');
    } else {
      await memberService.update(props.initialData!.id!, payload);
      displayNotification('Data member berhasil diperbarui', 'success');
    }

    emit('close');
  } catch (error: any) {
    console.error('Submit error:', error);
    const errMessage = error.response?.data?.message || 'Gagal menyimpan data member';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    :label="mode === 'add' ? 'Tambah Member Baru' : 'Edit Data Member'"
    :submit-label="mode === 'add' ? 'Tambahkan Member' : 'Perbarui Perubahan'"
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
        label="Kode Member"
        placeholder="Cth: MBR001"
        required
        :errorMessage="errors?.kode"
      />
      <InputText
        v-model="form.fullname"
        id="fullname"
        label="Nama Lengkap"
        placeholder="Masukkan nama lengkap"
        required
        :errorMessage="errors?.fullname"
      />
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
        v-model="form.type"
        id="type"
        label="Tipe Member"
        :options="typeOptions"
        :error="errors?.type"
      />
      <SelectField
        v-model="form.agenType"
        id="agenType"
        label="Tipe Agen"
        :options="agenTypeOptions"
        :error="errors?.agenType"
      />
      <SelectField
        v-model="form.status"
        id="status"
        label="Status Verifikasi"
        :options="statusOptions"
        :error="errors?.status"
      />
      <InputText
        v-model="form.saldo"
        id="saldo"
        label="Saldo Awal"
        type="number"
        placeholder="Cth: 150000"
        :errorMessage="errors?.saldo"
      />
      <InputPassword
        v-if="mode === 'add'"
        v-model="form.password"
        id="password"
        label="Password"
        placeholder="Masukkan password member"
        required
        :errorMessage="errors?.password"
      />
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
