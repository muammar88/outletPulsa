<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col" style="font-family: 'Poppins', sans-serif;">
    <!-- NAVBAR -->
    <Navbar />
    <div class="h-20"></div>

    <!-- HERO SECTION -->
    <section class="relative pt-16 pb-12 px-6 text-center overflow-hidden fade-in-up">
      <!-- Abstract BG -->
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-32 -left-32 w-96 h-96 bg-blue-300 opacity-20 rounded-full blur-3xl"></div>
        <div class="absolute -top-20 -right-32 w-80 h-80 bg-indigo-300 opacity-20 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 max-w-3xl mx-auto">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold mb-5 shadow-sm">
          <IconMessageCircle class="w-4 h-4" :stroke-width="2.5" />
          Hubungi Tim Kami
        </div>

        <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
          Punya Pertanyaan?
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Mari Berbincang</span>
        </h1>
        <p class="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
          Tim support kami selalu siap membantu Anda 24/7. Hubungi kami melalui form di bawah atau via saluran resmi kami.
        </p>
      </div>
    </section>

    <!-- MAIN CONTACT SECTION -->
    <section class="px-4 md:px-6 pb-24 flex-grow relative z-10">
      <div class="max-w-6xl mx-auto grid lg:grid-cols-5 gap-10">
        
        <!-- KIRI: INFORMASI KONTAK -->
        <div class="lg:col-span-2 space-y-6 fade-in-up delay-100">
          <div class="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-gray-100 h-full flex flex-col">
            <h3 class="text-2xl font-bold text-gray-800 mb-6">Informasi Kontak</h3>
            
            <div class="space-y-6 flex-grow">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100 text-blue-600">
                  <IconMapPin class="w-6 h-6" :stroke-width="2" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">Kantor Pusat</h4>
                  <p class="text-gray-500 text-sm leading-relaxed">Gedung Cyber 1 Lt. 3<br/>Jl. Kuningan Barat No. 8<br/>Jakarta Selatan 12710</p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center flex-shrink-0 border border-emerald-100 text-emerald-600">
                  <IconBrandWhatsapp class="w-6 h-6" :stroke-width="2" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">WhatsApp / Telepon</h4>
                  <p class="text-gray-500 text-sm leading-relaxed">+62 812-3456-7890<br/><span class="text-xs text-emerald-600 font-semibold">Aktif 24/7 untuk Member</span></p>
                </div>
              </div>

              <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100 text-indigo-600">
                  <IconMail class="w-6 h-6" :stroke-width="2" />
                </div>
                <div>
                  <h4 class="font-bold text-gray-900 mb-1">Email Support</h4>
                  <p class="text-gray-500 text-sm leading-relaxed">support@outletpulsa.co.id<br/>partnership@outletpulsa.co.id</p>
                </div>
              </div>
            </div>

            <!-- Social Media -->
            <div class="mt-10 pt-6 border-t border-gray-100">
              <h4 class="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Ikuti Kami</h4>
              <SocialMediaLinks />
            </div>
          </div>
        </div>

        <!-- KANAN: FORMULIR -->
        <div class="lg:col-span-3 fade-in-up delay-200">
          <div class="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-gray-100">
            <h3 class="text-2xl font-bold text-gray-800 mb-2">Kirim Pesan</h3>
            <p class="text-gray-500 text-sm mb-8">Isi formulir di bawah ini dan tim kami akan merespon dalam waktu 1x24 jam.</p>

            <form @submit.prevent="submitMessage" class="space-y-5">
              <div class="grid md:grid-cols-2 gap-5">
                <div class="space-y-1.5">
                  <label class="text-sm font-semibold text-gray-700">Nama Lengkap</label>
                  <input type="text" placeholder="Masukkan nama Anda" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm bg-gray-50/50" required />
                </div>
                <div class="space-y-1.5">
                  <label class="text-sm font-semibold text-gray-700">Nomor WhatsApp</label>
                  <input type="tel" placeholder="Contoh: 0812xxxx" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm bg-gray-50/50" required />
                </div>
              </div>
              
              <div class="space-y-1.5">
                <label class="text-sm font-semibold text-gray-700">Alamat Email</label>
                <input type="email" placeholder="nama@email.com" class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm bg-gray-50/50" required />
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-semibold text-gray-700">Kategori Pesan</label>
                <select class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm bg-gray-50/50 text-gray-600">
                  <option value="" disabled selected>Pilih kategori...</option>
                  <option value="bantuan">Bantuan Teknis / Transaksi</option>
                  <option value="kemitraan">Kemitraan & Kerjasama</option>
                  <option value="saran">Saran & Masukan</option>
                  <option value="lainnya">Lainnya</option>
                </select>
              </div>

              <div class="space-y-1.5">
                <label class="text-sm font-semibold text-gray-700">Pesan Anda</label>
                <textarea rows="4" placeholder="Tuliskan pesan Anda secara detail..." class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm bg-gray-50/50 resize-none" required></textarea>
              </div>

              <button type="submit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2">
                <IconSend class="w-5 h-5" :stroke-width="2.5" />
                Kirim Pesan Sekarang
              </button>
            </form>
          </div>
        </div>
        
      </div>
    </section>

    <!-- FOOTER -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { IconMessageCircle,
  IconMapPin,
  IconBrandWhatsapp,
  IconMail,
  IconSend } from '@/components/Icons';
import Navbar from '@/views/public/components/Navbar.vue';
import Footer from '@/views/public/components/Footer.vue';
import SocialMediaLinks from '@/views/public/components/SocialMediaLinks.vue';

const submitMessage = () => {
  // Mock function for submit
  alert('Pesan Anda berhasil dikirim. Tim kami akan segera menghubungi Anda!');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

.fade-in-up {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
</style>
