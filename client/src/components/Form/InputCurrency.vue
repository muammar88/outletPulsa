<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label_status"
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input -->
    <input
      :id="id"
      type="text"
      :value="formattedValue"
      @input="onInput"
      @keydown="onKeydown"
      :placeholder="placeholder"
      :disabled="disabled"
      class="w-full px-4 py-2 rounded-lg border text-gray-700 bg-white
             focus:outline-none transition-all duration-200 ease-in-out
             focus:ring-2 focus:ring-green-900 focus:border-green-900
             disabled:bg-gray-100 disabled:cursor-not-allowed
             placeholder-gray-400 shadow-sm"
      :class="error
        ? 'border-red-500 focus:ring-red-400 focus:border-red-400'
        : 'border-gray-300'"
    />

    <!-- Error -->
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
import { computed, ref, watch } from 'vue'

const props = defineProps({
  id: String,
  label: String,
  modelValue: { type: Number, required: true },
  note: String,
  label_status: { type: Boolean, default: true },
  placeholder: String,
  error: String,
  max: { type: Number, default: 100_000_000 },
  required: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const prevValue = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    prevValue.value = val
  }
)

const formattedValue = computed(() => {
  if (!props.modelValue) return '' // kosong kalau 0/null
  return formatRupiah(props.modelValue)
})

const onInput = (e: Event) => {
  const inputEl = e.target as HTMLInputElement
  const raw = inputEl.value
  const cleaned = raw.replace(/[^\d]/g, '')
  let number = parseInt(cleaned, 10)

  if (isNaN(number)) number = 0

  if (number > props.max) {
    number = prevValue.value // rollback ke value sebelumnya
    inputEl.value = formatRupiah(number) // update tampilan
  } else {
    prevValue.value = number
  }

  emit('update:modelValue', number)
}

const onKeydown = (e: KeyboardEvent) => {
  const allowed = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
  ]

  if (/^[0-9]$/.test(e.key)) return // angka 0–9 boleh
  if (allowed.includes(e.key)) return // tombol kontrol boleh

  e.preventDefault() // selain itu blok
}

const formatRupiah = (val: number): string => {
  return 'Rp ' + val.toLocaleString('id-ID')
}
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
