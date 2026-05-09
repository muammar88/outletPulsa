<script setup lang="ts">
import { FwbTooltip } from 'flowbite-vue'

defineProps<{
  text: string
}>()
</script>

<template>
  <FwbTooltip :content="text">
    <slot></slot>
  </FwbTooltip>
</template>
