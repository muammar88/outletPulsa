<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label_status" :for="id" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input -->
    <input
      :id="id"
      :type="type"
      :placeholder="placeholder"
      v-model="displayValue"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full px-4 py-2 rounded-lg border text-gray-700 shadow-sm',
        'transition-all duration-200 ease-in-out placeholder-gray-400',
        error
          ? 'border-red-500 focus:ring-2 focus:ring-red-400 focus:border-red-400'
          : 'border-gray-300 focus:ring-2 focus:ring-green-900 focus:border-green-900',
        readonly || disabled
          ? 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-80'
          : 'bg-white',
      ]"
    />

    <!-- Error message -->
    <transition name="fade">
      <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
    </transition>

    <!-- Note -->
    <transition name="fade">
      <p v-if="note" class="text-xs text-gray-600 mt-2">{{ note }}</p>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const model = defineModel<string | number>();

const props = defineProps({
  label: String,
  id: String,
  placeholder: String,
  type: { type: String, default: 'text' },
  error: String,
  note: String,
  required: { type: Boolean, default: false },
  label_status: { type: Boolean, default: true },
  readonly: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  showZero: { type: Boolean, default: false },
});

// computed untuk kontrol tampilan nol
const displayValue = computed({
  get: () => {
    if (!props.showZero && (model.value === 0 || model.value === '0')) {
      return '';
    }
    return model.value;
  },
  set: (val: string | number) => {
    model.value = val;
  },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
