<template>
  <div class="bg-gray-50 text-gray-800">
    <!-- Navbar -->
    <header class="bg-white shadow-sm sticky top-0 z-50 animate-fadeDown">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <h1 class="text-xl font-bold text-blue-700">Outlet Pulsa</h1>
        <nav class="hidden md:flex gap-8 text-sm font-medium">
          <a href="#fitur" class="hover:text-blue-600">Fitur</a>
          <a href="#harga" class="hover:text-blue-600">Harga</a>
          <a href="#kontak" class="hover:text-blue-600">Kontak</a>
        </nav>
        <a
          href="/login"
          class="bg-blue-700 text-white px-5 py-2 rounded-xl text-sm hover:bg-blue-800 transition hover:scale-105"
        >
          Login
        </a>
      </div>
    </header>

    <!-- Hero Section -->
    <section
      class="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white"
    >
      <div class="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">
        <div class="space-y-6 animate-fadeUp">
          <h2 class="text-4xl md:text-5xl font-bold leading-tight">
            Aplikasi Penjualan Pulsa
            <span class="text-blue-300">Modern & Otomatis</span>
          </h2>

          <p class="text-blue-100 text-lg">
            Kelola transaksi pulsa, paket data, PPOB, dan laporan keuangan dalam satu sistem
            terintegrasi yang cepat, aman, dan mudah digunakan.
          </p>

          <div class="flex gap-4">
            <a
              href="/login"
              class="bg-white text-blue-800 font-semibold px-6 py-3 rounded-2xl hover:scale-105 transition"
            >
              Mulai Sekarang
            </a>
            <a
              href="#fitur"
              class="border border-white/40 px-6 py-3 rounded-2xl hover:bg-white/10 transition"
            >
              Lihat Fitur
            </a>
          </div>
        </div>

        <!-- Illustration Card -->
        <div class="relative animate-zoomIn">
          <div
            class="bg-white/10 backdrop-blur rounded-3xl p-8 shadow-2xl border border-white/20 animate-float"
          >
            <div class="space-y-4">
              <div class="h-4 bg-white/40 rounded w-3/4"></div>
              <div class="h-4 bg-white/30 rounded w-1/2"></div>
              <div class="h-32 bg-white/20 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section id="fitur" class="max-w-7xl mx-auto px-6 py-24">
      <h3 class="text-3xl font-bold text-center mb-12 animate-fadeUp">Fitur Unggulan</h3>

      <div class="grid md:grid-cols-3 gap-8">
        <div
          v-for="f in fitur"
          :key="f.title"
          class="bg-white rounded-3xl p-8 shadow-sm border hover:shadow-xl transition animate-fadeUp"
        >
          <div class="text-3xl mb-4">{{ f.icon }}</div>
          <h4 class="font-semibold text-lg mb-2">{{ f.title }}</h4>
          <p class="text-gray-600 text-sm">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Pricing -->
    <section id="harga" class="bg-gray-100 py-24">
      <div class="max-w-5xl mx-auto px-6 text-center">
        <h3 class="text-3xl font-bold mb-12 animate-fadeUp">Paket Harga</h3>

        <div class="grid md:grid-cols-3 gap-8">
          <div
            v-for="p in pricing"
            :key="p.name"
            class="bg-white rounded-3xl p-8 shadow border hover:shadow-2xl transition animate-rise"
          >
            <h4 class="font-semibold text-lg mb-2">{{ p.name }}</h4>
            <p class="text-3xl font-bold text-blue-700 mb-4">{{ p.price }}</p>
            <ul class="text-sm text-gray-600 space-y-2 mb-6">
              <li v-for="i in p.items" :key="i">✓ {{ i }}</li>
            </ul>
            <button
              class="w-full bg-blue-700 text-white py-2 rounded-xl hover:bg-blue-800 transition hover:scale-105"
            >
              Pilih Paket
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="py-24 text-center animate-fadeUp">
      <h3 class="text-3xl font-bold mb-4">Siap Memulai Bisnis Pulsa?</h3>
      <p class="text-gray-600 mb-8">
        Gunakan sistem Outlet Pulsa untuk meningkatkan penjualan dan efisiensi operasional Anda.
      </p>
      <a
        href="/login"
        class="bg-blue-700 text-white px-8 py-3 rounded-2xl hover:bg-blue-800 transition hover:scale-105"
      >
        Login Sekarang
      </a>
    </section>

    <!-- Footer -->
    <footer id="kontak" class="bg-blue-900 text-blue-100 py-12 text-center text-sm animate-fadeUp">
      © {{ new Date().getFullYear() }} Outlet Pulsa. Semua hak dilindungi.
    </footer>
  </div>
</template>

<script setup>
const fitur = [
  {
    icon: '⚡',
    title: 'Transaksi Cepat',
    desc: 'Proses pembelian pulsa dan paket data dalam hitungan detik.',
  },
  {
    icon: '📊',
    title: 'Laporan Otomatis',
    desc: 'Pantau omzet, keuntungan, dan riwayat transaksi secara real-time.',
  },
  {
    icon: '🔒',
    title: 'Sistem Aman',
    desc: 'Keamanan data dan transaksi dengan autentikasi berlapis.',
  },
];

const pricing = [
  {
    name: 'Basic',
    price: 'Gratis',
    items: ['Transaksi pulsa', 'Riwayat transaksi', 'Support email'],
  },
  {
    name: 'Pro',
    price: 'Rp49rb/bln',
    items: ['Semua fitur Basic', 'Laporan lengkap', 'Multi user'],
  },
  {
    name: 'Bisnis',
    price: 'Rp99rb/bln',
    items: ['Semua fitur Pro', 'PPOB lengkap', 'Prioritas support'],
  },
];
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
  animation: fadeUp 0.9s ease forwards;
}

@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fadeDown {
  animation: fadeDown 0.7s ease forwards;
}

@keyframes zoomIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-zoomIn {
  animation: zoomIn 0.8s ease forwards;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-rise {
  animation: rise 0.9s ease forwards;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}
</style>
