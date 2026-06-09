import { PrismaClient, TipeTransaksi, TransactionStatus, ProdukType } from '@prisma/client';

export default async function transactionSeed(prisma: PrismaClient) {
  const member = await prisma.member.findFirst({
    where: { kode: 'MBR006' },
  });

  if (!member) {
    console.log('Member MBR006 tidak ditemukan, skip seed transaction.');
    return;
  }

  console.log('Membuat seed RiwayatTransaksi, Transaction, dan Deposit untuk MBR006...');

  // 1. Buat RiwayatTransaksi untuk pembelian prabayar
  const riwayatPrabayar = await prisma.riwayatTransaksi.create({
    data: {
      memberId: member.id,
      tipeTransaksi: 'beli_produk_prabayar',
    },
  });

  // 2. Cari produk prabayar bebas
  const produk = await prisma.produk.findFirst({
    where: { status: 'active' },
  });

  if (produk) {
    await prisma.transaction.create({
      data: {
        kode: 'TRX-PRABAYAR-001',
        type: 'prabayar',
        produkId: produk.id,
        riwayatTransaksiId: riwayatPrabayar.id,
        nomorTujuan: '081234567890',
        ket: 'Pembelian pulsa prabayar sukses',
        purchase_price: produk.purchase_price,
        selling_price: produk.purchase_price ? produk.purchase_price + (produk.markup || 0) : 0,
        laba: produk.markup,
        status: 'sukses',
        trx_id: Math.floor(Math.random() * 1000000),
      },
    });
  }

  // 3. Buat RiwayatTransaksi untuk deposit
  const riwayatDeposit = await prisma.riwayatTransaksi.create({
    data: {
      memberId: member.id,
      tipeTransaksi: 'deposit',
    },
  });

  // 4. Cari bank transfer outlet
  const bankTransfer = await prisma.bankTransferOutlet.findFirst();

  // 5. Buat RequestDeposit
  await prisma.requestDeposit.create({
    data: {
      kode: 'DEP-001',
      riwayatTransaksiId: riwayatDeposit.id,
      nominal: 500000,
      nominalTambahan: 123,
      status: 'sukses',
      bankTransferId: bankTransfer ? bankTransfer.id : null,
      waktuRequest: new Date(),
      statusKirim: 'sudah_kirim',
    },
  });

  // 6. Buat RiwayatTransaksi untuk pascabayar
  const riwayatPascabayar = await prisma.riwayatTransaksi.create({
    data: {
      memberId: member.id,
      tipeTransaksi: 'beli_produk_pascabayar',
    },
  });

  // 7. Cari produk pascabayar
  const produkPascabayar = await prisma.produkPascabayar.findFirst({
    where: { status: 'active' },
  });

  if (produkPascabayar) {
    await prisma.transactionPascabayar.create({
      data: {
        kode: 'TRX-PASCABAYAR-001',
        trId: 'TR-PASC-12345',
        produkId: produkPascabayar.id,
        riwayatTransaksiId: riwayatPascabayar.id,
        nomorTujuan: '081234567890',
        trName: 'Bapak Pelanggan',
        ket: 'Pembayaran tagihan pascabayar sukses',
        nominal: 150000,
        totalNominal: 152500,
        adminFee: 2500,
        comission: 1500,
        outletComission: 1000,
        memberComission: 500,
        noref: 'REF987654321',
        tarif: 'R1/900',
        daya: 900,
        total: 152500,
        kodeAgen: member.kode,
        laba: 1000,
        status: 'sukses',
      },
    });
  }

  console.log('Berhasil seed Transaction, Pascabayar, dan Deposit untuk MBR006');
}
