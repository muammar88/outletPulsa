import { PrismaClient } from '@prisma/client';

export default async function webhookDummySeed(prisma: PrismaClient) {
  console.log('Seeding Dummy Transactions for Webhook Testing...');

  let server = await prisma.server.findFirst();
  if (!server) {
    server = await prisma.server.create({
      data: {
        name: 'Server Dummy',
        kode: 'SERVER-DUMMY',
        status: 'active',
      },
    });
    console.log('Created dummy server');
  }

  // 1. Dummy Transaksi IAK
  await prisma.transaction.create({
    data: {
      kode: '634539288', // IAK mencocokkan ref_id dengan field kode
      type: 'prabayar',
      nomorTujuan: '0812121212',
      ket: 'Transaksi IAK Dummy (htelkomsel100000)',
      purchase_price: 10325,
      selling_price: 11000,
      status: 'proses',
      serverId: server.id,
    },
  });
  console.log('Created dummy transaction for IAK (ref_id/kode: 634539288)');

  // 2. Dummy Transaksi Tripay
  await prisma.transaction.create({
    data: {
      kode: 'TRI-DUMMY-1234567',
      trx_id: 999123, // Tripay mencocokkan trxid dengan field trx_id
      type: 'prabayar',
      nomorTujuan: '081234567891',
      ket: 'Transaksi Tripay Dummy',
      purchase_price: 18000,
      selling_price: 20000,
      status: 'proses',
      serverId: server.id,
    },
  });
  console.log('Created dummy transaction for Tripay (trx_id: 999123)');

  // 3. Dummy Transaksi Digiflazz
  await prisma.transaction.create({
    data: {
      kode: 'DIGI-DUMMY-1234567', // Digiflazz mencocokkan ref_id dengan field kode
      type: 'prabayar',
      nomorTujuan: '081234567892',
      ket: 'Transaksi Digiflazz Dummy',
      purchase_price: 49000,
      selling_price: 50000,
      status: 'proses',
      serverId: server.id,
    },
  });
  console.log('Created dummy transaction for Digiflazz (ref_id/kode: DIGI-DUMMY-123)');
}
