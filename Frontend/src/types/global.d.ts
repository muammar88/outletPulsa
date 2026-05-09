import { formatToRupiah } from '@/libs/rupiahFormatter'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $formatToRupiah: typeof formatToRupiah
  }
}
