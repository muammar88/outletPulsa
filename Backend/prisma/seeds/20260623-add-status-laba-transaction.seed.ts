import { PrismaClient } from '@prisma/client';

export default async function statusLabaTransactionSeed(prisma: PrismaClient) {
  console.log('🔄 Memulai proses update data lama untuk kolom status_laba...');

  try {
    // Membungkus seluruh operasi dalam satu transaksi agar atomik
    // Jika ada satu operasi gagal, maka semua perubahan di-rollback
    await prisma.$transaction(async (tx) => {
      
      // 1. Update tabel Transaction
      console.log('    -> Memperbarui tabel Transaction (Prabayar)...');
      const updatePrabayar = await tx.$executeRaw`
        UPDATE "Transaction" 
        SET "status_laba" = 'unpaid'::"StatusLaba" 
        WHERE "status_laba" IS NULL;
      `;
      console.log(`    ✅ Berhasil memperbarui ${updatePrabayar} data lama di tabel Transaction`);

      // 2. Update tabel TransactionPascabayar
      console.log('    -> Memperbarui tabel TransactionPascabayar...');
      const updatePascabayar = await tx.$executeRaw`
        UPDATE "TransactionPascabayar" 
        SET "status_laba" = 'unpaid'::"StatusLaba" 
        WHERE "status_laba" IS NULL;
      `;
      console.log(`    ✅ Berhasil memperbarui ${updatePascabayar} data lama di tabel TransactionPascabayar`);

    }, {
      maxWait: 15000, // Waktu tunggu maksimum untuk mendapatkan lock (ms)
      timeout: 60000, // Waktu maksimum transaksi diizinkan berjalan (ms)
    });

    console.log('🎉 Proses update status_laba pada data lama berhasil diselesaikan dengan aman!');
  } catch (error) {
    console.error('❌ Terjadi kesalahan selama proses update status_laba:', error);
    throw error; // Lempar error agar script ts-node keluar dengan exit code 1 dan menggagalkan pipeline jika terjadi error
  }
}

// Menjalankan skrip secara mandiri jika dipanggil langsung lewat ts-node
if (require.main === module) {
  const prisma = new PrismaClient();
  statusLabaTransactionSeed(prisma)
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
