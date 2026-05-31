import { PrismaClient } from '@prisma/client';

export default async function menuSeed(prisma: PrismaClient) {
  const menusData = [
    {
      name: 'Dashboard',
      icon: 'IconDashboard',
      path: 'dashboard',
      tab: null,
    },
    {
      name: 'Transaksi',
      path: '#',
      icon: 'IconReceipt',
      tab: null,
    },
    {
      name: 'Membership',
      path: '#',
      icon: 'IconUsers',
      tab: null,
    },
    {
      name: 'Produk',
      path: '#',
      icon: 'IconBox',
      tab: null,
    },
    {
      name: 'Pengaturan',
      path: '#',
      icon: 'IconSettings',
      tab: null,
    },
  ];

  for (const menu of menusData) {
    const existing = await prisma.menu.findFirst({
      where: { name: menu.name },
    });

    if (!existing) {
      await prisma.menu.create({
        data: {
          ...menu,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.menu.update({
        where: { id: existing.id },
        data: {
          ...menu,
          updated_at: new Date(),
        },
      });
    }
  }
}
