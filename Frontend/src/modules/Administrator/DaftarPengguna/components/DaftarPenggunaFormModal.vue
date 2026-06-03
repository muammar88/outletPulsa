<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import Modal from '@/components/Modal/Modal.vue';
import InputText from '@/components/Form/InputText.vue';
import InputPassword from '@/components/Form/InputPassword.vue';
import PrimaryButton from '@/components/Button/PrimaryButton.vue';
import SecondaryButton from '@/components/Button/SecondaryButton.vue';
import { useNotification } from '@/composables/useNotification';
import Notification from '@/components/Modal/Notification.vue';
import { daftarPenggunaService } from '@/service/administrator/daftarPengguna';
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
  kode: '',
  password: '',
  confirmPassword: '',
  groupId: null as number | null,
});

const groups = ref<any[]>([]);

const selectableGroups = computed(() => {
  return groups.value.filter(g => g.name !== 'Administrator');
});

const errors = ref<Record<string, string>>({});
const isSubmitting = ref(false);

const fetchGroups = async () => {
  try {
    const res = await daftarGrupService.getAll(1, 100);
    groups.value = res.data.data.list;
  } catch (error) {
    console.error('Failed to fetch groups', error);
  }
};

onMounted(() => {
  fetchGroups();
});

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      if (props.mode === 'edit' && props.initialData) {
        formData.value = {
          name: props.initialData.name,
          kode: props.initialData.kode,
          password: '',
          confirmPassword: '',
          groupId: props.initialData.groupId || null,
        };
      } else {
        formData.value = {
          name: '',
          kode: '',
          password: '',
          confirmPassword: '',
          groupId: null,
        };
      }
      errors.value = {};
    }
  },
);

const validateForm = () => {
  errors.value = {};
  if (!formData.value.name) errors.value.name = 'Nama lengkap wajib diisi';
  if (!formData.value.kode) errors.value.kode = 'Username/Kode wajib diisi';
  
  if (props.mode === 'add') {
    if (!formData.value.password) errors.value.password = 'Password wajib diisi untuk pengguna baru';
  }
  
  if (formData.value.password && formData.value.password !== formData.value.confirmPassword) {
    errors.value.confirmPassword = 'Konfirmasi password tidak cocok';
  }
  
  return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  try {
    const payload: any = {
      name: formData.value.name,
      kode: formData.value.kode,
      groupId: formData.value.groupId,
    };

    if (formData.value.password) {
      payload.password = formData.value.password;
    }

    if (props.mode === 'add') {
      await daftarPenggunaService.create(payload);
      displayNotification('Berhasil menambahkan pengguna', 'success');
    } else {
      await daftarPenggunaService.update(props.initialData.id, payload);
      displayNotification('Berhasil memperbarui pengguna', 'success');
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
  <Modal :show="show" :title="mode === 'add' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'" @close="$emit('close')">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <InputText
          id="name"
          label="Nama Lengkap"
          v-model="formData.name"
          :errorMessage="errors.name"
          placeholder="Masukkan nama lengkap"
          required
        />
        
        <InputText
          id="kode"
          label="Username / Kode"
          v-model="formData.kode"
          :errorMessage="errors.kode"
          placeholder="Masukkan username/kode login"
          required
        />

        <div>
          <label for="group" class="block text-sm font-medium text-gray-700 mb-1">Hak Akses (Grup)</label>
          <select
            id="group"
            v-model="formData.groupId"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-seulanga-navy focus:border-seulanga-navy"
          >
            <option :value="null">-- Pilih Grup --</option>
            <option v-for="grup in selectableGroups" :key="grup.id" :value="grup.id">{{ grup.name }}</option>
          </select>
        </div>

        <hr class="my-4 border-gray-200" />
        <p v-if="mode === 'edit'" class="text-xs text-gray-500 mb-2 italic">* Kosongkan password jika tidak ingin mengubahnya.</p>
        
        <InputPassword
          id="password"
          label="Password"
          v-model="formData.password"
          :error="errors.password"
          placeholder="Masukkan password"
          :required="mode === 'add'"
        />

        <InputPassword
          id="confirmPassword"
          label="Konfirmasi Password"
          v-model="formData.confirmPassword"
          :error="errors.confirmPassword"
          placeholder="Ulangi password"
          :required="mode === 'add' || !!formData.password"
        />
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
