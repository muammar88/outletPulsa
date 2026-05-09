<template>
  <div class="animate-pulse z-800">
    <table class="w-full text-sm border">
      <thead class="bg-gray-100">
        <tr>
          <th v-for="n in columns" :key="n" class="border border-gray-200  p-2">
            <div class="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="i in rows" :key="i" class="hover:bg-gray-50 text-center">
          <td v-for="j in columns" :key="j" class="border border-gray-200 p-2">
            <div class="h-4 bg-gray-200 rounded w-full"></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script setup lang="ts">
  defineProps<{ columns: number, rows: number }>()
</script>
