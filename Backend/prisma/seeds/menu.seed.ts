import { PrismaClient } from '@prisma/client';

export default async function menuSeed(prisma: PrismaClient) {
  // Ambil semua tab dari TabMenu
  const tabs = await prisma.tabMenu.findMany({
    select: { id: true, path: true },
  });

  if (tabs.length === 0) return;

  const getTabId = (tabPath: string) => tabs.find(t => t.path === tabPath)?.id;

  const menusData = [
    { name: 'Dashboard', icon: 'IconDashboard', path: 'dashboard', tab: JSON.stringify([getTabId('ringkasan')].filter(Boolean).map(id => ({ id }))) },
    { name: 'Transaksi', path: '#', icon: 'IconReceipt', tab: null },
    { name: 'Membership', path: '#', icon: 'IconUsers', tab: null },
    { name: 'Produk', path: '#', icon: 'IconBox', tab: null },
    { name: 'Master Data', path: '#', icon: 'IconDatabase', tab: null },
    { name: 'Keuangan', path: '#', icon: 'IconWallet', tab: null },
    { name: 'Pengaturan', path: '#', icon: 'IconSettings', tab: null },
  ];

  for (const menu of menusData) {
    const existing = await prisma.menu.findFirst({ where: { name: menu.name } });
    if (!existing) {
      await prisma.menu.create({ data: { ...menu, created_at: new Date(), updated_at: new Date() } });
    } else {
      await prisma.menu.update({ where: { id: existing.id }, data: { ...menu, updated_at: new Date() } });
    }
  }

  // Pruning logic: Delete any menu not found in the current seed data
  const validNames = menusData.map(m => m.name).filter(Boolean) as string[];
  
  const obsoleteMenus = await prisma.menu.findMany({
    where: { name: { notIn: validNames } },
    select: { id: true }
  });
  const obsoleteMenuIds = obsoleteMenus.map(m => m.id);
  
  if (obsoleteMenuIds.length > 0) {
    // Delete submenus referencing obsolete menus to prevent foreign key violation
    await prisma.subMenu.deleteMany({
      where: { menu_id: { in: obsoleteMenuIds } }
    });
  }

  const deletedMenus = await prisma.menu.deleteMany({
    where: { name: { notIn: validNames } },
  });
  if (deletedMenus.count > 0) {
    console.log(`  🗑️  Pruned ${deletedMenus.count} obsolete menus.`);
  }

  console.log('  ✅ Menus seeded');
}
