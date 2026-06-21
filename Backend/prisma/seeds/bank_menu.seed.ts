import { PrismaClient } from '@prisma/client';

export default async function bankMenuSeed(prisma: PrismaClient) {
  console.log('Menjalankan seeder khusus untuk menu Bank...');

  // 1. Tambahkan/Upsert TabMenu "Daftar Bank Transfer"
  let tabBankTransfer = await prisma.tabMenu.findFirst({
    where: { path: 'daftar_bank_transfer' },
  });

  if (!tabBankTransfer) {
    tabBankTransfer = await prisma.tabMenu.create({
      data: {
        name: 'Daftar Bank Transfer',
        icon: 'IconBuildingBank',
        path: 'daftar_bank_transfer',
        desc: 'Daftar Bank Transfer',
      },
    });
    console.log('Berhasil menambahkan tab: Daftar Bank Transfer');
  } else {
    // Update icon jika tab sudah ada
    tabBankTransfer = await prisma.tabMenu.update({
      where: { id: tabBankTransfer.id },
      data: { icon: 'IconBuildingBank' },
    });
    console.log('Tab Daftar Bank Transfer sudah ada, icon diperbarui.');
  }

  // 2. Tambahkan/Upsert TabMenu "Daftar Bank"
  let tabDaftarBank = await prisma.tabMenu.findFirst({
    where: { path: 'daftar_bank' },
  });

  if (!tabDaftarBank) {
    tabDaftarBank = await prisma.tabMenu.create({
      data: {
        name: 'Daftar Bank',
        icon: 'IconBuildingBank',
        path: 'daftar_bank',
        desc: 'Daftar Bank',
      },
    });
    console.log('Berhasil menambahkan tab: Daftar Bank');
  } else {
    // Update icon jika tab sudah ada
    tabDaftarBank = await prisma.tabMenu.update({
      where: { id: tabDaftarBank.id },
      data: { icon: 'IconBuildingBank' },
    });
    console.log('Tab Daftar Bank sudah ada, icon diperbarui.');
  }

  // 3. Tambahkan SubMenu "Bank" di bawah "Master Data"
  const masterDataMenu = await prisma.menu.findFirst({
    where: { name: 'Master Data' },
  });

  if (!masterDataMenu) {
    console.error('Menu "Master Data" tidak ditemukan! Gagal menambahkan SubMenu Bank.');
    return;
  }

  const tabJson = JSON.stringify([
    { id: tabBankTransfer.id },
    { id: tabDaftarBank.id },
  ]);

  const existingSubMenu = await prisma.subMenu.findFirst({
    where: { path: 'bank', menu_id: masterDataMenu.id },
  });

  if (!existingSubMenu) {
    await prisma.subMenu.create({
      data: {
        menu_id: masterDataMenu.id,
        name: 'Bank',
        icon: 'IconBuildingBank',
        path: 'bank',
        tab: tabJson,
      },
    });
    console.log('Berhasil menambahkan SubMenu Bank di bawah Master Data.');
  } else {
    await prisma.subMenu.update({
      where: { id: existingSubMenu.id },
      data: {
        name: 'Bank',
        icon: 'IconBuildingBank',
        tab: tabJson,
      },
    });
    console.log('SubMenu Bank sudah ada, konfigurasi diperbarui.');
  }

  console.log('Selesai!');
}

// Menjalankan skrip secara mandiri jika dipanggil langsung lewat ts-node
if (require.main === module) {
  const prisma = new PrismaClient();
  bankMenuSeed(prisma)
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
