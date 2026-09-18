import { PrismaClient } from '@prisma/client';

export default async function subSeed(prisma: PrismaClient) {
  const menus = await prisma.menu.findMany();
  const getMenuId = (name: string) => menus.find(m => m.name === name)?.id;

  if (menus.length === 0) return;

  // Ambil semua tab dari TabMenu
  const tabs = await prisma.tabMenu.findMany({
    select: { id: true, path: true },
  });

  const getTabId = (path: string) => tabs.find(t => t.path === path)?.id;

  if (tabs.length === 0) return;

  const subMenusData = [
    { menu_name: 'Transaksi', name: 'Transaksi Pulsa', icon: 'IconDeviceMobile', path: 'transaksi_pulsa', tab: JSON.stringify([getTabId('transaksi_pulsa')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Transaksi', name: 'Transaksi Deposit', icon: 'IconWallet', path: 'transaksi_deposit', tab: JSON.stringify([getTabId('deposit')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Transaksi', name: 'Transfer Saldo', icon: 'IconWallet', path: 'transfer_saldo', tab: JSON.stringify([getTabId('riwayat_transfer_saldo')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Membership', name: 'Membership', icon: 'IconUsers', path: 'membership', tab: JSON.stringify([getTabId('daftar_member'), getTabId('daftar_agen')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Membership', name: 'Notifikasi', icon: 'IconNotifications', path: 'notifikasi', tab: JSON.stringify([getTabId('pengumuman')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Membership', name: 'Registration', icon: 'IconUserPlus', path: 'registration', tab: JSON.stringify([getTabId('registration')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Produk', name: 'Daftar Produk', icon: 'IconBox', path: 'daftar_produk', tab: JSON.stringify([getTabId('produk_prabayar'), getTabId('produk_pascabayar')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Produk', name: 'Daftar Produk Tripay', icon: 'IconBox', path: 'daftar_produk_tripay', tab: JSON.stringify([getTabId('daftar_produk_prabayar_tripay'), getTabId('daftar_produk_pascabayar_tripay'), getTabId('daftar_operator_prabayar_tripay'), getTabId('daftar_kategori_prabayar_tripay'), getTabId('daftar_operator_pascabayar_tripay'), getTabId('daftar_kategori_pascabayar_tripay')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Produk', name: 'Daftar Produk IAK', icon: 'IconBox', path: 'daftar_produk_iak', tab: JSON.stringify([getTabId('daftar_produk_prabayar_iak'), getTabId('daftar_produk_pascabayar_iak'), getTabId('daftar_operator_iak'), getTabId('daftar_type_iak')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Produk', name: 'Daftar Produk DigiFlazz', icon: 'IconBox', path: 'daftar_produk_digiflazz', tab: JSON.stringify([getTabId('daftar_produk_digiflazz'), getTabId('daftar_produk_seller_digiflazz'), getTabId('daftar_seller_digiflazz')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Produk', name: 'Daftar Server', icon: 'IconServer', path: 'daftar_server', tab: JSON.stringify([getTabId('daftar_server')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Master Data', name: 'Kategori', icon: 'IconCategory', path: 'kategori', tab: JSON.stringify([getTabId('kategori')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Master Data', name: 'Operator', icon: 'IconAntenna', path: 'operator', tab: JSON.stringify([getTabId('operator')].filter(Boolean).map(id => ({ id }))) },
    
    // Bank Menus (from bank_menu.seed.ts)
    { menu_name: 'Master Data', name: 'Bank', icon: 'IconBuildingBank', path: 'bank', tab: JSON.stringify([getTabId('daftar_bank_transfer'), getTabId('daftar_bank')].filter(Boolean).map(id => ({ id }))) },

    { menu_name: 'Keuangan', name: 'Keuangan', path: 'keuangan', icon: 'IconWallet', tab: JSON.stringify([getTabId('laba_diambil')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Keuangan', name: 'Laporan', path: 'laporan', icon: 'IconReport', tab: JSON.stringify([getTabId('laporan_umum'), getTabId('laporan_pendaftaran')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Pengaturan', name: 'Pengaturan Umum', icon: 'IconSettings', path: 'pengaturan', tab: JSON.stringify([getTabId('pengaturan_umum'), getTabId('daftar_device')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Pengaturan', name: 'Whatsapp', icon: 'IconDeviceMessage', path: 'whatsapp', tab: JSON.stringify([getTabId('pesan_whatsapp'), getTabId('pengaturan_whatsapp')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Pengaturan', name: 'Daftar Grup', icon: 'IconUsersGroup', path: 'daftar_grup', tab: JSON.stringify([getTabId('daftar_grup')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Pengaturan', name: 'Daftar Pengguna', icon: 'IconUserShield', path: 'daftar_pengguna', tab: JSON.stringify([getTabId('daftar_pengguna')].filter(Boolean).map(id => ({ id }))) },
    { menu_name: 'Pengaturan', name: 'Log', icon: 'IconHistory', path: 'log', tab: JSON.stringify([getTabId('log')].filter(Boolean).map(id => ({ id }))) },
  ];

  for (const sub of subMenusData) {
    const menu_id = getMenuId(sub.menu_name);
    if (!menu_id) continue;

    const { menu_name, ...subData } = sub;
    const existing = await prisma.subMenu.findFirst({ where: { name: sub.name, menu_id: menu_id } });

    if (!existing) {
      await prisma.subMenu.create({ data: { ...subData, menu_id, created_at: new Date(), updated_at: new Date() } });
    } else {
      await prisma.subMenu.update({ where: { id: existing.id }, data: { ...subData, menu_id, updated_at: new Date() } });
    }
  }

  // Pruning logic: Delete any submenu not found in the current seed data
  const validNames = subMenusData.map(s => s.name).filter(Boolean) as string[];
  const deletedSubMenus = await prisma.subMenu.deleteMany({
    where: { name: { notIn: validNames } },
  });
  
  if (deletedSubMenus.count > 0) {
    console.log(`  🗑️  Pruned ${deletedSubMenus.count} obsolete submenus.`);
  }

  console.log('  ✅ SubMenus seeded');
}
