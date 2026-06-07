import { defineAsyncComponent } from 'vue';

export const tabComponents: Record<string, any> = {
  ringkasan: defineAsyncComponent(() => import('@/modules/Administrator/Ringkasan/Ringkasan.vue')),
  daftar_member: defineAsyncComponent(() => import('@/modules/Administrator/DaftarMember/DaftarMember.vue')),
  daftar_agen: defineAsyncComponent(() => import('@/modules/Administrator/DaftarAgen/DaftarAgen.vue')),
  transaksi_pulsa: defineAsyncComponent(() => import('@/modules/Administrator/TransaksiPulsa/TransaksiPulsa.vue')),
  semua_produk: defineAsyncComponent(() => import('@/modules/Administrator/SemuaProduk/SemuaProduk.vue')),
  daftar_server: defineAsyncComponent(() => import('@/modules/Administrator/SemuaServer/SemuaServer.vue')),
  kategori: defineAsyncComponent(() => import('@/modules/Administrator/Kategori/Kategori.vue')),
  operator: defineAsyncComponent(() => import('@/modules/Administrator/Operator/Operator.vue')),
  pengaturan: defineAsyncComponent(() => import('@/modules/Administrator/PengaturanUmum/PengaturanUmum.vue')),
  deposit: defineAsyncComponent(() => import('@/modules/Administrator/Deposit/Deposit.vue')),
  log: defineAsyncComponent(() => import('@/modules/Administrator/Log/Log.vue')),
  daftar_grup: defineAsyncComponent(() => import('@/modules/Administrator/DaftarGrup/DaftarGrup.vue')),
  daftar_pengguna: defineAsyncComponent(() => import('@/modules/Administrator/DaftarPengguna/DaftarPengguna.vue')),
  daftar_produk_tripay: defineAsyncComponent(() => import('@/modules/Administrator/DaftarProdukTripay/DaftarProdukTripay.vue')),
  daftar_kategori_tripay: defineAsyncComponent(() => import('@/modules/Administrator/KategoriTripay/KategoriTripay.vue')),
  daftar_operator_tripay: defineAsyncComponent(() => import('@/modules/Administrator/OperatorTripay/OperatorTripay.vue')),
  daftar_type_iak: defineAsyncComponent(() => import('@/modules/Administrator/DaftarTypeIAK/DaftarTypeIAK.vue')),
  daftar_operator_iak: defineAsyncComponent(() => import('@/modules/Administrator/DaftarOperatorIAK/DaftarOperatorIAK.vue')),
  daftar_produk_iak: defineAsyncComponent(() => import('@/modules/Administrator/DaftarProdukIAK/DaftarProdukIAK.vue')),
  notFound: defineAsyncComponent(() => import('@/views/errors/NotFoundView.vue')),
};
