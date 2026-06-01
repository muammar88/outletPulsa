
import { createRouter, createWebHistory } from 'vue-router';


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing-page',
      component: () => import('@/views/Resolver.vue'),
      meta: {
        title: 'Aplikasi Outlet Pulsa || Home',
        description:
          'Selamat datang di Aplikasi Outlet Pulsa. Halaman utama yang menyajikan informasi layanan, fitur unggulan, dan navigasi cepat menuju berbagai kebutuhan transaksi Anda.',
        layout: 'landing-page',
        authType: 'landing-page',
      },
    },
    {
      path: '/login',
      name: 'member-login-page',
      component: () => import('@/views/Resolver.vue'),
      meta: {
        title: 'Login Member Area || Aplikasi Outlet Pulsa',
        description:
          'Halaman login member. Masuk untuk mulai bertransaksi, memantau saldo, dan mengelola profil akun Anda dengan aman.',
        layout: 'member-login-page',
        authType: 'member-login-page',
      },
    },
    {
      path: '/registration',
      name: 'member-registration-page',
      component: () => import('@/views/Resolver.vue'),
      meta: {
        title: 'Registration Area || Aplikasi Outlet Pulsa',
        description:
          'Daftar sekarang dan jadilah bagian dari mitra Outlet Pulsa. Proses pendaftaran mudah untuk mulai menikmati layanan transaksi digital terbaik.',
        layout: 'member-registration-page',
        authType: 'member-registration-page',
      },
    },
    {
      path: '/member',
      name: 'member-page',
      component: () => import('@/views/Resolver.vue'),
      meta: {
        title: 'Member Area || Aplikasi Outlet Pulsa',
        description:
          'Dashboard Member. Area pribadi Anda untuk memantau aktivitas transaksi, riwayat deposit, dan ringkasan statistik penjualan harian.',
        layout: 'member-page',
        authType: 'member-page',  
      },
    },
    {
      path: '/price',
      name: 'price-page',
      component: () => import('@/views/Resolver.vue'),
      meta: {
        title: 'Daftar Harga Area || Aplikasi Outlet Pulsa',
        description:
          'Cek daftar harga pulsa, paket data, dan layanan PPOB terbaru. Informasi harga real-time yang transparan untuk mendukung bisnis Anda.',
        layout: 'price-page',
        authType: 'price-page',    
      },
    },
    {
      path: '/contact',
      name: 'contact-page',
      component: () => import('@/views/Resolver.vue'),
      meta: {
        title: 'Kontak Kami || Aplikasi Outlet Pulsa',
        description: 'Hubungi kami untuk pertanyaan, kerja sama, atau bantuan layanan Outlet Pulsa.',
        layout: 'contact-page',
        authType: 'contact-page',    
      },
    },
    {
      path: '/login-backbone',
      name: 'login-backbone',
      component: () => import('@/views/Resolver.vue'),
      meta: {
        title: 'Login Area || Aplikasi Outlet Pulsa',
        description:
          'Akses masuk khusus tim manajemen dan administrator sistem (Backbone) untuk pengelolaan infrastruktur platform.',
        layout: 'login-backbone-page',
        authType: 'login-backbone-page',    
      },
    },
    {
      path: '/backbone',
      name: 'backbone-page',
      component: () => import('@/views/Resolver.vue'),
      meta: {
        title: 'Backbone Area || Aplikasi Outlet Pulsa',
        description:
          'Dashboard Administrasi Pusat. Panel kendali untuk manajemen stok, konfigurasi sistem, monitoring transaksi global, dan laporan keuangan perusahaan.',
        layout: 'backbone-page',
        authType: 'backbone-page',  
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/errors/NotFoundView.vue'),
      meta: {
        skipDomainCheck: true,
      },
    },
  ],
});

import { isAdminLoggedIn } from '@/utils/cookies';

router.beforeEach((to, from, next) => {
  // If navigating to backbone page and not logged in
  if (to.meta.authType === 'backbone-page' && !isAdminLoggedIn()) {
    return next({ name: 'login-backbone' });
  }

  // If navigating to login page but already logged in
  // if (to.meta.authType === 'login-backbone-page' && isAdminLoggedIn()) {
  //   return next({ name: 'backbone-page' });
  // }

  next();
});

export default router;
