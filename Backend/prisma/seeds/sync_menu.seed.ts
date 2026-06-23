import { PrismaClient } from '@prisma/client';
import tabSeed from './tab.seed';
import menuSeed from './menu.seed';
import subSeed from './sub.seed';

export default async function syncMenuSeed(prisma: PrismaClient) {
  console.log('🔄 Memulai proses Sinkronisasi Menu Khusus...');

  try {
    // Membungkus seluruh operasi dalam satu transaksi agar atomik
    // Jika ada satu langkah yang gagal, maka semua perubahan akan dibatalkan (rollback)
    await prisma.$transaction(async (tx) => {
      console.log('🗑️  1. Menghapus data lama secara berurutan...');
      
      // Penghapusan harus dimulai dari child yang memiliki foreign key ke parent
      await tx.subMenu.deleteMany({});
      console.log('    ✅ SubMenu berhasil dihapus');
      
      await tx.menu.deleteMany({});
      console.log('    ✅ Menu berhasil dihapus');
      
      await tx.tabMenu.deleteMany({});
      console.log('    ✅ TabMenu berhasil dihapus');

      console.log('🌱 2. Memulai proses seeding data baru secara berurutan...');
      
      // Prisma transaction context type didukung oleh script existing yang menerima PrismaClient
      const txClient = tx as any as PrismaClient;

      console.log('    -> Seeding TabMenu...');
      await tabSeed(txClient);

      console.log('    -> Seeding Menu...');
      await menuSeed(txClient);

      console.log('    -> Seeding SubMenu...');
      await subSeed(txClient);
      
    }, {
      maxWait: 15000,
      timeout: 60000,
    });

    console.log('🎉 3. Sinkronisasi Menu Khusus berhasil diselesaikan!');
  } catch (error) {
    console.error('❌ Terjadi kesalahan fatal selama proses sinkronisasi:', error);
    throw error; // Lempar error agar CI/CD bisa mendeteksi kegagalan
  }
}

// Menjalankan skrip secara mandiri jika dipanggil langsung lewat ts-node
if (require.main === module) {
  const prisma = new PrismaClient();
  syncMenuSeed(prisma)
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
