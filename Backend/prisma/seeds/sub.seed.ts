import { PrismaClient } from '@prisma/client';

export default async function subSeed(prisma: PrismaClient) {
  const menus = await prisma.menu.findMany();
  const getMenuId = (name: string) => menus.find(m => m.name === name)?.id;

  if (menus.length === 0) return;

  // Ambil semua tab dari TabAdmin
  const tabs = await prisma.tabMenu.findMany({
    select: { id: true },
  });

  // console.log("CCCCCCCCCCCCCCCCc");
  // console.log(tabs);
  // console.log("CCCCCCCCCCCCCCCCc");

  if (tabs.length === 0) return;

  const subMenusData = [
    { menu_name: 'Transaksi', name: 'Transaksi Pulsa', icon: 'IconDeviceMobile', path: 'transaksi_pulsa', tab: JSON.stringify([{ id: tabs[1].id } ]) },
    { menu_name: 'Membership', name: 'Membership', icon: 'IconUsers', path: 'membership', tab: JSON.stringify([{ id: tabs[2].id } ]) },
    { menu_name: 'Produk', name: 'Daftar Produk', icon: 'IconBox', path: 'daftar_produk', tab: JSON.stringify([{ id: tabs[3].id } ]) },
    { menu_name: 'Pengaturan', name: 'Pengaturan', icon: 'IconSettings', path: 'pengaturan', tab: JSON.stringify([{ id: tabs[4].id } ]) },
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
