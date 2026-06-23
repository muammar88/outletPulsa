import { PrismaClient } from '@prisma/client';

export default async function keuanganMenuSeed(prisma: PrismaClient) {
  console.log('Menjalankan seeder khusus untuk menu Keuangan...');

  // 1. Tambah TabMenu "Laba Diambil"
  let tabLabaDiambil = await prisma.tabMenu.findFirst({ where: { name: 'Laba Diambil' } });
  if (!tabLabaDiambil) {
    tabLabaDiambil = await prisma.tabMenu.create({
      data: {
        name: 'Laba Diambil',
        icon: 'IconWallet',
        path: 'laba-diambil',
        desc: 'Data Laba Diambil'
      }
    });
    console.log('Berhasil menambahkan TabMenu Laba Diambil');
  } else {
    console.log('TabMenu Laba Diambil sudah ada');
  }

  // 2. Tambah Menu "Keuangan"
  let menuKeuangan = await prisma.menu.findFirst({ where: { name: 'Keuangan' } });
  if (!menuKeuangan) {
    menuKeuangan = await prisma.menu.create({
      data: {
        name: 'Keuangan',
        path: '#',
        icon: 'IconWallet',
        tab: null
      }
    });
    console.log('Berhasil menambahkan Menu Keuangan');
  } else {
    console.log('Menu Keuangan sudah ada');
  }

  // 3. Tambah SubMenu "Keuangan"
  const existingSubMenuKeuangan = await prisma.subMenu.findFirst({
    where: { menu_id: menuKeuangan.id, name: 'Keuangan' }
  });
  if (!existingSubMenuKeuangan) {
    await prisma.subMenu.create({
      data: {
        menu_id: menuKeuangan.id,
        name: 'Keuangan',
        path: 'keuangan',
        icon: 'IconWallet',
        tab: JSON.stringify([{ id: tabLabaDiambil.id }])
      }
    });
    console.log('Berhasil menambahkan SubMenu Keuangan');
  } else {
    console.log('SubMenu Keuangan sudah ada');
  }

  // 4. Tambah SubMenu "Laporan"
  const existingSubMenuLaporan = await prisma.subMenu.findFirst({
    where: { menu_id: menuKeuangan.id, name: 'Laporan' }
  });
  if (!existingSubMenuLaporan) {
    await prisma.subMenu.create({
      data: {
        menu_id: menuKeuangan.id,
        name: 'Laporan',
        path: 'laporan',
        icon: 'IconReport',
        tab: null
      }
    });
    console.log('Berhasil menambahkan SubMenu Laporan');
  } else {
    console.log('SubMenu Laporan sudah ada');
  }

  console.log('Selesai!');
}

// Menjalankan skrip secara mandiri jika dipanggil langsung lewat ts-node
if (require.main === module) {
  const prisma = new PrismaClient();
  keuanganMenuSeed(prisma)
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
