<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 overflow-hidden">
    <!-- HEADER / NAVBAR -->
    <header
      class="fixed top-0 left-0 w-full z-50 backdrop-blur bg-white/70 border-b border-gray-100"
    >
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-2 font-extrabold text-gray-800">
          <div
            class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shadow"
          >
            ⚡
          </div>
          <span>Outlet Pulsa</span>
        </div>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a href="#" class="hover:text-blue-500 transition">Fitur</a>
          <a href="#testimoni" class="hover:text-blue-500 transition">Testimoni</a>
          <a href="#" class="hover:text-blue-500 transition">Harga</a>
          <a href="#" class="hover:text-blue-500 transition">Kontak Kami</a>
          <a href="#" class="hover:text-blue-500 transition">Tentang Kami</a>
        </nav>

        <!-- Login & Daftar (Desktop) -->
        <div class="hidden md:flex items-center gap-3">
          <a
            href="/login"
            class="text-sm font-semibold text-gray-700 hover:text-blue-500 transition"
            >Login</a
          >
          <a
            href="/register"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white text-sm font-semibold shadow hover:opacity-90 transition"
          >
            Daftar
          </a>
        </div>

        <!-- Mobile Hamburger -->
        <div class="md:hidden flex items-center">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-md hover:bg-gray-100"
          >
            <svg
              class="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile Menu -->
      <transition name="slide-down">
        <div
          v-if="mobileMenuOpen"
          class="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur shadow-lg flex flex-col space-y-1 py-4 px-6 z-40"
        >
          <a
            href="#"
            class="block py-3 px-2 rounded-md text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition"
            >Fitur</a
          >
          <a
            href="#testimoni"
            class="block py-3 px-2 rounded-md text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition"
            >Testimoni</a
          >
          <a
            href="#"
            class="block py-3 px-2 rounded-md text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition"
            >Harga</a
          >
          <a
            href="#"
            class="block py-3 px-2 rounded-md text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition"
            >Kontak Kami</a
          >
          <a
            href="#"
            class="block py-3 px-2 rounded-md text-gray-700 font-medium hover:bg-blue-50 hover:text-blue-600 transition"
            >Tentang Kami</a
          >

          <div class="border-t border-gray-200 mt-2 pt-2 flex flex-col space-y-2">
            <a
              href="/login"
              class="block py-2 text-center rounded-md font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition"
              >Login</a
            >
            <a
              href="/register"
              class="block py-2 text-center rounded-xl bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold shadow hover:opacity-90 transition"
              >Daftar</a
            >
          </div>
        </div>
      </transition>
    </header>

    <!-- spacer for fixed header -->
    <div class="h-20"></div>
    <!-- HERO -->
    <section class="relative px-6 pt-24 pb-20 text-center">
      <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-800 leading-tight">
          Aplikasi Pulsa Modern untuk
          <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Bisnis Digital Kamu
          </span>
        </h1>
        <p class="text-gray-600 text-lg">
          Jual pulsa, paket data, dan PPOB dengan sistem cepat, stabil, dan keuntungan maksimal.
        </p>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="/register"
            class="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg hover:opacity-90 transition"
          >
            Daftar Sekarang
          </a>
          <a
            href="/login"
            class="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Login Member
          </a>
        </div>
      </div>

      <!-- decorative blur -->
      <div
        class="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-300 opacity-30 rounded-full blur-3xl"
      ></div>
    </section>

    <!-- FEATURES -->
    <section class="px-6 py-16 bg-white/70 backdrop-blur">
      <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div
          v-for="item in features"
          :key="item.title"
          class="p-6 rounded-2xl bg-white shadow hover:shadow-lg transition"
        >
          <div class="text-3xl mb-3">{{ item.icon }}</div>
          <h3 class="font-bold text-lg text-gray-800">{{ item.title }}</h3>
          <p class="text-gray-600 text-sm mt-2">{{ item.desc }}</p>
        </div>
      </div>
    </section>

    <!-- STATS -->
    <section class="px-6 py-16">
      <div class="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div v-for="s in stats" :key="s.label" class="space-y-2">
          <p class="text-3xl font-extrabold text-blue-600">{{ s.value }}</p>
          <p class="text-sm text-gray-500">{{ s.label }}</p>
        </div>
      </div>
    </section>

    <!-- TESTIMONIAL SLIDER -->
    <section id="testimoni" class="px-6 py-20 bg-white relative overflow-hidden">
      <!-- background glow -->
      <div
        class="absolute -top-24 -left-24 w-72 h-72 bg-blue-200 opacity-40 rounded-full blur-3xl"
      ></div>
      <div
        class="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-200 opacity-40 rounded-full blur-3xl"
      ></div>

      <div class="max-w-6xl mx-auto text-center space-y-12 relative z-10">
        <div class="space-y-3">
          <h2 class="text-3xl md:text-4xl font-extrabold text-gray-800">Dipercaya Banyak Mitra</h2>
          <p class="text-gray-500 max-w-2xl mx-auto">
            Ribuan agen dan konter pulsa telah menggunakan sistem kami untuk meningkatkan penjualan
            dan keuntungan setiap hari.
          </p>
        </div>

        <!-- slider wrapper -->
        <div class="relative overflow-hidden">
          <div
            class="flex transition-transform duration-700 ease-in-out"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
          >
            <div
              v-for="(group, gIndex) in testimonialGroups"
              :key="gIndex"
              class="w-full flex-shrink-0 px-4"
            >
              <div class="grid md:grid-cols-3 gap-8">
                <div
                  v-for="t in group"
                  :key="t.name"
                  class="max-w-md mx-auto p-7 rounded-3xl bg-white shadow-lg hover:shadow-2xl transition border border-gray-100 text-left"
                >
                  <div class="flex items-center gap-4 mb-4">
                    <div
                      class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold"
                    >
                      {{ t.name.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-semibold text-gray-800 leading-none">{{ t.name }}</p>
                      <p class="text-xs text-gray-400">Mitra Outlet Pulsa</p>
                    </div>
                  </div>

                  <p class="text-gray-600 text-sm leading-relaxed">"{{ t.text }}"</p>

                  <!-- rating -->
                  <div class="flex gap-1 mt-4 text-yellow-400">
                    <span v-for="i in 5" :key="i">★</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- dots indicator -->
          <div class="flex justify-center gap-2 mt-8">
            <button
              v-for="(_, i) in testimonialGroups"
              :key="i"
              @click="currentSlide = i"
              class="w-3 h-3 rounded-full transition"
              :class="currentSlide === i ? 'bg-blue-600 scale-110' : 'bg-gray-300'"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <!-- <section class="px-6 py-20 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <h2 class="text-3xl font-bold">Mulai Bisnis Pulsa Sekarang</h2>
      <p class="opacity-90 mt-2">Daftar gratis dan langsung dapat akses penuh.</p>
      <a
        href="/register"
        class="inline-block mt-6 px-8 py-3 rounded-xl bg-white text-blue-600 font-semibold shadow hover:scale-105 transition"
      >
        Buat Akun Gratis
      </a>
    </section> -->

    <!-- CTA -->
    <section class="px-6 py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
      <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <!-- Text -->
        <div class="text-center md:text-left">
          <h2 class="text-3xl md:text-4xl font-bold leading-tight">Mulai Bisnis Pulsa Sekarang</h2>

          <p class="opacity-90 mt-3 max-w-md mx-auto md:mx-0">
            Daftar gratis dan langsung dapat akses penuh ke sistem penjualan pulsa modern yang
            cepat, stabil, dan menguntungkan.
          </p>

          <a
            href="/register"
            class="inline-block mt-6 px-8 py-3 rounded-xl bg-white text-blue-600 font-semibold shadow hover:scale-105 transition"
          >
            Buat Akun Gratis
          </a>
        </div>

        <!-- Smartphone Image -->
        <div class="flex justify-center md:justify-end"></div>
      </div>
    </section>

    <!-- FOOTER -->
    <!-- <footer class="text-center text-sm text-gray-500 py-8">
      © 2026 Outlet Pulsa. All rights reserved.
    </footer> -->
    <!-- FOOTER -->
    <footer class="bg-white border-t border-gray-100">
      <div class="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-4 gap-8 text-sm text-gray-600">
        <!-- Brand -->
        <div class="space-y-3">
          <div class="flex items-center gap-2 font-extrabold text-gray-800">
            <div
              class="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow"
            >
              ⚡
            </div>
            <span>Outlet Pulsa</span>
          </div>
          <p class="text-gray-500">
            Platform penjualan pulsa, paket data, dan PPOB modern untuk membantu bisnis digital
            berkembang lebih cepat.
          </p>
        </div>

        <!-- Navigasi -->
        <div>
          <h3 class="font-semibold text-gray-800 mb-3">Navigasi</h3>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-blue-600">Beranda</a></li>
            <li><a href="#" class="hover:text-blue-600">Fitur</a></li>
            <li><a href="#" class="hover:text-blue-600">Testimoni</a></li>
            <li><a href="#" class="hover:text-blue-600">Daftar Harga</a></li>
          </ul>
        </div>

        <!-- Bantuan -->
        <div>
          <h3 class="font-semibold text-gray-800 mb-3">Bantuan</h3>
          <ul class="space-y-2">
            <li><a href="#" class="hover:text-blue-600">FAQ</a></li>
            <li><a href="#" class="hover:text-blue-600">Kontak Support</a></li>
            <li><a href="#" class="hover:text-blue-600">Kebijakan Privasi</a></li>
            <li><a href="#" class="hover:text-blue-600">Syarat & Ketentuan</a></li>
          </ul>
        </div>

        <!-- Sosial + App -->
        <div>
          <h3 class="font-semibold text-gray-800 mb-3">Ikuti Kami</h3>

          <!-- Sosial Media -->
          <div class="flex items-center gap-3 mb-4">
            <a href="#"
              ><img
                class="h-6"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAKklEQVR4AWMYBaNgFIwEwzA0GhjEwMDA8J8B4n8GBoYGBgYGhjE0AAAzWQYk5EYh3wAAAABJRU5ErkJggg=="
            /></a>
            <a href="#"
              ><img
                class="h-6"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAKUlEQVR4AWMYBaNgFIwEwzA0GhjEwMDA8J+B4n8GBoYGBgYGhjE0AABY2QYkLw0YxQAAAABJRU5ErkJggg=="
            /></a>
            <a href="#"
              ><img
                class="h-6"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAK0lEQVR4AWMYBaNgFIwEwzA0GhjEwMDA8J+B4n8GBoYGBgYGhjE0AACg0QYkNQ2rTQAAAABJRU5ErkJggg=="
            /></a>
          </div>

          <!-- Download App -->
          <!-- <div class="flex items-center gap-2">
            <a href="#">
              <img
                class="h-6"
                src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjMTg3N0YyIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIyIDEyQzIyIDYuNDc3IDE3LjUyMyAyIDExLjk5OCAyUzIgNi40NzcgMiAxMnM0LjQ3NyAxMCA5Ljk5OCAxMGM1LjUyNSAwIDEwLTQuNDc3IDEwLTEwem0tNS41IDBoLTIuNXY4aC0zdi04SDl2LTNoMi41VjcuNWMwLTIuNDg1IDEuNDkyLTMuODUgMy42NzgtMy44NUgxOGw1IDEwLTMuNWgtMS41eiIvPjwvc3ZnPg=="
              />
            </a>
            <a href="#">
              <img
                class="h-6"
                src="data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRTQ0MDVGIiB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEyIDJhMTAgMTAgMCAxIDAgMCAyMCAxMCAxMCAwIDAgMCAwLTIwem0wIDVhNSAzIDAgMSAxIDAgNiA1IDMgMCAxIDEgMC02em0zLjUtMy41YTEuNSAxLjUgMCAxIDAgMCAzIDEuNSAxLjUgMCAwIDAgMC0zeiIvPjwvc3ZnPg=="
              />
            </a>
          </div> -->
          <div class="flex items-center gap-2">
            <!-- Google Play SVG -->
            <a href="https://play.google.com/store/apps/details?id=com.example.app" target="_blank">
              <svg
                class="h-6"
                viewBox="0 0 512 512"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M325.3 234.3L104.6 15.7C95.4 6.5 82.5 1.3 69.2 1.3 55.9 1.3 43 6.5 33.8 15.7L12.3 37.2c-14.2 14.2-14.2 37.3 0 51.5l214.3 214.3-214.3 214.3c-14.2 14.2-14.2 37.3 0 51.5l21.5 21.5c10.2 10.2 23.1 15.4 36.4 15.4 13.3 0 26.2-5.2 36.4-15.4L325.3 277.7c12.5-12.5 12.5-32.8 0-43.4z"
                />
              </svg>
            </a>

            <!-- App Store SVG -->
            <a href="https://apps.apple.com/app/idXXXXXXXXX" target="_blank">
              <svg
                class="h-6"
                viewBox="0 0 512 512"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M412 64H100C77.9 64 60 81.9 60 104v304c0 22.1 17.9 40 40 40h312c22.1 0 40-17.9 40-40V104c0-22.1-17.9-40-40-40zm-196 64c17.7 0 32 14.3 32 32s-14.3 32-32 32-32-14.3-32-32 14.3-32 32-32zm104 256H100v-32h220v32zm0-64H100v-32h220v32zm0-64H100v-32h220v32z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <!-- <div class="text-center text-xs text-gray-400 pb-6">
        © 2026 Outlet Pulsa. All rights reserved.
      </div> -->
      <div
        class="text-center text-sm text-black-500 py-6 bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300 shadow-sm backdrop-blur-sm"
      >
        © 2026 Outlet Pulsa. All rights reserved.
      </div>
    </footer>
  </div>
  <!-- SCROLL TO TOP -->
  <!-- SCROLL TO TOP -->
  <button
    v-show="showScrollTop"
    @click="scrollToTop"
    class="fixed bottom-22 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br border-white from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 backdrop-blur hover:scale-110 hover:shadow-xl transition-all duration-300 animate-fadeInUp"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      stroke-width="2"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
    </svg>
  </button>

  <!-- FLOATING WHATSAPP -->
  <a
    href="https://wa.me/6281234567890"
    target="_blank"
    class="fixed bottom-6 right-6 z-50 w-14 h-14 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 hover:scale-110 hover:shadow-xl transition-all duration-300"
  >
    <!-- WhatsApp Icon SVG -->
    <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7" viewBox="0 0 32 32" fill="currentColor">
      <path
        d="M19.11 17.41c-.28-.14-1.64-.81-1.9-.9-.25-.09-.43-.14-.61.14s-.7.9-.86 1.08c-.16.18-.32.2-.6.07-.28-.14-1.2-.44-2.28-1.4-.84-.75-1.4-1.67-1.56-1.95-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.61-1.48-.83-2.02-.22-.53-.44-.46-.61-.47l-.52-.01c-.18 0-.48.07-.73.34-.25.28-.95.93-.95 2.27s.97 2.63 1.11 2.82c.14.18 1.91 2.91 4.64 4.08.65.28 1.15.45 1.54.58.65.21 1.24.18 1.71.11.52-.08 1.64-.67 1.87-1.31.23-.64.23-1.19.16-1.31-.07-.12-.25-.2-.53-.34z"
      />
      <path
        d="M16.03 3C9.4 3 4 8.4 4 15.03c0 2.65.86 5.1 2.31 7.09L4 29l7.07-2.27a11.96 11.96 0 0 0 4.96 1.05c6.63 0 12.03-5.4 12.03-12.03S22.66 3 16.03 3zm0 21.86c-1.68 0-3.32-.45-4.75-1.29l-.34-.2-4.2 1.35 1.37-4.09-.22-.35a9.86 9.86 0 1 1 8.14 4.58z"
      />
    </svg>
  </a>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
const mobileMenuOpen = ref(false);
const features = [
  { icon: '⚡', title: 'Transaksi Cepat', desc: 'Proses hitungan detik dengan sistem stabil.' },
  { icon: '💰', title: 'Harga Kompetitif', desc: 'Margin keuntungan lebih besar untuk mitra.' },
  { icon: '📱', title: 'Semua Operator', desc: 'Pulsa, paket data, dan PPOB lengkap.' },
];

const stats = [
  { value: '10K+', label: 'Member Aktif' },
  { value: '1Jt+', label: 'Transaksi' },
  { value: '99.9%', label: 'Uptime Server' },
  { value: '24/7', label: 'Support' },
];

// const testimonials = [
//   { name: 'Budi - Agen', text: 'Aplikasinya stabil dan profitnya terasa.' },
//   { name: 'Sari - Konter', text: 'Transaksi cepat, pelanggan jadi senang.' },
//   { name: 'Andi - Reseller', text: 'Support responsif dan sistem mudah dipakai.' },
// ];

const testimonials = [
  { name: 'Budi - Agen', text: 'Aplikasinya stabil dan profitnya terasa.' },
  { name: 'Sari - Konter', text: 'Transaksi cepat, pelanggan jadi senang.' },
  { name: 'Andi - Reseller', text: 'Support responsif dan mudah dipakai.' },
  { name: 'Sari - Konter', text: 'Transaksi cepat, pelanggan jadi senang.' },
  { name: 'Andi - Reseller', text: 'Support responsif dan mudah dipakai.' },
];

// const currentSlide = ref(0);

// onMounted(() => {
//   setInterval(() => {
//     currentSlide.value = (currentSlide.value + 1) % testimonials.length;
//   }, 4000);
// });

const showScrollTop = ref(false);

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 300;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);

  setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % testimonialGroups.length;
  }, 4000);
});

const currentSlide = ref(0);

// kelompokkan testimonial per 3 item
const testimonialGroups = [];
for (let i = 0; i < testimonials.length; i += 3) {
  testimonialGroups.push(testimonials.slice(i, i + 3));
}

onMounted(() => {
  setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % testimonialGroups.length;
  }, 4000);
});
</script>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out;
}
/* Animasi slide-down untuk mobile menu */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.slide-down-enter-to {
  opacity: 1;
  transform: translateY(0);
}
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(0);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
