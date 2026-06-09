import { PrismaClient } from '@prisma/client';

export default async function subSeed(prisma: PrismaClient) {
  const menus = await prisma.menu.findMany();
  const getMenuId = (name: string) => menus.find(m => m.name === name)?.id;

  if (menus.length === 0) return;

  // Ambil semua tab dari TabAdmin
  const tabs = await prisma.tabMenu.findMany({
    select: { id: true },
  });

  if (tabs.length === 0) return;

  const subMenusData = [
    { menu_name: 'Transaksi', name: 'Transaksi Pulsa', icon: 'IconDeviceMobile', path: 'transaksi_pulsa', tab: JSON.stringify([{ id: tabs[1].id } ]) },
    { menu_name: 'Transaksi', name: 'Transaksi Deposit', icon: 'IconWallet', path: 'transaksi_deposit', tab: JSON.stringify([{ id: tabs[9].id } ]) },
    { menu_name: 'Membership', name: 'Membership', icon: 'IconUsers', path: 'membership', tab: JSON.stringify([{ id: tabs[2].id }, { id: tabs[6].id } ]) },
    { menu_name: 'Produk', name: 'Daftar Produk', icon: 'IconBox', path: 'daftar_produk', tab: JSON.stringify([{ id: tabs[3].id }, { id: tabs[19].id } ]) },
    { menu_name: 'Produk', name: 'Daftar Produk Tripay', icon: 'IconBox', path: 'daftar_produk_tripay', tab: JSON.stringify([{ id: tabs[13].id },{ id: tabs[20].id },{ id: tabs[14].id },{ id: tabs[15].id },{ id: tabs[23].id },{ id: tabs[22].id } ]) },
    { menu_name: 'Produk', name: 'Daftar Produk IAK', icon: 'IconBox', path: 'daftar_produk_iak', tab: JSON.stringify([{ id: tabs[16].id },{ id: tabs[21].id },{ id: tabs[17].id },{ id: tabs[18].id } ]) },
    { menu_name: 'Produk', name: 'Daftar Produk DigiFlazz', icon: 'IconBox', path: 'daftar_produk_digiflazz', tab: JSON.stringify([{ id: tabs[24].id },{ id: tabs[25].id },{ id: tabs[26].id } ]) },
    { menu_name: 'Produk', name: 'Daftar Server', icon: 'IconServer', path: 'daftar_server', tab: JSON.stringify([{ id: tabs[5].id } ]) },
    { menu_name: 'Master Data', name: 'Kategori', icon: 'IconCategory', path: 'kategori', tab: JSON.stringify([{ id: tabs[7].id } ]) },
    { menu_name: 'Master Data', name: 'Operator', icon: 'IconAntenna', path: 'operator', tab: JSON.stringify([{ id: tabs[8].id } ]) },
    { menu_name: 'Pengaturan', name: 'Pengaturan Umum', icon: 'IconSettings', path: 'pengaturan', tab: JSON.stringify([{ id: tabs[4].id } ]) },
    { menu_name: 'Pengaturan', name: 'Daftar Grup', icon: 'IconUsersGroup', path: 'daftar_grup', tab: JSON.stringify([{ id: tabs[11].id } ]) },
    { menu_name: 'Pengaturan', name: 'Daftar Pengguna', icon: 'IconUserShield', path: 'daftar_pengguna', tab: JSON.stringify([{ id: tabs[12].id } ]) },
    { menu_name: 'Pengaturan', name: 'Log', icon: 'IconHistory', path: 'log', tab: JSON.stringify([{ id: tabs[10].id } ]) },
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
}
