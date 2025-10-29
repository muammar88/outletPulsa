// import Register from '@/modules/Register/Register.vue';
import AdministratorAreaView from '@/views/AdministratorView.vue';
import homeView from '@/views/HomeView.vue';
import LoginAdminView from '@/views/LoginAdminView.vue';
// import MemberAreaView from '@/views/MemberAreaView.vue';
// import SurveyLapanganView from '@/views/SurveyLapanganView.vue';
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: homeView,
      meta: {
        title: 'Aplikasi Outlet Pulsa || Home',
        description:
          'Halaman utama menampilkan ringkasan dashboard outlet: saldo, transaksi terakhir, statistik penjualan, dan akses cepat ke fitur produk dan laporan.',
      },
    },
    {
      path: '/login-admin',
      name: 'login-admin',
      component: LoginAdminView,
      meta: {
        title: 'Login Area || Aplikasi Outlet Pulsa',
        description:
          'Halaman masuk untuk administrator dan operator outlet. Gunakan kredensial yang valid untuk mengakses dashboard dan fitur manajemen.',
      },
    },
    {
      path: '/administrator',
      name: 'administrator',
      component: AdministratorAreaView,
      meta: {
        title: 'Administrator Area || Aplikasi Outlet Pulsa',
        description:
          'Area khusus administrator untuk manajemen sistem: konfigurasi outlet, pengaturan produk, manajemen pengguna, dan akses laporan lengkap.',
      },
    },
  ],
});

export default router;
