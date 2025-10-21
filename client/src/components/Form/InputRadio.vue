<template>
  <div class="w-full">
    <!-- Label -->
    <label v-if="label_status" class="block text-sm font-medium text-gray-700 mb-3">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Radio Options -->
    <div class="space-y-2">
      <label
        v-for="(option, index) in options"
        :key="index"
        class="flex items-center gap-2 cursor-pointer"
      >
        <input
          :id="`${id}-radio-${index}`"
          type="radio"
          :name="id"
          :value="option.value"
          v-model="internalValue"
          :disabled="disabled"
          class="w-4 h-4 text-green-900 border-gray-300 focus:ring-2 focus:ring-green-900 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span class="text-sm" :class="disabled ? 'text-gray-400' : 'text-gray-700'">
          {{ option.label }}
        </span>
      </label>
    </div>

    <!-- Error Message -->
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

const props = defineProps({
  id: {
    type: String,
    default: 'radio',
  },
  label: {
    type: String,
    default: '',
  },
  label_status: {
    type: Boolean,
    default: true,
  },
  options: {
    type: Array as () => Array<{ value: string | number; label: string }>,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  note: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);

const internalValue = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emit('update:modelValue', val);
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
