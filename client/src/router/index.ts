// import Register from '@/modules/Register/Register.vue';
// import AdministratorAreaView from '@/views/AdministratorView.vue';
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
          'Aplikasi Mustahik dan Muzaki Kabupaten Aceh Tengah merupakan platform digital yang dirancang untuk mempermudah pengelolaan data penerima manfaat (mustahik) dan pemberi zakat (muzaki). Melalui aplikasi ini, proses pendataan, penyaluran, dan pelaporan zakat, infak, serta sedekah dapat dilakukan dengan lebih transparan, cepat, dan akurat. Aplikasi ini juga mendukung visi Baitul Mal Kabupaten Aceh Tengah dalam mewujudkan tata kelola zakat yang religius, mandiri, dan sejahtera bagi masyarakat.',
      },
    },
    {
      path: '/login-admin',
      name: 'login-admin',
      component: LoginAdminView,
      meta: {
        title: 'Login Area || Aplikasi Outlet Pulsa',
        description:
          'Aplikasi Mustahik dan Muzaki Kabupaten Aceh Tengah untuk registrasi, pendataan, dan layanan zakat secara mudah, cepat, dan transparan.',
      },
    },
  ],
});

export default router;
