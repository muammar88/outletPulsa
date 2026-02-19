// import Register from '@/modules/Register/Register.vue';
import AdministratorAreaView from '@/views/AdministratorView.vue';
import homeView from '@/views/HomeView.vue';
import LoginAdminView from '@/views/LoginAdminView.vue';
import LoginMemberView from '@/views/LoginMemberView.vue';
import PriceView from '@/views/PriceView.vue';
import MemberView from '@/views/MemberView.vue';
import RegistrationView from '@/views/RegistrationView.vue';
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
      path: '/login',
      name: 'login',
      component: LoginMemberView,
      meta: {
        title: 'Login Member Area || Aplikasi Outlet Pulsa',
        description:
          'Halaman masuk untuk administrator dan operator outlet. Gunakan kredensial yang valid untuk mengakses dashboard dan fitur manajemen.',
      },
    },
    {
      path: '/register',
      name: 'register',
      component: RegistrationView,
      meta: {
        title: 'Registration Area || Aplikasi Outlet Pulsa',
        description:
          'Halaman masuk untuk administrator dan operator outlet. Gunakan kredensial yang valid untuk mengakses dashboard dan fitur manajemen.',
      },
    },
    {
      path: '/member',
      name: 'member',
      component: MemberView,
      meta: {
        title: 'Member Area || Aplikasi Outlet Pulsa',
        description:
          'Halaman masuk untuk administrator dan operator outlet. Gunakan kredensial yang valid untuk mengakses dashboard dan fitur manajemen.',
      },
    },
    {
      path: '/price',
      name: 'pricve',
      component: PriceView,
      meta: {
        title: 'Daftar Harga Area || Aplikasi Outlet Pulsa',
        description:
          'Halaman masuk untuk administrator dan operator outlet. Gunakan kredensial yang valid untuk mengakses dashboard dan fitur manajemen.',
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
