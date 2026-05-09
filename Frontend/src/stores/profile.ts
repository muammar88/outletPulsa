import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref } from 'vue'


// menampul string tab yang aktif
export const CompanyCode = defineStore('companyCodeGlobal', {
  state: () => ({ sharedString: '' }),
  actions: {
    setString(item: string) {
      this.sharedString = item
    },
    clearString() {
      this.sharedString = ''
    },
  },
  getters: {
    getString: (state) => state.sharedString,
  },
})

export const Name = defineStore('nameGlobal', {
  state: () => ({ sharedString: '' }),
  actions: {
    setString(item: string) {
      this.sharedString = item
    },
    clearString() {
      this.sharedString = ''
    },
  },
  getters: {
    getString: (state) => state.sharedString,
  },
})

export const Jabatan = defineStore('jabatanGlobal', {
  state: () => ({ sharedString: '' }),
  actions: {
    setString(item: string) {
      this.sharedString = item
    },
    clearString() {
      this.sharedString = ''
    },
  },
  getters: {
    getString: (state) => state.sharedString,
  },
})

// // menampung seluruh tab secara global
// export const ProfileStore = defineStore('ProfileGlob', {
//   state: () => ({ sharedObject: {} as Record<string, any> }),
//   actions: {
//     addItem(key: string, value: any) {
//       this.sharedObject[key] = value
//     },
//     removeItem(key: string) {
//       delete this.sharedObject[key]
//     },
//     clearObject() {
//       this.sharedObject = {}
//     },
//   },
//   getters: {
//     getObject: (state) => state.sharedObject,
//   },
// })
