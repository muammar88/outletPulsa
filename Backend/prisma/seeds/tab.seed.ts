import { PrismaClient } from '@prisma/client';

export default async function tabSeed(prisma: PrismaClient) {
  const tabsData = [
    { name: 'Ringkasan', icon: 'IconChartPie', path: 'ringkasan', desc: 'Melihat ringkasan keseluruhan performa sistem, mulai dari statistik transaksi, grafik aktivitas, serta rangkuman laporan utama.' },
    { name: 'Transaksi Pulsa', icon: 'IconHistory', path: 'transaksi_pulsa', desc: 'Melihat dan memantau riwayat seluruh transaksi pulsa yang dilakukan oleh para member dalam sistem.' },
    { name: 'Daftar Member', icon: 'IconUser', path: 'daftar_member', desc: 'Mengelola daftar membership aplikasi, melihat informasi profil member, status akun, dan mengelola saldo pengguna.' },
    { name: 'Produk Prabayar', icon: 'IconListCheck', path: 'produk_prabayar', desc: 'Mengelola daftar seluruh produk prabayar di aplikasi, menentukan harga jual, serta mengatur ketersediaan layanan.' },
    { name: 'Pengaturan Umum', icon: 'IconSettings', path: 'pengaturan_umum', desc: 'Mengelola pengaturan aplikasi secara keseluruhan seperti informasi kontak, preferensi sistem, dan konfigurasi dasar.' },
    { name: 'Daftar Server', icon: 'IconServer', path: 'daftar_server', desc: 'Melihat daftar server pulsa, mengatur koneksi ke berbagai provider H2H, dan memastikan ketersediaan jalur server.' },
    { name: 'Daftar Agen', icon: 'IconUsers', path: 'daftar_agen', desc: 'Mengelola daftar agen pulsa beserta jaringannya, mengawasi aktivitas transaksi agen, serta mengelola komisi.' },
    { name: 'Kategori', icon: 'IconCategory', path: 'kategori', desc: 'Mengelola daftar kategori produk untuk memudahkan pengelompokan layanan dan navigasi menu bagi pengguna.' },
    { name: 'Operator', icon: 'IconAntenna', path: 'operator', desc: 'Mengelola daftar operator seluler yang tersedia untuk transaksi pulsa, paket data, dan layanan lainnya.' },
    { name: 'Deposit', icon: 'IconWallet', path: 'deposit', desc: 'Memantau riwayat dan status deposit saldo oleh para member secara real-time dan melakukan persetujuan tiket deposit.' },
    { name: 'Log System', icon: 'IconWallet', path: 'log', desc: 'Melihat log sistem yang merekam seluruh aktivitas, perubahan data penting, dan pelacakan error yang terjadi di dalam aplikasi.' },
    { name: 'Daftar Grup', icon: 'IconUsers', path: 'daftar_grup', desc: 'Mengelola daftar grup pengguna, menetapkan hak akses (RBAC), serta membatasi fitur berdasarkan peran masing-masing.' },
    { name: 'Daftar Pengguna', icon: 'IconUser', path: 'daftar_pengguna', desc: 'Mengelola akun-akun admin dan staf, termasuk pengaturan kata sandi dan pembagian akses pengelolaan sistem.' },
    { name: 'Daftar Produk Prabayar Tripay', icon: 'IconListCheck', path: 'daftar_produk_prabayar_tripay', desc: 'Meninjau dan mengelola daftar produk prabayar khusus yang ditarik atau terhubung dari server Tripay.' },
    { name: 'Operator Prabayar Tripay', icon: 'IconListCheck', path: 'daftar_operator_prabayar_tripay', desc: 'Mengelola daftar operator untuk layanan prabayar yang tersedia dari koneksi server penyedia Tripay.' },
    { name: 'Kategori Prabayar Tripay', icon: 'IconListCheck', path: 'daftar_kategori_prabayar_tripay', desc: 'Mengelola dan menyesuaikan pengelompokan kategori prabayar berdasarkan data dari server Tripay.' },
    { name: 'Daftar Produk Prabayar IAK', icon: 'IconUser', path: 'daftar_produk_prabayar_iak', desc: 'Meninjau dan mengelola daftar produk prabayar khusus yang ditarik atau terhubung dari server IAK (Mobilepulsa).' },
    { name: 'Daftar Operator IAK', icon: 'IconListCheck', path: 'daftar_operator_iak', desc: 'Mengelola daftar operator untuk layanan yang tersedia dari koneksi server penyedia IAK (Mobilepulsa).' },
    { name: 'Daftar Type IAK', icon: 'IconListCheck', path: 'daftar_type_iak', desc: 'Mengelola klasifikasi tipe produk prabayar berdasarkan data dan referensi dari server IAK (Mobilepulsa).' },
    { name: 'Produk Pascabayar', icon: 'IconListCheck', path: 'produk_pascabayar', desc: 'Mengelola daftar seluruh produk pascabayar (PPOB) di aplikasi, memantau rincian layanan, dan markup harga.' },
    { name: 'Daftar Produk Pascabayar Tripay', icon: 'IconListCheck', path: 'daftar_produk_pascabayar_tripay', desc: 'Meninjau dan mengelola daftar produk pascabayar khusus yang terhubung dari penyedia Tripay.' },
    { name: 'Daftar Produk Pascabayar IAK', icon: 'IconListCheck', path: 'daftar_produk_pascabayar_iak', desc: 'Meninjau dan mengelola daftar produk pascabayar khusus yang terhubung dari penyedia IAK (Mobilepulsa).' },
    { name: 'Kategori Pascabayar Tripay', icon: 'IconListCheck', path: 'daftar_kategori_pascabayar_tripay', desc: 'Mengelola pengelompokan kategori produk pascabayar (PPOB) berdasarkan data yang diambil dari Tripay.' },
    { name: 'Operator Pascabayar Tripay', icon: 'IconListCheck', path: 'daftar_operator_pascabayar_tripay', desc: 'Mengelola daftar biller/operator pascabayar (PPOB) khusus untuk transaksi lewat server penyedia Tripay.' },
    { name: 'Daftar Produk Digiflazz', icon: 'IconListCheck', path: 'daftar_produk_digiflazz', desc: 'Meninjau dan mengelola daftar produk PPOB maupun pulsa yang terhubung langsung dengan server Digiflazz.' },
    { name: 'Daftar Produk Seller Digiflazz', icon: 'IconListCheck', path: 'daftar_produk_seller_digiflazz', desc: 'Mengelola daftar produk spesifik dari para seller yang menyediakan layanan via ekosistem Digiflazz.' },
    { name: 'Daftar Produk Pascabayar Seller Digiflazz', icon: 'IconListCheck', path: 'daftar_produk_pascabayar_seller_digiflazz', desc: 'Mengelola katalog seller dan koneksi produk pascabayar Digiflazz.' },
    { name: 'Daftar Seller Digiflazz', icon: 'IconUsers', path: 'daftar_seller_digiflazz', desc: 'Mengelola referensi daftar seller yang berperan sebagai penyedia produk dalam jaringan distribusi Digiflazz.' },
    { name: 'Riwayat Transfer Saldo', icon: 'IconUsers', path: 'riwayat_transfer_saldo', desc: 'Melacak seluruh aktivitas transfer saldo antar member, memeriksa bukti transaksi, serta mendeteksi transfer yang tidak wajar.' },
    { name: 'Laba Diambil', icon: 'IconWallet', path: 'laba_diambil', desc: 'Melihat ringkasan laba yang sudah ditarik atau diproses, memantau sisa laba bersih dari setiap transaksi pengguna.' },
    { name: 'Daftar Device', icon: 'IconDeviceMobile', path: 'daftar_device', desc: 'Mengelola daftar perangkat atau device (WhatsApp/Telegram bot) yang diizinkan untuk terhubung ke dalam sistem aplikasi.' },
    { name: 'Pengumuman', icon: 'IconNotifications', path: 'pengumuman', desc: 'Membuat dan menyiarkan pengumuman atau broadcast notifikasi ke pengguna mengenai gangguan, promo, atau info penting lainnya.' },
    { name: 'Laporan Umum', icon: 'IconChartPie', path: 'laporan_umum', desc: 'Menghasilkan dan melihat rekapitulasi data operasional aplikasi secara umum untuk kebutuhan analisa dan laporan akhir.' },
    { name: 'Laporan Pendaftaran', icon: 'IconUsers', path: 'laporan_pendaftaran', desc: 'Memantau metrik pendaftaran akun pengguna baru dan pertumbuhan agen dalam periode waktu tertentu.' },
    { name: 'Pesan Whatsapp', icon: 'IconDeviceMessage', path: 'pesan_whatsapp', desc: 'Melihat dan memantau antrian pesan masuk maupun keluar yang diproses melalui gateway WhatsApp aplikasi.' },
    { name: 'Pengaturan Whatsapp', icon: 'IconDeviceMessage', path: 'pengaturan_whatsapp', desc: 'Melakukan pemindaian kode QR (pairing), menghubungkan device, dan mengonfigurasi layanan WhatsApp Gateway.' },
    // Bank Tabs
    { name: 'Daftar Bank Transfer', icon: 'IconBuildingBank', path: 'daftar_bank_transfer', desc: 'Mengelola data rekening bank tujuan yang bisa digunakan oleh para member saat melakukan permintaan deposit transfer.' },
    { name: 'Daftar Bank', icon: 'IconBuildingBank', path: 'daftar_bank', desc: 'Mengelola referensi daftar nama dan kode bank nasional maupun internasional yang mendukung layanan mutasi sistem.' },
    { name: 'Registration', icon: 'IconUserPlus', path: 'registration', desc: 'Mengatur alur proses registrasi anggota baru, menentukan persyaratan, dan verifikasi kelengkapan profil pendaftar.' },
    { name: 'Transaksi LinkQu', icon: 'IconTransfer', path: 'transaksi_linkqu', desc: 'Melihat dan menelusuri semua mutasi riwayat transaksi transfer dana atau disbursement lewat payment gateway LinkQu.' },
    { name: 'Bank LinkQu', icon: 'IconBuildingBank', path: 'bank_linkqu', desc: 'Mengelola daftar sandi bank dan institusi yang didukung oleh layanan pembayaran LinkQu untuk keperluan disbursement.' },
    { name: 'E-Money LinkQu', icon: 'IconWallet', path: 'emoney_linkqu', desc: 'Mengelola daftar dompet elektronik (E-Wallet/E-Money) yang didukung untuk transaksi melalui provider LinkQu.' },
    { name: 'Pengaturan LinkQu', icon: 'IconSettings', path: 'pengaturan_linkqu', desc: 'Melakukan pengaturan kredensial API, webhook, dan preferensi koneksi lainnya untuk integrasi dengan sistem LinkQu.' },
  ];

  for (const tab of tabsData) {
    const existing = await prisma.tabMenu.findFirst({
      where: { path: tab.path },
    });

    if (!existing) {
      await prisma.tabMenu.create({
        data: {
          ...tab,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.tabMenu.update({
        where: { id: existing.id },
        data: {
          ...tab,
          updated_at: new Date(),
        },
      });
    }
  }

  // Pruning logic: Delete any tab not found in the current seed data
  const validPaths = tabsData.map(t => t.path).filter(Boolean) as string[];
  
  const deletedTabs = await prisma.tabMenu.deleteMany({
    where: { path: { notIn: validPaths } },
  });
  if (deletedTabs.count > 0) {
    console.log(`  🗑️  Pruned ${deletedTabs.count} obsolete tabs.`);
  }

  console.log('  ✅ Tabs seeded');
}
