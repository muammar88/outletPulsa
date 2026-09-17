import { PrismaClient } from '@prisma/client';

export default async function tabSeed(prisma: PrismaClient) {
  const tabsData = [
    { name: 'Ringkasan', icon: 'IconChartPie', path: 'ringkasan', desc: 'Ringkasan keseluruhan' },
    { name: 'Transaksi Pulsa', icon: 'IconHistory', path: 'transaksi_pulsa', desc: 'Transaksi Pulsa member' },
    { name: 'Daftar Member', icon: 'IconUser', path: 'daftar_member', desc: 'Daftar membership aplikasi' },
    { name: 'Produk Prabayar', icon: 'IconListCheck', path: 'produk_prabayar', desc: 'Daftar produk prabayar aplikasi ' },
    { name: 'Pengaturan Umum', icon: 'IconSettings', path: 'pengaturan_umum', desc: 'Daftar pengaturan aplikasi' },
    { name: 'Daftar Server', icon: 'IconServer', path: 'daftar_server', desc: 'Daftar server pulsa' },
    { name: 'Daftar Agen', icon: 'IconUsers', path: 'daftar_agen', desc: 'Daftar agen pulsa' },
    { name: 'Kategori', icon: 'IconCategory', path: 'kategori', desc: 'Daftar kategori' },
    { name: 'Operator', icon: 'IconAntenna', path: 'operator', desc: 'Daftar operator' },
    { name: 'Deposit', icon: 'IconWallet', path: 'deposit', desc: 'Riwayat deposit member' },
    { name: 'Log System', icon: 'IconWallet', path: 'log', desc: 'Log System' },
    { name: 'Daftar Grup', icon: 'IconUsers', path: 'daftar_grup', desc: 'Daftar Grup' },
    { name: 'Daftar Pengguna', icon: 'IconUser', path: 'daftar_pengguna', desc: 'Daftar Pengguna' },
    { name: 'Daftar Produk Prabayar Tripay', icon: 'IconListCheck', path: 'daftar_produk_prabayar_tripay', desc: 'Daftar Produk Prabayar Tripay' },
    { name: 'Operator Prabayar Tripay', icon: 'IconListCheck', path: 'daftar_operator_prabayar_tripay', desc: 'Daftar Operator Prabayar Tripay' },
    { name: 'Kategori Prabayar Tripay', icon: 'IconListCheck', path: 'daftar_kategori_prabayar_tripay', desc: 'Daftar Kategori Prabayar Tripay' },
    { name: 'Daftar Produk Prabayar IAK', icon: 'IconUser', path: 'daftar_produk_prabayar_iak', desc: 'Daftar Produk Prabayar IAK' },
    { name: 'Daftar Operator IAK', icon: 'IconListCheck', path: 'daftar_operator_iak', desc: 'Daftar Operator IAK' },
    { name: 'Daftar Type IAK', icon: 'IconListCheck', path: 'daftar_type_iak', desc: 'Daftar Type IAK' },
    { name: 'Produk Pascabayar', icon: 'IconListCheck', path: 'produk_pascabayar', desc: 'Daftar produk pascabayar aplikasi ' },
    { name: 'Daftar Produk Pascabayar Tripay', icon: 'IconListCheck', path: 'daftar_produk_pascabayar_tripay', desc: 'Daftar Produk Pascabayar Tripay' },
    { name: 'Daftar Produk Pascabayar IAK', icon: 'IconListCheck', path: 'daftar_produk_pascabayar_iak', desc: 'Daftar Produk Pascabayar IAK' },
    { name: 'Kategori Pascabayar Tripay', icon: 'IconListCheck', path: 'daftar_kategori_pascabayar_tripay', desc: 'Daftar Kategori Pascabayar Tripay' },
    { name: 'Operator Pascabayar Tripay', icon: 'IconListCheck', path: 'daftar_operator_pascabayar_tripay', desc: 'Daftar Operator Pascabayar Tripay' },
    { name: 'Daftar Produk Digiflazz', icon: 'IconListCheck', path: 'daftar_produk_digiflazz', desc: 'Daftar Produk Digiflazz' },
    { name: 'Daftar Produk Seller Digiflazz', icon: 'IconListCheck', path: 'daftar_produk_seller_digiflazz', desc: 'Daftar Produk Seller Digiflazz' },
    { name: 'Daftar Seller Digiflazz', icon: 'IconUsers', path: 'daftar_seller_digiflazz', desc: 'Daftar Seller Digiflazz' },
    { name: 'Riwayat Transfer Saldo', icon: 'IconUsers', path: 'riwayat_transfer_saldo', desc: 'Riwayat Transfer Saldo' },
    { name: 'Laba Diambil', icon: 'IconWallet', path: 'laba_diambil', desc: 'Data Laba Diambil' },
    { name: 'Daftar Device', icon: 'IconDeviceMobile', path: 'daftar_device', desc: 'Daftar Device' },
    { name: 'Pengumuman', icon: 'IconNotifications', path: 'pengumuman', desc: 'Pengumuman' },
    { name: 'Laporan Umum', icon: 'IconChartPie', path: 'laporan_umum', desc: 'Laporan Umum' },
    { name: 'Laporan Pendaftaran', icon: 'IconUsers', path: 'laporan_pendaftaran', desc: 'Laporan Pendaftaran' },
    { name: 'Pesan Whatsapp', icon: 'IconDeviceMessage', path: 'pesan_whatsapp', desc: 'Pesan Whatsapp' },
    { name: 'Pengaturan Whatsapp', icon: 'IconDeviceMessage', path: 'pengaturan_whatsapp', desc: 'Pengaturan Whatsapp' },
    // Bank Tabs
    { name: 'Daftar Bank Transfer', icon: 'IconBuildingBank', path: 'daftar_bank_transfer', desc: 'Daftar Bank Transfer' },
    { name: 'Daftar Bank', icon: 'IconBuildingBank', path: 'daftar_bank', desc: 'Daftar Bank' },
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
