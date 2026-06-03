<script setup lang="ts">
import { ref, watch } from 'vue';
import Modal from '@/components/Modal/Modal.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import SecondaryButton from '@/components/Button/SecondaryButton.vue';
import { useNotification } from '@/composables/useNotification';
import Notification from '@/components/Modal/Notification.vue';
import { daftarGrupService } from '@/service/administrator/daftarGrup';

const props = defineProps({
  show: Boolean,
  grupId: {
    type: Number,
    default: null,
  },
  grupName: {
    type: String,
    default: '',
  },
  currentPermissions: {
    type: Array as () => number[],
    default: () => [],
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

const permissions = ref<any[]>([]);
const selectedPermissions = ref<number[]>([]);
const isSubmitting = ref(false);
const isLoading = ref(false);

const fetchPermissions = async () => {
  try {
    isLoading.value = true;
    const res = await daftarGrupService.getPermissions();
    permissions.value = res.data.data;
  } catch (error) {
    console.error('Failed to fetch permissions', error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      selectedPermissions.value = [...props.currentPermissions];
      if (permissions.value.length === 0) {
        fetchPermissions();
      }
    }
  },
);

const handleSubmit = async () => {
  if (!props.grupId) return;

  isSubmitting.value = true;
  try {
    await daftarGrupService.assignPermissions(props.grupId, selectedPermissions.value);
    displayNotification('Berhasil memperbarui hak akses', 'success');
    setTimeout(() => {
      emit('success');
    }, 1500);
  } catch (error: any) {
    displayNotification(error.response?.data?.message || 'Terjadi kesalahan', 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <Modal :show="show" :title="`Kelola Hak Akses: ${grupName}`" @close="$emit('close')">
    <div v-if="isLoading" class="flex justify-center p-6">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-seulanga-navy"></div>
    </div>
    
    <div v-else class="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar p-1">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label 
          v-for="perm in permissions" 
          :key="perm.id" 
          class="flex items-center p-3 border rounded-lg cursor-pointer transition-colors"
          :class="selectedPermissions.includes(perm.id) ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'"
        >
          <input 
            type="checkbox" 
            :value="perm.id" 
            v-model="selectedPermissions" 
            class="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
          >
          <span class="ml-3 text-sm font-medium text-gray-700">{{ perm.name }}</span>
        </label>
      </div>
    </div>

    <template #footer>
      <SecondaryButton @click="$emit('close')" :disabled="isSubmitting">
        Batal
      </SecondaryButton>
      <PrimaryButton @click="handleSubmit" :disabled="isSubmitting || isLoading">
        {{ isSubmitting ? 'Menyimpan...' : 'Simpan Hak Akses' }}
      </PrimaryButton>
    </template>
  </Modal>

  <Notification
    :show-notification="showNotification"
    :notification-type="notificationType"
    :notification-message-html="notificationMessage"
    @close="hideNotification"
  />
</template>
