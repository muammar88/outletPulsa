<template>
  <div class="flex flex-col">
    <!-- Label -->
    <label
      v-if="label_status"
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
    </label>

    <!-- Checkbox -->
    <div class="flex items-center">
      <input
        type="checkbox"
        :id="id"
        v-model="localValue"
        :disabled="disabled"
        class="h-4 w-4 text-green-800 border-gray-300 rounded focus:ring-green-900"
      />
      <label
        :for="id"
        class="ml-2 text-sm text-gray-700 select-none cursor-pointer"
      >
        {{ text }}
      </label>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-red-500 text-sm mt-1">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  label_status: { type: Boolean, default: true },
  modelValue: { type: Boolean, default: false },
  text: { type: String, default: '' }, // teks di sebelah checkbox
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const localValue = ref(props.modelValue);

watch(
  () => props.modelValue,
  (val) => {
    localValue.value = val;
  }
);

watch(localValue, (val) => {
  emit('update:modelValue', val);
});
</script>
