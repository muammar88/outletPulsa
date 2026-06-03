<script setup lang="ts">
import { ref, watch } from 'vue';
import InputText from '@/components/Form/InputText.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import { memberService } from '@/service/administrator/member';
import { useNotification } from '@/composables/useNotification';

const props = defineProps<{
  show: boolean;
  memberId: number | null;
  memberKode: string;
  currentKodeAgen: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'success'): void;
}>();

const { displayNotification } = useNotification();
const kodeAgen = ref('');
const error = ref('');

watch(
  () => props.show,
  (isShow) => {
    if (isShow) {
      kodeAgen.value = props.currentKodeAgen || '';
      error.value = '';
    }
  }
);

const handleSubmit = async () => {
  if (!kodeAgen.value.trim()) {
    error.value = 'Kode agen tidak boleh kosong';
    return;
  }
  if (kodeAgen.value === props.memberKode) {
    error.value = 'Kode agen tidak boleh kode member sendiri';
    return;
  }
  if (!props.memberId) return;

  try {
    await memberService.update(props.memberId, { kode_agen: kodeAgen.value });
    displayNotification('Kode Agen berhasil disimpan', 'success');
    emit('success');
  } catch (err: any) {
    const errMessage = err.response?.data?.message || 'Gagal menyimpan kode agen';
    displayNotification(Array.isArray(errMessage) ? errMessage[0] : errMessage, 'error');
  }
};
</script>

<template>
  <BaseFormModal
    :form-status="show"
    label="Set Kode Agen"
    submit-label="Simpan"
    width="w-full max-w-md"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="handleSubmit"
  >
    <div class="mb-4">
      <InputText
        v-model="kodeAgen"
        id="kode_agen_input"
        label="Kode Agen"
        placeholder="Masukkan kode agen (cth: MBR0001)"
        :error="error"
        required
      />
    </div>
  </BaseFormModal>
</template>
