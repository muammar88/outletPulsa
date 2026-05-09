<!-- <script setup lang="ts">
  import Content from './widgets/Content.vue'
  import Header from './widgets/Header.vue'
  import LoadOverlay from '@/components/Loading/LoadOverlay.vue'
</script>
<template>
  <LoadOverlay />
  <div class="min-h-screen flex flex-col bg-white">
    <Header />
    <Content />
  </div>
</template> -->
<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-gray-100 overflow-hidden">
    <!-- Left Section -->
    <transition name="slide-fade" appear>
      <div
        class="md:w-1/2 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white flex items-center justify-center p-10"
      >
        <div class="max-w-md space-y-6 animate-fadeIn">
          <div class="flex items-center gap-3">
            <div
              class="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-bold animate-bounceSlow"
            >
              P
            </div>
            <h1 class="text-3xl font-bold tracking-wide">Outlet Pulsa</h1>
          </div>

          <p class="text-blue-100 leading-relaxed">
            Area ini merupakan halaman terbatas yang hanya dapat diakses oleh pengguna dengan hak
            akses administrator. Fitur dan informasi di dalamnya ditujukan untuk pengelolaan sistem
            aplikasi secara internal.
          </p>

          <div class="hidden md:block">
            <div class="mt-10 rounded-3xl bg-white/10 backdrop-blur p-6 shadow-xl animate-float">
              <p class="text-sm text-blue-100">
                Sistem manajemen modern untuk mengelola transaksi, pengguna, dan laporan dengan
                cepat dan aman.
              </p>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Right Section -->
    <transition name="fade-scale" appear>
      <div class="md:w-1/2 flex items-center justify-center p-6">
        <div class="w-full max-w-md">
          <div class="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-rise">
            <h2 class="text-2xl font-semibold text-gray-800 text-center">Login Area Admin</h2>

            <form class="mt-6 space-y-5" @submit.prevent="handleLogin">
              <!-- Username -->
              <div class="animate-fadeIn delay-100">
                <label class="block mb-2 text-sm font-medium text-gray-700"> Username </label>
                <input
                  v-model="form.username"
                  type="text"
                  placeholder="Masukkan username anda"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-600 focus:border-blue-600 block w-full p-3 transition duration-300 focus:scale-[1.02]"
                  required
                />
              </div>

              <!-- Password -->
              <div class="animate-fadeIn delay-200">
                <label class="block mb-2 text-sm font-medium text-gray-700"> Password </label>
                <input
                  v-model="form.password"
                  type="password"
                  placeholder="Masukkan password anda"
                  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-blue-600 focus:border-blue-600 block w-full p-3 transition duration-300 focus:scale-[1.02]"
                  required
                />
              </div>

              <!-- Remember + Forgot -->
              <div class="flex items-center justify-between text-sm animate-fadeIn delay-300">
                <label class="flex items-center gap-2 text-gray-600">
                  <input
                    type="checkbox"
                    v-model="form.remember"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  Ingat saya
                </label>

                <a href="#" class="text-blue-600 hover:underline"> Lupa password? </a>
              </div>

              <!-- Button -->
              <button
                type="submit"
                class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-xl text-sm px-5 py-3 transition duration-300 shadow-md hover:scale-[1.02] active:scale-[0.98] animate-fadeIn delay-500"
                :disabled="loading"
              >
                <span v-if="!loading">Masuk</span>
                <span v-else class="animate-pulse">Memproses...</span>
              </button>
            </form>
          </div>

          <p class="text-center text-xs text-gray-400 mt-6 animate-fadeIn delay-700">
            © {{ new Date().getFullYear() }} Outlet Pulsa. All rights reserved.
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';

const form = reactive({
  username: '',
  password: '',
  remember: false,
});

const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    alert(`Login berhasil: ${form.username}`);
  } catch (err) {
    alert('Login gagal');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Vue transitions */
.slide-fade-enter-active {
  transition: all 0.6s ease;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}

.fade-scale-enter-active {
  transition: all 0.5s ease;
}
.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease forwards;
}

.delay-100 {
  animation-delay: 0.1s;
}
.delay-200 {
  animation-delay: 0.2s;
}
.delay-300 {
  animation-delay: 0.3s;
}
.delay-500 {
  animation-delay: 0.5s;
}
.delay-700 {
  animation-delay: 0.7s;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
.animate-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-rise {
  animation: rise 0.7s ease forwards;
}

@keyframes bounceSlow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}
.animate-bounceSlow {
  animation: bounceSlow 3s infinite ease-in-out;
}
</style>
