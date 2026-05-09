<template>
  <div class="relative" ref="dropdownRef">
    <label v-if="label_status" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Dropdown input -->
    <div
      @click="toggleDropdown"
      class="w-full border rounded-lg px-4 py-2 bg-white flex justify-between items-center cursor-pointer min-h-[42px]"
      :class="error ? 'border-red-500' : 'border-gray-300'"
      style="overflow-x: hidden"
    >
      <!-- ini biar teks wrap ke bawah -->
      <span class="text-gray-700 break-words whitespace-normal">
        {{ selectedOption?.name || placeholder }}
      </span>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="w-5 h-5 text-gray-500 ml-2 flex-shrink-0"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 9l6 6 6-6" />
      </svg>
    </div>

    <!-- Dropdown list -->
    <div
      v-if="isOpen"
      class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-48 overflow-y-auto overflow-x-hidden"
    >
      <div
        v-for="option in options"
        :key="option.id"
        @click="selectOption(option)"
        class="px-4 py-2 text-gray-700 hover:bg-green-50 cursor-pointer whitespace-normal break-words"
      >
        {{ option.name }}
      </div>
    </div>

    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
    <p v-if="note" class="text-xs text-gray-600 mt-2">{{ note }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  modelValue: String,
  label: String,
  options: { type: Array, required: true },
  placeholder: { type: String, default: 'Pilih salah satu' },
  error: String,
  note: String,
  label_status: { type: Boolean, default: true },
  required: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);
const dropdownRef = ref(null);

const selectedOption = computed(() => props.options.find((opt) => opt.id === props.modelValue));

const toggleDropdown = () => (isOpen.value = !isOpen.value);
const selectOption = (option) => {
  emit('update:modelValue', option.id);
  isOpen.value = false;
};

// Tutup dropdown kalau klik di luar
const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};
onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<style scoped>
/* ilangin semua kemungkinan scroll aneh */
div::-webkit-scrollbar {
  width: 6px;
  height: 0px; /* no horizontal scrollbar */
}
div::-webkit-scrollbar-thumb {
  background-color: #d1d5db; /* gray-300 */
  border-radius: 10px;
}
</style>
