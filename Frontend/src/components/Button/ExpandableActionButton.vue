<script setup lang="ts">
import { IconLoader2 } from '@/components/Icons';
const props = defineProps({
  label: { type: String, required: true },
  title: { type: String, default: '' },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  variant: {
    type: String,
    default: 'emerald', // emerald, rose, etc.
  }
});

const emit = defineEmits(['click']);

const bgClass = {
  emerald: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
  rose: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
  amber: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
  blue: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
  slate: 'bg-slate-600 hover:bg-slate-700 focus:ring-slate-500',
  primary: 'bg-[#0f2155] hover:bg-[#0c1a44] focus:ring-[#0f2155]',
}[props.variant] || 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500';
</script>

<template>
  <button
    :title="title || label"
    :aria-label="title || label"
    :disabled="disabled || loading"
    @click="emit('click', $event)"
    :class="[
      'group relative flex items-center justify-center h-10 px-3 text-sm font-semibold text-white border border-transparent rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ease-out overflow-hidden',
      bgClass
    ]"
  >
    <div class="flex items-center justify-center z-10">
      <IconLoader2 v-if="loading" class="animate-spin h-5 w-5 text-white flex-shrink-0" />
      <slot name="icon" v-else></slot>
    </div>
    
    <span class="overflow-hidden whitespace-nowrap max-w-0 opacity-0 transition-all duration-300 ease-out group-hover:max-w-[250px] group-hover:opacity-100 group-hover:ml-2 group-hover:pr-1 translate-x-[-10px] group-hover:translate-x-0">
      {{ loading ? 'Memproses...' : label }}
    </span>
  </button>
</template>
