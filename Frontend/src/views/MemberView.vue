<template>
  <div class="min-h-screen bg-gray-50">
    <!-- HEADER / NAVBAR -->
    <header class="bg-white shadow-md sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-2 font-bold text-gray-800 text-xl">
          <div
            class="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center"
          >
            ⚡
          </div>
          <span>Member Area</span>
        </div>

        <!-- DESKTOP MENU -->
        <nav class="hidden md:flex gap-4">
          <button
            @click="activeTab = 'dashboard'"
            :class="
              activeTab === 'dashboard'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-blue-600'
            "
            class="py-2 px-3 transition"
          >
            Dashboard
          </button>
          <button
            @click="activeTab = 'topup'"
            :class="
              activeTab === 'topup'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-blue-600'
            "
            class="py-2 px-3 transition"
          >
            Top-Up
          </button>
          <button
            @click="activeTab = 'transaksi'"
            :class="
              activeTab === 'transaksi'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-blue-600'
            "
            class="py-2 px-3 transition"
          >
            Riwayat Transaksi
          </button>
          <button
            @click="activeTab = 'profile'"
            :class="
              activeTab === 'profile'
                ? 'text-blue-600 font-semibold border-b-2 border-blue-600'
                : 'text-gray-700 hover:text-blue-600'
            "
            class="py-2 px-3 transition"
          >
            Profil
          </button>
          <a href="/logout" class="ml-4 py-2 px-3 text-red-500 hover:text-red-600 transition">
            Logout
          </a>
        </nav>

        <!-- MOBILE HAMBURGER -->
        <div class="md:hidden flex items-center">
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="p-2 rounded-md hover:bg-gray-100 transition"
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

      <!-- MOBILE MENU -->
      <transition name="slide-down">
        <div
          v-if="mobileMenuOpen"
          class="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl shadow-lg flex flex-col divide-y divide-gray-200 z-50"
        >
          <div class="flex flex-col p-4 space-y-3">
            <button
              @click="
                activeTab = 'dashboard';
                mobileMenuOpen = false;
              "
              class="w-full text-left py-3 px-4 rounded-xl font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Dashboard
            </button>
            <button
              @click="
                activeTab = 'topup';
                mobileMenuOpen = false;
              "
              class="w-full text-left py-3 px-4 rounded-xl font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Top-Up
            </button>
            <button
              @click="
                activeTab = 'transaksi';
                mobileMenuOpen = false;
              "
              class="w-full text-left py-3 px-4 rounded-xl font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Riwayat Transaksi
            </button>
            <button
              @click="
                activeTab = 'profile';
                mobileMenuOpen = false;
              "
              class="w-full text-left py-3 px-4 rounded-xl font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
            >
              Profil
            </button>
          </div>
          <div class="p-4">
            <a
              href="/logout"
              class="block w-full py-3 px-4 text-center rounded-xl font-semibold text-red-500 hover:bg-red-50 hover:text-red-600 transition"
            >
              Logout
            </a>
          </div>
        </div>
      </transition>
    </header>

    <!-- MAIN CONTENT -->
    <main class="max-w-6xl mx-auto px-6 py-8">
      <!-- DASHBOARD -->
      <section v-if="activeTab === 'dashboard'" class="space-y-6">
        <h1 class="text-3xl font-bold text-gray-800">Dashboard Member</h1>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <p class="text-gray-500 text-sm">Saldo</p>
            <p class="text-2xl font-bold text-blue-600 mt-2">{{ saldo | currency }}</p>
          </div>
          <div class="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <p class="text-gray-500 text-sm">Total Transaksi</p>
            <p class="text-2xl font-bold text-blue-600 mt-2">{{ transaksi.length }}</p>
          </div>
          <div class="p-6 bg-white rounded-2xl shadow hover:shadow-lg transition">
            <p class="text-gray-500 text-sm">Transaksi Berhasil</p>
            <p class="text-2xl font-bold text-blue-600 mt-2">
              {{ transaksi.filter((t) => t.status === 'success').length }}
            </p>
          </div>
        </div>
      </section>

      <!-- TOP-UP -->
      <section v-if="activeTab === 'topup'" class="space-y-6">
        <h1 class="text-3xl font-bold text-gray-800">Top-Up Saldo</h1>
        <div class="bg-white p-6 rounded-2xl shadow-md max-w-md">
          <label class="block text-gray-700 mb-2">Jumlah Top-Up</label>
          <input
            v-model.number="topupAmount"
            type="number"
            min="1000"
            placeholder="Masukkan nominal"
            class="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            @click="doTopup"
            class="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition"
          >
            Top-Up Sekarang
          </button>
        </div>
      </section>

      <!-- RIWAYAT TRANSAKSI -->
      <section v-if="activeTab === 'transaksi'" class="space-y-6">
        <h1 class="text-3xl font-bold text-gray-800">Riwayat Transaksi</h1>
        <div class="overflow-x-auto">
          <table class="w-full bg-white rounded-2xl shadow-md">
            <thead class="bg-gray-100">
              <tr>
                <th class="p-3 text-left">Tanggal</th>
                <th class="p-3 text-left">Deskripsi</th>
                <th class="p-3 text-left">Jumlah</th>
                <th class="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in transaksi" :key="t.id" class="border-b border-gray-200">
                <td class="p-3 text-gray-700">{{ t.date }}</td>
                <td class="p-3 text-gray-700">{{ t.desc }}</td>
                <td class="p-3 text-gray-700">{{ t.amount | currency }}</td>
                <td class="p-3">
                  <span
                    :class="t.status === 'success' ? 'text-green-600' : 'text-red-600'"
                    class="font-semibold"
                  >
                    {{ t.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- PROFILE -->
      <section v-if="activeTab === 'profile'" class="space-y-6">
        <h1 class="text-3xl font-bold text-gray-800">Profil Saya</h1>
        <div class="bg-white p-6 rounded-2xl shadow-md max-w-md space-y-4">
          <div>
            <label class="text-gray-700">Nama</label>
            <input
              v-model="profile.name"
              type="text"
              class="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label class="text-gray-700">Email</label>
            <input
              v-model="profile.email"
              type="email"
              class="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            @click="updateProfile"
            class="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition"
          >
            Simpan Perubahan
          </button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const activeTab = ref('dashboard');
const mobileMenuOpen = ref(false);

const saldo = ref(150000);
const transaksi = ref([
  { id: 1, date: '2026-02-18', desc: 'Top-Up Saldo', amount: 50000, status: 'success' },
  { id: 2, date: '2026-02-17', desc: 'Pembelian Pulsa', amount: -20000, status: 'success' },
  { id: 3, date: '2026-02-16', desc: 'Pembelian Paket Data', amount: -50000, status: 'failed' },
]);

const topupAmount = ref(0);
const doTopup = () => {
  if (topupAmount.value > 0) {
    transaksi.value.unshift({
      id: transaksi.value.length + 1,
      date: new Date().toISOString().slice(0, 10),
      desc: 'Top-Up Saldo',
      amount: topupAmount.value,
      status: 'success',
    });
    saldo.value += topupAmount.value;
    topupAmount.value = 0;
    alert('Top-Up Berhasil!');
  }
};

const profile = ref({ name: 'Muammar', email: 'muammar@example.com' });
const updateProfile = () => alert('Profil berhasil diperbarui!');

const currency = (value: number) => 'Rp ' + value.toLocaleString('id-ID');
</script>

<style>
body {
  font-family: 'Inter', sans-serif;
}

/* Mobile Menu Animasi */
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
