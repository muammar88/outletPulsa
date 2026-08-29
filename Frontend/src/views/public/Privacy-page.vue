<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-slate-50 flex flex-col font-poppins relative overflow-hidden">
    <!-- Abstract Background Elements -->
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <div class="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-gradient-to-br from-blue-400/20 to-indigo-300/10 rounded-full blur-3xl animate-blob"></div>
      <div class="absolute top-[20%] -right-[10%] w-[40%] h-[40%] bg-gradient-to-bl from-teal-300/20 to-emerald-200/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-[10%] left-[20%] w-[60%] h-[40%] bg-gradient-to-tr from-indigo-400/10 to-blue-300/10 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <!-- NAVBAR -->
    <div class="relative z-50">
      <Navbar />
    </div>
    <div class="h-24"></div>

    <!-- HERO SECTION -->
    <section class="relative pt-12 pb-16 px-6 text-center z-10">
      <div class="max-w-4xl mx-auto fade-in-up">
        <div class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/60 backdrop-blur-md border border-white/80 shadow-sm text-blue-700 text-xs font-bold mb-6 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-default">
          <IconShieldLock class="w-4 h-4 text-blue-600" :stroke-width="2.5" />
          Kebijakan Privasi
        </div>

        <h1 class="text-4xl md:text-6xl font-extrabold text-slate-800 leading-tight mb-6 tracking-tight">
          Privasi Anda Adalah
          <br class="hidden md:block" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500">
            Prioritas Utama Kami
          </span>
        </h1>
        
        <p class="text-slate-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8 font-medium">
          Kami berkomitmen penuh untuk melindungi informasi dan data pribadi Anda. Pelajari bagaimana kami menjaga privasi Anda di bawah ini.
        </p>
        
        <div class="inline-flex items-center gap-2 text-sm text-slate-400 font-medium bg-white/50 px-4 py-2 rounded-lg border border-slate-100">
          <IconClockPlay class="w-4 h-4" /> Terakhir diperbarui: 29 Agustus 2026
        </div>
      </div>
    </section>

    <!-- CONTENT SECTION -->
    <section class="px-4 md:px-8 pb-24 flex-grow relative z-10">
      <div class="max-w-5xl mx-auto">
        
        <!-- Intro Card -->
        <div class="bg-white/70 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-lg shadow-blue-900/5 border border-white/80 mb-12 fade-in-up delay-100 hover:shadow-xl transition-all duration-300">
          <p class="text-lg md:text-xl font-medium text-slate-700 leading-relaxed text-center">
            Selamat datang di <span class="font-bold text-blue-600">OutletPulsa</span>. Kebijakan Privasi ini disusun secara transparan untuk menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda saat menggunakan seluruh layanan dan aplikasi kami.
          </p>
        </div>

        <!-- Grid Cards -->
        <div class="grid md:grid-cols-2 gap-8">
          
          <!-- Card 1 -->
          <div class="group bg-white rounded-3xl p-8 shadow-md shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/10 hover:border-blue-100 transition-all duration-300 fade-in-up delay-100">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 border border-blue-100/50">
              <IconDatabase class="w-7 h-7 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-4 group-hover:text-blue-600 transition-colors">Rincian Data yang Diambil</h3>
            <p class="text-slate-500 leading-relaxed mb-3">
              Kami secara spesifik mengumpulkan informasi berikut saat Anda menggunakan aplikasi:
            </p>
            <ul class="space-y-2 text-slate-500 text-sm">
              <li class="flex items-center gap-2"><IconCheck class="w-4 h-4 text-blue-500" /> Nama Lengkap</li>
              <li class="flex items-center gap-2"><IconCheck class="w-4 h-4 text-blue-500" /> Nomor HP / WhatsApp (untuk OTP)</li>
              <li class="flex items-center gap-2"><IconCheck class="w-4 h-4 text-blue-500" /> Alamat Email</li>
              <li class="flex items-center gap-2"><IconCheck class="w-4 h-4 text-blue-500" /> Akses Kamera (hanya digunakan fitur scan QR/Barcode)</li>
            </ul>
          </div>

          <!-- Card 2 -->
          <div class="group bg-white rounded-3xl p-8 shadow-md shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-teal-900/10 hover:border-teal-100 transition-all duration-300 fade-in-up delay-200">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 border border-teal-100/50">
              <IconSettings class="w-7 h-7 text-teal-600" />
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-4 group-hover:text-teal-600 transition-colors">Tujuan Penggunaan Data</h3>
            <p class="text-slate-500 leading-relaxed mb-4">Informasi Anda kami gunakan secara eksklusif untuk kebutuhan layanan:</p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3 text-slate-500 text-sm">
                <IconCheck class="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span>Memproses transaksi pulsa, paket data, dan layanan PPOB Anda.</span>
              </li>
              <li class="flex items-start gap-3 text-slate-500 text-sm">
                <IconCheck class="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span>Proses Login dan verifikasi keamanan ganda (menggunakan OTP).</span>
              </li>
              <li class="flex items-start gap-3 text-slate-500 text-sm">
                <IconCheck class="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                <span>Mencegah akses tidak sah, penipuan (fraud), dan melindungi akun Anda.</span>
              </li>
            </ul>
          </div>

          <!-- Card 3 -->
          <div class="group bg-white rounded-3xl p-8 shadow-md shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-900/10 hover:border-purple-100 transition-all duration-300 fade-in-up delay-300">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-50 to-fuchsia-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 border border-purple-100/50">
              <IconShieldCheck class="w-7 h-7 text-purple-600" />
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-4 group-hover:text-purple-600 transition-colors">Pernyataan Keamanan & Berbagi Data</h3>
            <p class="text-slate-500 leading-relaxed">
              Privasi Anda sangat terjamin. Kami <strong class="text-slate-700">tidak akan pernah menjual, menyewakan, atau mendistribusikan</strong> data pribadi Anda kepada pihak ketiga manapun untuk tujuan pemasaran. Data hanya dibagikan sejauh yang diperlukan untuk menyelesaikan transaksi (seperti _payment gateway_ resmi kami).
            </p>
          </div>

          <!-- Card 4 (New) -->
          <div class="group bg-white rounded-3xl p-8 shadow-md shadow-slate-200/50 border border-slate-100 hover:-translate-y-2 hover:shadow-2xl hover:shadow-rose-900/10 hover:border-rose-100 transition-all duration-300 fade-in-up delay-400">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 border border-rose-100/50">
              <IconTrash class="w-7 h-7 text-rose-500" />
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-4 group-hover:text-rose-500 transition-colors">Penghapusan Akun & Data Anda</h3>
            <p class="text-slate-500 leading-relaxed text-sm mb-4">
              Anda memiliki hak penuh atas data Anda. Kapanpun Anda ingin berhenti menggunakan layanan kami, Anda dapat meminta penghapusan akun dan seluruh data yang terkait:
            </p>
            <div class="bg-rose-50 p-4 rounded-xl border border-rose-100">
              <p class="text-sm font-medium text-rose-800">
                Silakan kirimkan email permintaan ke <a href="mailto:admin@deepeazy.com" class="underline decoration-rose-400 hover:text-rose-600">admin@deepeazy.com</a> dengan subjek "Permintaan Hapus Akun". Tim kami akan memprosesnya dalam 2x24 jam kerja.
              </p>
            </div>
          </div>
          
        </div>

        <!-- Full width card for Policy Changes -->
        <div class="mt-8 bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 md:p-10 shadow-2xl shadow-slate-900/20 border border-slate-700 relative overflow-hidden group hover:shadow-blue-900/30 transition-all duration-500 fade-in-up delay-500">
          <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity duration-500"></div>
          
          <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div class="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/10">
              <IconHistory class="w-8 h-8 text-blue-300" />
            </div>
            <div>
              <h3 class="text-2xl font-bold text-white mb-3">Pembaruan Kebijakan</h3>
              <p class="text-slate-300 leading-relaxed max-w-3xl">
                OutletPulsa berhak memperbarui Kebijakan Privasi ini sewaktu-waktu. Setiap pembaruan yang signifikan akan diberitahukan langsung melalui notifikasi aplikasi atau email terdaftar Anda. Dengan tetap menggunakan layanan, Anda menyetujui kebijakan terbaru kami.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- FOOTER -->
    <Footer class="mt-auto relative z-10" />
  </div>
</template>

<script setup lang="ts">
import { 
  IconShieldLock, 
  IconDatabase, 
  IconSettings, 
  IconUsers, 
  IconShieldCheck, 
  IconHistory,
  IconClockPlay,
  IconCheck,
  IconTrash
} from '@/components/Icons';
import Navbar from '@/views/public/components/Navbar.vue';
import Footer from '@/views/public/components/Footer.vue';
</script>

<style scoped>
.font-poppins {
  font-family: 'Poppins', sans-serif;
}

.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }

/* Blob animations */
.animate-blob {
  animation: blob 10s infinite alternate;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
</style>
