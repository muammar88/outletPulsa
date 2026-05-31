import { PrismaClient } from '@prisma/client';

export default async function subSeed(prisma: PrismaClient) {
  const tabs = await prisma.tab.findMany({
    select: { id: true },
  });

  if (tabs.length === 0) return;

  // Map menu names to IDs for safer reference
  const menus = await prisma.menu.findMany();
  const getMenuId = (name: string) => menus.find(m => m.name === name)?.id;

  const subMenusData = [
    {
      menu_name: 'Absensi',
      name: 'Absensi Pegawai',
      icon: 'user-heart',
      path: 'absensi_pegawai',
      // tab: JSON.stringify([
      //   { id: tabs[1].id },
      //   { id: tabs[9].id },
      //   { id: tabs[10].id },
      //   { id: tabs[36].id },
      //   { id: tabs[11].id },
      // ]),
      tab: null
    },
    {
      menu_name: 'Absensi',
      name: 'Absensi Siswa',
      icon: 'hourglass',
      path: 'absensi_siswa',
      tab: null
    },
    {
      menu_name: 'Pegawai',
      name: 'Daftar Pegawai',
      icon: 'address-book',
      path: 'daftar_pegawai',
      tab: null
    },
    {
      menu_name: 'Siswa',
      name: 'Daftar Siswa',
      icon: 'id',
      path: 'daftar_siswa',
      tab: null
    },
  ];

  for (const sub of subMenusData) {
    const menu_id = getMenuId(sub.menu_name);
    if (!menu_id) continue;

    const { menu_name, ...subData } = sub;

    const existing = await prisma.submenu.findFirst({
      where: { name: sub.name, menu_id: menu_id },
    });

    if (!existing) {
      await prisma.submenu.create({
        data: {
          ...subData,
          menu_id: menu_id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
    } else {
      await prisma.submenu.update({
        where: { id: existing.id },
        data: {
          ...subData,
          menu_id: menu_id,
          updated_at: new Date(),
        },
      });
    }
  }
}
