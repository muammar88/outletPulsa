<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

interface Option {
  value: string | number;
  label: string;
}

const props = defineProps<{
  modelValue: string | number | null;
  options: Option[];
  placeholder?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number | null): void;
  (e: "change", value: string | number | null): void;
}>();

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  const value = target.value === "" ? null : target.value;
  emit("update:modelValue", value);
  emit("change", value);
};
</script>

<template>
  <select
    :value="modelValue ?? ''"
    @change="onChange"
    class="block w-full sm:w-48 border-gray-300 shadow-sm px-3 py-2 text-gray-700
           rounded-md focus:ring-2 focus:ring-green-900 focus:border-green-900 transition"
  >
    <option value="">{{ placeholder || "Pilih opsi" }}</option>
    <option
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
    >
      {{ opt.label }}
    </option>
  </select>
</template>
