// src/plugins/rupiahPlugin.js
import { formatToRupiah } from '../libs/rupiahFormatter'

export default {
  install(app) {
    app.config.globalProperties.$formatToRupiah = formatToRupiah
  }
}
