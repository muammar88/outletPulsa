import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Start Deploying Daftar Device Tab ---');

  // 1. Cek apakah tab Daftar Device sudah ada
  let tabDevice = await prisma.tabMenu.findFirst({
    where: { path: 'daftar_device' }
  });

  if (!tabDevice) {
    console.log('Tab Daftar Device belum ada, melakukan insert...');
    tabDevice = await prisma.tabMenu.create({
      data: {
        name: 'Daftar Device',
        icon: 'IconDeviceMobile',
        path: 'daftar_device',
        desc: 'Mengelola daftar perangkat atau device (WhatsApp/Telegram bot) yang diizinkan untuk terhubung ke dalam sistem aplikasi.',
        created_at: new Date(),
        updated_at: new Date(),
      }
    });
    console.log('Tab Daftar Device berhasil ditambahkan dengan ID:', tabDevice.id);
  } else {
    console.log('Tab Daftar Device sudah ada dengan ID:', tabDevice.id);
    // Lakukan update jika diperlukan (misal icon berubah)
    await prisma.tabMenu.update({
      where: { id: tabDevice.id },
      data: {
        name: 'Daftar Device',
        icon: 'IconDeviceMobile',
        desc: 'Mengelola daftar perangkat atau device (WhatsApp/Telegram bot) yang diizinkan untuk terhubung ke dalam sistem aplikasi.',
        updated_at: new Date(),
      }
    });
    console.log('Tab Daftar Device diupdate (Idempotent).');
  }

  // 2. Cek submenu 'Pengaturan Umum' di dalam menu 'Pengaturan'
  const pengaturanMenu = await prisma.menu.findFirst({
    where: { name: 'Pengaturan' }
  });

  if (!pengaturanMenu) {
    console.error('Menu Pengaturan tidak ditemukan! Harap pastikan menu Pengaturan sudah ada.');
    return;
  }

  const pengaturanUmumSub = await prisma.subMenu.findFirst({
    where: { menu_id: pengaturanMenu.id, name: 'Pengaturan Umum' }
  });

  if (!pengaturanUmumSub) {
    console.error('SubMenu Pengaturan Umum tidak ditemukan!');
    return;
  }

  // 3. Update field tab pada submenu Pengaturan Umum
  let currentTabs: any[] = [];
  try {
    currentTabs = pengaturanUmumSub.tab ? JSON.parse(pengaturanUmumSub.tab) : [];
  } catch (e) {
    console.error('Gagal memparsing field tab pada Pengaturan Umum', e);
  }

  // Cek apakah id tabDevice sudah ada di dalam currentTabs
  const isTabExists = currentTabs.some(t => t.id === tabDevice!.id);

  if (!isTabExists) {
    console.log('Menambahkan ID Tab Daftar Device ke SubMenu Pengaturan Umum...');
    currentTabs.push({ id: tabDevice.id });
    
    await prisma.subMenu.update({
      where: { id: pengaturanUmumSub.id },
      data: {
        tab: JSON.stringify(currentTabs),
        updated_at: new Date(),
      }
    });
    console.log('SubMenu Pengaturan Umum berhasil diupdate.');
  } else {
    console.log('ID Tab Daftar Device sudah ada di SubMenu Pengaturan Umum. Skip update.');
  }

  console.log('--- Finish Deploying Daftar Device Tab ---');
}

main()
  .catch((e) => {
    console.error('Terjadi error saat deployment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
