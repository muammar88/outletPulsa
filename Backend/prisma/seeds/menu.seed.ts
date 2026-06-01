import { PrismaClient } from '@prisma/client';

export default async function menuSeed(prisma: PrismaClient) {
// Ambil semua tab dari TabAdmin
  const tabs = await prisma.tabMenu.findMany({
    select: { id: true },
  });

  console.log("CCCCCCCCCCCCCCCCc");
  console.log(tabs);
  console.log("CCCCCCCCCCCCCCCCc");

  if (tabs.length === 0) return;

  const menusData = [
    { name: 'Dashboard', icon: 'IconDashboard', path: 'dashboard', tab: JSON.stringify([{ id: tabs[0].id } ]) },
    { name: 'Transaksi', path: '#', icon: 'IconReceipt', tab: null },
    { name: 'Membership', path: '#', icon: 'IconUsers', tab: null },
    { name: 'Produk', path: '#', icon: 'IconBox', tab: null },
    { name: 'Master Data', path: '#', icon: 'IconDatabase', tab: null },
    { name: 'Pengaturan', path: '#', icon: 'IconSettings', tab: null },
  ];

  for (const menu of menusData) {
    const existing = await prisma.menu.findFirst({ where: { name: menu.name } });
    if (!existing) {
      console.log("AAAAAAAAAAAAA");
      await prisma.menu.create({ data: { ...menu, created_at: new Date(), updated_at: new Date() } });
    } else {
      console.log("BBBBBBBBBBBBB");
      await prisma.menu.update({ where: { id: existing.id }, data: { ...menu, updated_at: new Date() } });
    }
  }
}
