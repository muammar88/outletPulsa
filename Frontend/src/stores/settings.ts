import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// menampung seluruh tab secara global
export const SettingStore = defineStore('SettingGlob', {
  state: () => ({ sharedObject: {} as Record<string, any> }),
  actions: {
    addItem(key: string, value: any) {
      this.sharedObject[key] = value
    },
    removeItem(key: string) {
      delete this.sharedObject[key]
    },
    clearObject() {
      this.sharedObject = {}
    },
  },
  getters: {
    getObject: (state) => state.sharedObject,
  },
})
