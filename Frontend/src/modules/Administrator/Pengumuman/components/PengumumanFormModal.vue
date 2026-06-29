<script setup lang="ts">
import InputText from '@/components/Form/InputText.vue';
import BaseFormModal from '@/components/Modal/Form.vue';
import Notification from '@/components/Modal/Notification.vue';
import { useNotification } from '@/composables/useNotification';
import { pengumumanService, type Pengumuman } from '@/service/administrator/pengumuman';
import { ref, watch } from 'vue';

const props = defineProps<{
  show: boolean;
  mode: 'add' | 'edit';
  initialData: Pengumuman | null;
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit', data: Pengumuman): void;
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

const getTodayDate = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const getNextWeekDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
};

const defaultForm = (): Pengumuman => ({
  title: '',
  content: '',
  status: true,
  start_date: getTodayDate(),
  end_date: getNextWeekDate(),
  priority: 'Normal',
});

const form = ref<Pengumuman>(defaultForm());

watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      errors.value = {};
      if (props.mode === 'edit' && props.initialData) {
        form.value = { 
          ...props.initialData,
          start_date: props.initialData.start_date.split('T')[0],
          end_date: props.initialData.end_date.split('T')[0],
        };
      } else {
        form.value = defaultForm();
      }
    }
  }
);

const validateForm = () => {
  errors.value = {};
  if (!form.value.title) errors.value.title = 'Judul harus diisi';
  if (!form.value.content) errors.value.content = 'Isi pengumuman harus diisi';
  if (!form.value.start_date) errors.value.start_date = 'Tanggal mulai harus diisi';
  if (!form.value.end_date) errors.value.end_date = 'Tanggal berakhir harus diisi';
  
  if (form.value.start_date && form.value.end_date) {
    const start = new Date(form.value.start_date);
    const end = new Date(form.value.end_date);
    if (end < start) {
      errors.value.end_date = 'Tanggal berakhir tidak boleh lebih awal dari tanggal mulai';
    }
  }

  return Object.keys(errors.value).length === 0;
};

const submitForm = async () => {
  if (!validateForm()) return;

  isLoading.value = true;
  try {
    if (props.mode === 'add') {
      await pengumumanService.create(form.value);
    } else if (props.mode === 'edit' && form.value.id) {
      await pengumumanService.update(form.value.id, form.value);
    }
    emit('submit', form.value);
    emit('close');
  } catch (error: any) {
    displayNotification(
      error.response?.data?.message || 'Terjadi kesalahan saat menyimpan pengumuman.',
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
    :label="mode === 'add' ? 'Tambah Pengumuman Baru' : 'Edit Pengumuman'"
    :submit-label="mode === 'add' ? 'Tambahkan' : 'Simpan Perubahan'"
    :width="'w-full md:w-1/2'"
    @close="emit('close')"
    @cancel="emit('close')"
    @submit="submitForm"
  >
    <div class="space-y-4">
      <InputText
        id="title"
        label="Judul Pengumuman"
        v-model="form.title"
        placeholder="Contoh: Maintenance Server"
        :error="errors.title"
        required
      />

      <div>
        <label for="content" class="block text-sm font-medium text-gray-700 mb-1">
          Isi Pengumuman <span class="text-rose-500">*</span>
        </label>
        <textarea
          id="content"
          v-model="form.content"
          rows="4"
          placeholder="Tuliskan detail pengumuman di sini..."
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
          :class="errors.content ? 'border-rose-500' : 'border-gray-300'"
        ></textarea>
        <p v-if="errors.content" class="mt-1 text-sm text-rose-500">{{ errors.content }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="start_date" class="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Mulai Tayang <span class="text-rose-500">*</span>
          </label>
          <input
            type="date"
            id="start_date"
            v-model="form.start_date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 border"
            :class="errors.start_date ? 'border-rose-500' : 'border-gray-300'"
          />
          <p v-if="errors.start_date" class="mt-1 text-sm text-rose-500">{{ errors.start_date }}</p>
        </div>

        <div>
          <label for="end_date" class="block text-sm font-medium text-gray-700 mb-1">
            Tanggal Berakhir Tayang <span class="text-rose-500">*</span>
          </label>
          <input
            type="date"
            id="end_date"
            v-model="form.end_date"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 border"
            :class="errors.end_date ? 'border-rose-500' : 'border-gray-300'"
          />
          <p v-if="errors.end_date" class="mt-1 text-sm text-rose-500">{{ errors.end_date }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label for="priority" class="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
          <select
            id="priority"
            v-model="form.priority"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm h-10 px-3 border"
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status Pengumuman</label>
          <div class="mt-2 flex items-center gap-4">
            <label class="inline-flex items-center">
              <input
                type="radio"
                class="form-radio text-blue-600 focus:ring-blue-500 border-gray-300"
                v-model="form.status"
                :value="true"
              />
              <span class="ml-2 text-sm text-gray-700 font-medium">Aktif</span>
            </label>
            <label class="inline-flex items-center">
              <input
                type="radio"
                class="form-radio text-blue-600 focus:ring-blue-500 border-gray-300"
                v-model="form.status"
                :value="false"
              />
              <span class="ml-2 text-sm text-gray-700 font-medium">Tidak Aktif</span>
            </label>
          </div>
        </div>
      </div>
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
