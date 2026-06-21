import { PrismaClient, TransactionStatus, StatusKirim } from '@prisma/client';

export default async function depositSeed(prisma: PrismaClient) {
  console.log('Seeding Deposit...');

  const member = await prisma.member.findFirst({
    where: { kode: 'MBR006' },
  });

  if (!member) {
    console.log('Member MBR006 tidak ditemukan, skip seed deposit.');
    return;
  }

  const bankTransfer = await prisma.bankTransferOutlet.findFirst();

  // Array of deposits to seed
  const deposits = [
    {
      nominal: 100000,
      nominalTambahan: 45,
      status: TransactionStatus.proses,
      statusKirim: StatusKirim.belum_kirim,
    },
    {
      nominal: 200000,
      nominalTambahan: 12,
      status: TransactionStatus.sukses,
      statusKirim: StatusKirim.sudah_kirim,
    },
    {
      nominal: 50000,
      nominalTambahan: 88,
      status: TransactionStatus.gagal,
      statusKirim: StatusKirim.sudah_kirim,
      alasanPenolakan: 'Transfer tidak masuk',
    },
  ];

  for (const dep of deposits) {
    const riwayatDeposit = await prisma.riwayatTransaksi.create({
      data: {
        memberId: member.id,
        tipeTransaksi: 'deposit',
      },
    });

    const uniqueKode = `DEP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    await prisma.requestDeposit.create({
      data: {
        kode: uniqueKode,
        riwayatTransaksiId: riwayatDeposit.id,
        nominal: dep.nominal,
        nominalTambahan: dep.nominalTambahan,
        status: dep.status,
        bankTransferId: bankTransfer ? bankTransfer.id : null,
        waktuRequest: new Date(),
        statusKirim: dep.statusKirim,
        alasanPenolakan: dep.alasanPenolakan || null,
      },
    });
  }

  console.log('Berhasil seed Deposit untuk MBR006');
}
