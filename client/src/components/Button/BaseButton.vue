<script setup lang="ts">
import { computed } from 'vue';

const emit = defineEmits(['click']);

// Props yang lebih fungsional dan deskriptif
const props = defineProps({
  variant: {
    type: String,
    default: 'primary', // primary, secondary, warning, danger
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg
  },
  fullWidth: {
    type: Boolean,
    default: false, // lebar penuh
  },
  disabled: {
    type: Boolean,
    default: false, // menonaktifkan tombol
  },
  loading: {
    type: Boolean,
    default: false, // menampilkan spinner
  },
  type: {
    type: String,
    default: 'button', // button, submit, reset
  },
});

// const windowWidth = ref(window.innerWidth);

// const dynamicLabel = (val) => {
//   if (windowWidth.value < 640) {
//     // < sm → mobile
//     return '';
//   } else if (windowWidth.value < 1269) {
//     // sm
//     return val.slice(0, 8) + '...';
//   } else if (windowWidth.value < 1467) {
//     // md
//     return val.slice(0, 8) + '...';
//   } else if (windowWidth.value < 1611) {
//     // lg
//     return val.slice(0, 13) + '...';
//   } else if (windowWidth.value < 1707) {
//     // xl
//     return val.slice(0, 16) + '...';
//   } else {
//     // 2xl atau lebih
//     return val;
//   }
// };

// Mengelola class secara dinamis dengan computed property
const buttonClasses = computed(() => {
  const baseClasses = [
    'inline-flex',
    'items-center',
    'justify-center',
    'font-semibold',
    'rounded-lg',
    'transition-all',
    'duration-200',
    'ease-in-out',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
  ];

  const variantClasses = {
    primary: 'bg-green-900 text-white hover:bg-[#2b6443] focus:ring-green-900',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  };

  const stateClasses = {
    disabled: 'disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed',
    loading: 'cursor-wait',
  };

  return [
    ...baseClasses,
    variantClasses[props.variant] || variantClasses.primary,
    sizeClasses[props.size] || sizeClasses.md,
    props.fullWidth ? 'w-full' : 'w-auto',
    stateClasses.disabled,
    props.loading ? stateClasses.loading : '',
  ].join(' ');
});

function handleClick(event) {
  if (props.disabled || props.loading) {
    event.preventDefault();
    return;
  }
  emit('click', event);
}

// onMounted(async () => {
//   window.addEventListener('resize', () => {
//     windowWidth.value = window.innerWidth;
//   });
// });

// watch(
//   () => props.variant,
//   async () => {
//     await nextTick();
//     initTooltips();
//   },
//   { deep: true },
// );
</script>

<template>
  <button :class="buttonClasses" :type="type" :disabled="disabled || loading" @click="handleClick">
    <slot name="icon-left">
      <svg
        v-if="loading"
        class="animate-spin h-5 w-5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        ></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </slot>
    <span v-if="!loading">
      <slot></slot>
    </span>
    <slot name="icon-right"></slot>
  </button>
</template>
