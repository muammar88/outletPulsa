<template>
  <div
    class="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-100"
  >
    <!-- Background glow -->
    <div
      class="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-30 rounded-full blur-3xl animate-pulse"
    ></div>
    <div
      class="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-300 opacity-30 rounded-full blur-3xl animate-pulse"
    ></div>

    <!-- Card -->
    <div class="relative w-full max-w-md px-6">
      <div
        class="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-8 animate-fadeUp"
      >
        <!-- Logo -->
        <div class="flex flex-col items-center mb-6">
          <div class="w-14 h-14 flex items-center justify-center">
            <img src="/logo.webp" alt="Logo" class="w-full h-full object-contain drop-shadow-lg" />
          </div>
          <h1 class="mt-4 text-2xl font-bold text-gray-800">Login Member</h1>
          <p class="text-sm text-gray-500 text-center">
            Masuk untuk melakukan transaksi pulsa & melihat riwayat Anda
          </p>
        </div>

        <!-- Form -->
        <form class="space-y-5" @submit.prevent="handleLogin">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nomor HP / Username</label>
            <input
              v-model="form.username"
              type="text"
              placeholder="08xxxxxxxxxx"
              class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition focus:scale-[1.02]"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Masukkan password"
              class="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition focus:scale-[1.02]"
              required
            />
          </div>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 text-gray-600">
              <input
                type="checkbox"
                v-model="form.remember"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Ingat saya
            </label>
            <a href="#" class="text-blue-600 hover:underline">Lupa password?</a>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition duration-300 shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            <span v-if="!loading">Masuk ke Akun</span>
            <span v-else class="animate-pulse">Memproses...</span>
          </button>
        </form>

        <!-- Register link -->
        <p class="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?
          <a href="#" class="text-blue-600 font-medium hover:underline">Daftar sekarang</a>
        </p>
      </div>

      <!-- Footer small -->
      <p class="text-center text-xs text-gray-400 mt-6">
        © {{ new Date().getFullYear() }} Outlet Pulsa
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
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
    await new Promise((r) => setTimeout(r, 1200));
    alert('Login member berhasil');
  } catch (e) {
    alert('Login gagal');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeUp {
  animation: fadeUp 0.8s ease forwards;
}

@keyframes bounceSlow {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}
.animate-bounceSlow {
  animation: bounceSlow 3s ease-in-out infinite;
}
</style>
