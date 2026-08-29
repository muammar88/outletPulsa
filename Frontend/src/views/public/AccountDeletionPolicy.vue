<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      <!-- Header -->
      <div class="bg-red-600 px-6 py-8 sm:px-10">
        <div class="flex items-center justify-center space-x-3 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <h1 class="text-3xl font-extrabold text-center">Permintaan Penghapusan Akun & Data</h1>
        </div>
      </div>

      <!-- Content -->
      <div class="px-6 py-8 sm:px-10 space-y-8 text-gray-700">
        <!-- Peringatan -->
        <section class="bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
          <h2 class="text-xl font-bold text-red-700 mb-3 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            Peringatan Penting
          </h2>
          <p class="text-red-600 leading-relaxed">
            Penghapusan akun bersifat <strong>permanen dan tidak dapat dibatalkan</strong>. Jika Anda memiliki sisa saldo di akun Anda, saldo tersebut akan <strong>hangus dan tidak dapat dicairkan</strong> (diuangkan kembali). Oleh karena itu, pastikan Anda <strong>menggunakan seluruh sisa saldo</strong> untuk bertransaksi hingga tersisa <strong>Rp 0</strong> sebelum mengajukan permintaan penghapusan akun.
          </p>
        </section>

        <!-- Langkah-langkah -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-100 pb-2">Langkah-langkah Penghapusan Akun</h2>
          <p class="mb-4">Untuk menghapus akun Anda, silakan hubungi Customer Service kami melalui salah satu saluran berikut:</p>
          
          <div class="grid sm:grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 rounded-lg p-5 border border-gray-200 flex items-start space-x-4">
              <div class="bg-green-100 p-2 rounded-full text-green-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">WhatsApp</h3>
                <a href="https://wa.me/6282173336973" target="_blank" class="text-blue-600 hover:underline">+62 821-7333-6973</a>
              </div>
            </div>
            
            <div class="bg-gray-50 rounded-lg p-5 border border-gray-200 flex items-start space-x-4">
              <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Email</h3>
                <a href="mailto:admin@deepeazy.com" class="text-blue-600 hover:underline">admin@deepeazy.com</a>
              </div>
            </div>
          </div>

          <div class="bg-blue-50 rounded-xl p-6 border border-blue-100">
            <h3 class="font-semibold text-blue-900 mb-3">Format Pesan:</h3>
            <ul class="list-disc list-inside space-y-2 text-blue-800">
              <li><strong>Nama Lengkap:</strong> [Sesuai dengan yang terdaftar]</li>
              <li><strong>Nomor HP Terdaftar:</strong> [Nomor HP akun Anda]</li>
              <li><strong>Alasan Penghapusan:</strong> [Sebutkan alasan Anda]</li>
            </ul>
          </div>
        </section>

        <!-- Retensi Data -->
        <section>
          <h2 class="text-2xl font-bold text-gray-900 mb-4 border-b-2 border-gray-100 pb-2">Kebijakan Retensi Data</h2>
          <div class="bg-gray-50 rounded-xl p-6 border border-gray-200 text-sm leading-relaxed text-gray-600">
            <p>
              Meskipun akun Anda telah berhasil dihapus, perlu diketahui bahwa data riwayat transaksi keuangan Anda akan tetap kami simpan dengan aman selama periode tertentu (umumnya hingga <strong>5 tahun</strong>). 
            </p>
            <p class="mt-3">
              Penyimpanan data ini diwajibkan semata-mata untuk keperluan <strong>audit, pencatatan keuangan internal, dan kepatuhan terhadap hukum</strong> yang berlaku di Indonesia. Data tersebut tidak akan digunakan untuk keperluan pemasaran atau dibagikan kepada pihak ketiga di luar ketentuan hukum.
            </p>
          </div>
        </section>
      </div>
      
      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-6 border-t border-gray-200 text-center text-sm text-gray-500">
        &copy; {{ new Date().getFullYear() }} Outlet Pulsa. All rights reserved.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Komponen statis untuk Kebijakan Penghapusan Akun
// Silakan sesuaikan placeholder [NOMOR_WA] dan [EMAIL_CS] dengan data yang sebenarnya.
</script>
