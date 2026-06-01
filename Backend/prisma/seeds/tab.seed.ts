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
      { 
        name: 'Daftar Server', 
        icon: 'server', 
        path: 'daftar_server', 
        desc: 'Daftar server pulsa',
        created_at: new Date(),
        updated_at: new Date(), 
      },
      { 
        name: 'Daftar Agen', 
        icon: 'users', 
        path: 'daftar_agen', 
        desc: 'Daftar agen pulsa',
        created_at: new Date(),
        updated_at: new Date(), 
      },
      { 
        name: 'Kategori', 
        icon: 'category', 
        path: 'kategori', 
        desc: 'Daftar kategori',
        created_at: new Date(),
        updated_at: new Date(), 
      },
      { 
        name: 'Operator', 
        icon: 'antenna',
        path: 'operator',
        desc: 'Daftar operator',
        created_at: new Date(),
        updated_at: new Date(), 
      },
      { 
        name: 'Deposit', 
        icon: 'wallet',
        path: 'deposit',
        desc: 'Riwayat deposit member',
        created_at: new Date(),
        updated_at: new Date(), 
      },
    ],
    skipDuplicates: true,
  });
}
