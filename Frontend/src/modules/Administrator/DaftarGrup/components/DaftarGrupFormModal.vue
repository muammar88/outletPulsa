<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from '@/components/Modal/Modal.vue';
import InputText from '@/components/Form/InputText.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import SecondaryButton from '@/components/Button/SecondaryButton.vue';
import { useNotification } from '@/composables/useNotification';
import Notification from '@/components/Modal/Notification.vue';
import { daftarGrupService } from '@/service/administrator/daftarGrup';

const props = defineProps({
  show: Boolean,
  mode: {
    type: String as () => 'add' | 'edit',
    default: 'add',
  },
  initialData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'success']);

const {
  showNotification,
  notificationType,
  notificationMessage,
  displayNotification,
  hideNotification,
} = useNotification();

const formData = ref({
  name: '',
  description: '',
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.initialData) {
        formData.value = {
          name: props.initialData.name,
          description: props.initialData.description || '',
        };
      } else {
        formData.value = {
          name: '',
          description: '',
        };
      }
      errors.value = {};
    }
  },
);

const validateForm = () => {
  errors.value = {};
  if (!formData.value.name) errors.value.name = 'Nama Grup wajib diisi';
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    if (props.mode === 'add') {
      await daftarGrupService.create(formData.value);
      displayNotification('Berhasil menambahkan grup', 'success');
    } else {
      await daftarGrupService.update(props.initialData.id, formData.value);
      displayNotification('Berhasil memperbarui grup', 'success');
    }
    setTimeout(() => {
      emit('close');
    }, 1500);
  } catch (error: any) {
    displayNotification(error.response?.data?.message || 'Terjadi kesalahan', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Modal :show="show" :title="mode === 'add' ? 'Tambah Grup Baru' : 'Edit Grup'" @close="$emit('close')">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <InputText
          id="name"
          label="Nama Grup"
          v-model="formData.name"
          :errorMessage="errors.name"
          placeholder="Masukkan nama grup"
          required
        />
        
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            id="description"
            v-model="formData.description"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-seulanga-navy focus:border-seulanga-navy"
            placeholder="Masukkan deskripsi grup (opsional)"
          ></textarea>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-2 pt-4 border-t border-gray-200">
        <SecondaryButton @click="$emit('close')" type="button" :disabled="isSubmitting">
          Batal
        </SecondaryButton>
        <PrimaryButton type="submit" :disabled="isSubmitting">
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}
        </PrimaryButton>
      </div>
    </form>
  </Modal>

  <Notification
    :show-notification="showNotification"
    :notification-type="notificationType"
    :notification-message-html="notificationMessage"
    @close="hideNotification"
  />
</template>
