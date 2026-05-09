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

    <!-- Checklist -->
    <div class="grid grid-cols-1 gap-2">
      <label
        v-for="(item, index) in checklistData"
        :key="index"
        class="flex items-center space-x-2 cursor-pointer"
      >
        <input
          type="checkbox"
          :id="`${id}-check-${index}`"
          :value="item.value"
          v-model="internalValue"
          class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <span class="text-sm text-gray-700">{{ item.name }}</span>
      </label>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="text-sm text-red-500 mt-1">
      {{ error }}
    </p>
  </div>
</template>

<script>
export default {
  name: "InputChecklist",
  props: {
    id: {
      type: String,
      default: "checklist",
    },
    label: {
      type: String,
      default: "",
    },
    label_status: {
      type: Boolean,
      default: false,
    },
    checklistData: {
      type: Array,
      required: true,
    },
    modelValue: {
      type: Array,
      default: () => [],
    },
    error: {
      type: String,
      default: "",
    },
  },
  emits: ["update:modelValue"],
  computed: {
    internalValue: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit("update:modelValue", val)
      },
    },
  },
}
</script>
