import { PrismaClient } from '@prisma/client';

export default async function tabSeed(prisma: PrismaClient) {
  await prisma.tabMenu.createMany({
    data: [
      {
        name: 'Ringkasan', 
        icon: 'chart-pie', 
        path: 'ringkasan', 
        desc: 'Ringkasan keseluruhan',
        created_at: new Date(),
        updated_at: new Date(),
      },
      { 
        name: 'Transaksi Pulsa', 
        icon: 'history', 
        path: 'transaksi_pulsa', 
        desc: 'Transaksi Pulsa member',  
        created_at: new Date(),
        updated_at: new Date(), 
      },
      { 
        name: 'Daftar Member', 
        icon: 'user', 
        path: 'daftar_member', 
        desc: 'Daftar membership aplikasi', 
        created_at: new Date(),
        updated_at: new Date(), 
      },
      { 
        name: 'Semua Produk', 
        icon: 'list-check', 
        path: 'semua_produk', 
        desc: 'Daftar produk aplikasi', 
        created_at: new Date(),
        updated_at: new Date(), 
      },
      { 
        name: 'Pengaturan Umum', 
        icon: 'settings', 
        path: 'pengaturan_umum', 
        desc: 'Daftar pengaturan aplikasi',
        created_at: new Date(),
        updated_at: new Date(), 
      },
    ],
    skipDuplicates: true,
  });
}
