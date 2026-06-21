<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import LoadingSpinner from '@/components/Loading/LoadingSpinner.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { bankService, type Bank } from '@/service/administrator/bank';
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: Bank | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: Bank): void;
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

const defaultForm = (): Bank => ({
  kode: '',
  nama: '',
  image: '',
});

const form = ref<Bank>(defaultForm());

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      errors.value = {};
      if (props.mode === 'edit' && props.initialData) {
        form.value = { ...props.initialData };
      } else {
        form.value = defaultForm();
      }
    }
  }
);

const validateForm = () => {
  errors.value = {};
  if (!form.value.kode) {
    errors.value.kode = 'Kode bank harus diisi';
  }
  if (!form.value.nama) {
    errors.value.nama = 'Nama bank harus diisi';
  }
  return Object.keys(errors.value).length === 0;
};

const submitForm = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    if (props.mode === 'add') {
      await bankService.create(form.value);
    } else if (props.mode === 'edit' && form.value.id) {
      await bankService.update(form.value.id, form.value);
    }
    emit('submit', form.value);
    emit('close');
  } catch (error: any) {
    displayNotification(
      'error',
      error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data bank.'
    );
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <BaseFormModal
    :show="show"
    :title="mode === 'add' ? 'Tambah Bank Baru' : 'Edit Bank'"
    :loading="loading || isLoading"
    @close="emit('close')"
    @submit="submitForm"
  >
    <div class="space-y-4">
      <InputText
        id="kode"
        label="Kode Bank"
        v-model="form.kode"
        placeholder="Contoh: BCA"
        :error="errors.kode"
        required
      />

      <InputText
        id="nama"
        label="Nama Bank"
        v-model="form.nama"
        placeholder="Contoh: Bank Central Asia"
        :error="errors.nama"
        required
      />

      <InputText
        id="image"
        label="URL Logo (Opsional)"
        v-model="form.image"
        placeholder="https://example.com/logo-bca.png"
        :error="errors.image"
      />
    </div>

    <!-- Notification Overlay for Errors -->
    <Notification
      :show="showNotification"
      :type="notificationType"
      :message="notificationMessage"
      @close="hideNotification"
    />
  </BaseFormModal>
</template>
