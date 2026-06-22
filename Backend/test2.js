const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  try {
    const uniqueKode = `DEP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    await prisma.requestDeposit.create({
      data: {
        kode: uniqueKode,
        riwayatTransaksiId: 3, // Assuming 3 is a valid riwayatTransaksiId
        nominal: 50000,
        nominalTambahan: 88,
        status: 'gagal',
        statusKirim: 'sudah_kirim',
        alasanPenolakan: 'Transfer tidak masuk',
      },
    });
    console.log('Insert success');
  } catch (e) {
    console.error('Insert failed:', e);
  }
}
test().finally(() => prisma.$disconnect());
