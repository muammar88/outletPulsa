<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4 relative overflow-hidden"
  >
    <!-- Background Blur -->
    <div
      class="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl animate-pulse"
    ></div>
    <div
      class="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-300 opacity-30 rounded-full blur-3xl animate-pulse delay-1000"
    ></div>

    <div class="w-full max-w-md relative z-10">
      <!-- Card -->
      <div
        class="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 space-y-6 animate-fadeIn border border-white/40"
      >
        <!-- Logo & Title -->
        <div class="text-center space-y-3">
          <div class="flex justify-center">
            <div class="w-16 h-16 flex items-center justify-center">
              <img src="/logo.webp" alt="Logo" class="w-full h-full object-contain drop-shadow-lg" />
            </div>
          </div>
          <h1 class="text-2xl font-bold text-gray-800">Daftar Member Baru</h1>
          <p class="text-sm text-gray-500">Buat akun untuk mulai transaksi pulsa</p>
        </div>

        <!-- REGISTER FORM -->
        <form class="space-y-4" @submit.prevent="handleRegister">
          <div>
            <label class="block text-sm font-medium text-gray-600">Nama Lengkap</label>
            <input
              v-model="register.name"
              type="text"
              placeholder="Masukkan nama lengkap"
              required
              class="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600">Email</label>
            <input
              v-model="register.email"
              type="email"
              placeholder="Masukkan email aktif"
              required
              class="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600">Password</label>
            <input
              v-model="register.password"
              type="password"
              placeholder="Buat password"
              required
              class="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600">Konfirmasi Password</label>
            <input
              v-model="register.confirmPassword"
              type="password"
              placeholder="Ulangi password"
              required
              class="w-full mt-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white/70 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <button
            type="submit"
            class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white py-2.5 rounded-xl font-semibold shadow-lg transition"
          >
            Daftar Sekarang
          </button>
        </form>

        <!-- Link ke Login -->
        <p class="text-center text-sm text-gray-500">
          Sudah punya akun?
          <a href="/login" class="text-blue-600 font-semibold hover:underline">Masuk di sini</a>
        </p>
      </div>

      <!-- Footer -->
      <p class="text-center text-xs text-gray-400 mt-6">
        © 2026 Outlet Pulsa. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const register = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const handleRegister = () => {
  if (register.value.password !== register.value.confirmPassword) {
    alert('Password tidak sama');
    return;
  }

  console.log('REGISTER:', register.value);
};
</script>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(25px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out;
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
