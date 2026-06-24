import { PrismaClient, TransactionStatus, StatusLaba, FeeAgenStatus, ProdukType } from '@prisma/client';

const prisma = new PrismaClient();

async function runTokenPLNSeed() {
  console.log('Mulai generate dummy seed Token PLN...');

  // 1. Cari Member
  const member = await prisma.member.findFirst();
  if (!member) {
    console.log('Member tidak ditemukan. Harap seed member terlebih dahulu.');
    return;
  }

  // 2. Cari Server (misal IAK)
  let server = await prisma.server.findFirst({ where: { name: { contains: 'IAK', mode: 'insensitive' } } });
  if (!server) {
    server = await prisma.server.findFirst();
  }

  // 3. Pastikan Kategori & Operator PLN ada
  let kategoriPLN = await prisma.kategori.findFirst({
    where: { name: { contains: 'Token', mode: 'insensitive' } }
  });
  if (!kategoriPLN) {
    kategoriPLN = await prisma.kategori.create({
      data: { name: 'Token PLN', type: 'prabayar' }
    });
  }

  let operatorPLN = await prisma.operator.findFirst({
    where: { name: { contains: 'PLN', mode: 'insensitive' } }
  });
  if (!operatorPLN) {
    operatorPLN = await prisma.operator.create({
      data: { name: 'PLN', kategoriId: kategoriPLN.id }
    });
  }

  // 4. Konfigurasi Nominal dan Produk
  const nominals = [20000, 50000, 100000, 200000, 500000, 1000000];
  const transactionsToCreate = 50;

  for (let i = 0; i < transactionsToCreate; i++) {
    const nominal = nominals[Math.floor(Math.random() * nominals.length)];
    const productName = `Token PLN ${nominal.toLocaleString('id-ID')}`;
    
    // Cari atau buat produk
    let produk = await prisma.produk.findFirst({
      where: { name: productName }
    });
    
    const purchase_price = nominal + 250;
    const laba = 1500;
    const selling_price = purchase_price + laba;
    const fee_agen = 500;

    if (!produk) {
      produk = await prisma.produk.create({
        data: {
          operatorId: operatorPLN.id,
          name: productName,
          kode: `PLN${nominal / 1000}`,
          purchase_price: purchase_price,
          markup: laba,
          serverId: server?.id,
          status: 'active'
        }
      });
    }

    // 5. Generate Date Random (1-90 days ago)
    const daysAgo = Math.floor(Math.random() * 90) + 1;
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);
    const updatedAt = new Date(createdAt);
    updatedAt.setMinutes(updatedAt.getMinutes() + 2); // sukses 2 menit kemudian

    // 6. Generate Data Pendukung Realistis
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const nomorTujuan = `11${randomSuffix}${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Serial Number Format: 1234 5678 9012 3456 7890
    const snParts = Array.from({ length: 5 }, () => String(Math.floor(1000 + Math.random() * 9000)));
    const sn = snParts.join(' ');

    const tarifDayaOptions = ['R1/900VA', 'R1/1300VA', 'R1/2200VA', 'R2/3500VA'];
    const tarifDaya = tarifDayaOptions[Math.floor(Math.random() * tarifDayaOptions.length)];
    
    const namaPelanggan = `Pelanggan ${randomSuffix}`;

    const ket = `SN: ${sn} / ${namaPelanggan} / ${tarifDaya} / KWH: ${(nominal / 1500).toFixed(1)}`;

    const saldo_sesudah = Math.floor(100000 + Math.random() * 1000000);
    const saldo_sebelum = saldo_sesudah + selling_price + fee_agen;

    const isPaidLaba = Math.random() > 0.5;
    const isPaidFee = Math.random() > 0.5;

    // 7. Buat Riwayat Transaksi
    const riwayat = await prisma.riwayatTransaksi.create({
      data: {
        memberId: member.id,
        tipeTransaksi: 'beli_produk_prabayar',
        createdAt: createdAt,
        updatedAt: updatedAt
      }
    });

    // 8. Buat Transaksi
    await prisma.transaction.create({
      data: {
        kode: `TRX-PLN-${Date.now()}-${randomSuffix}`,
        type: 'prabayar',
        produkId: produk.id,
        riwayatTransaksiId: riwayat.id,
        nomorTujuan: nomorTujuan,
        ket: ket,
        purchase_price: purchase_price,
        selling_price: selling_price,
        saldo_sebelum: saldo_sebelum,
        saldo_sesudah: saldo_sesudah,
        kodeAgen: member.kode,
        laba: laba,
        status_laba: isPaidLaba ? 'paid' : 'unpaid',
        fee_agen: fee_agen,
        status_fee_agen: isPaidFee ? 'paid' : 'unpaid',
        serverId: server?.id,
        status: 'sukses',
        trx_id: Math.floor(Math.random() * 1000000),
        createdAt: createdAt,
        updatedAt: updatedAt
      }
    });
  }

  console.log(`Berhasil generate ${transactionsToCreate} data Token PLN.`);
}

runTokenPLNSeed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
