<script setup lang="ts">
import InputCurrency from '@/components/Form/InputCurrency.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Confirmation from '@/components/Modal/Confirmation.vue';
import { useNotification } from '@/composables/useNotification';
import { memberService, type Member } from '@/service/administrator/member';
import { ref, watch } from 'vue';
import { useConfirmation } from '@/composables/useConfirmation';

const props = defineProps<{
  show: boolean;
  member: Member | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const { displayNotification } = useNotification();
const { displayConfirmation, showConfirmDialog, confirmTitle, confirmMessage, confirm, cancel } = useConfirmation();

const errors = ref<Record<string, string>>({});
const form = ref({
  nominal: 0,
});
const isSubmitting = ref(false);

const resetForm = () => {
  form.value.nominal = 0;
  errors.value = {};
};

watch(
  () => props.show,
  (isShow) => {
    if (!isShow) resetForm();
  }
);

const validateForm = () => {
  let isValid = true;
  errors.value = {};

  if (!form.value.nominal) {
    errors.value.nominal = 'Nominal saldo wajib diisi.';
    isValid = false;
  } else if (form.value.nominal <= 0) {
    errors.value.nominal = 'Nominal saldo harus lebih besar dari 0.';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = () => {
  if (!validateForm()) return;
  if (!props.member) return;

  displayConfirmation(
    'Konfirmasi Tambah Saldo',
    `Apakah Anda yakin ingin menambahkan saldo sebesar <strong>Rp ${form.value.nominal.toLocaleString('id-ID')}</strong> ke member <strong>${props.member.fullname}</strong>?`,
    async () => {
      isSubmitting.value = true;
      try {
        await memberService.tambahSaldo(props.member!.id!, form.value.nominal);
        displayNotification('Saldo berhasil ditambahkan', 'success');
        emit('success');
      } catch (error: any) {
        console.error('Submit error:', error);
        const errMessage = error.response?.data?.message || 'Gagal menambahkan saldo';
        displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
      } finally {
        isSubmitting.value = false;
      }
    }
  );
};
</script>

<template>
  <div>
    <BaseFormModal
      :form-status="show"
      label="Tambah Saldo Member"
      submit-label="Simpan"
      :width="`w-full max-w-md`"
      @close="emit('close')"
      @cancel="emit('close')"
      @submit="handleSubmit"
    >
      <div v-if="isSubmitting" class="flex justify-center items-center py-20">
        <LoadingSpinner label="Memproses..." />
      </div>

      <div v-else>
        <div v-if="member" class="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p class="text-xs text-gray-500 uppercase font-semibold">Member</p>
          <p class="text-sm font-bold text-gray-800">{{ member.fullname }} ({{ member.kode }})</p>
          <p class="text-xs text-gray-500 uppercase font-semibold mt-2">Saldo Saat Ini</p>
          <p class="text-sm font-bold text-emerald-600">Rp {{ (member.saldo || 0).toLocaleString('id-ID') }}</p>
        </div>
        
        <div class="mb-2 text-xs text-red-500 italic text-right">
          * Wajib diisi
        </div>
        <div class="grid grid-cols-1 gap-4">
          <InputCurrency
            v-model="form.nominal"
            id="nominal"
            label="Nominal Saldo Baru"
            placeholder="Cth: 50000"
            required
            :error="errors?.nominal"
          />
        </div>
      </div>
    </BaseFormModal>

    <!-- Confirmation Modal -->
    <Confirmation
      :show-confirm-dialog="showConfirmDialog"
      :confirm-title="confirmTitle"
      :confirm-message="confirmMessage"
    >
      <button
        @click="cancel"
        class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
      >
        Batal
      </button>
      <button
        @click="confirm"
        class="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none shadow-[0_0_15px_rgba(5,150,105,0.5)]"
      >
        Ya, Tambahkan
      </button>
    </Confirmation>
  </div>
</template>
