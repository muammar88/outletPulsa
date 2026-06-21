import { PrismaClient } from '@prisma/client';

export default async function bankSeed(prisma: PrismaClient) {
  console.log('Seeding Bank & BankTransferOutlet...');

  const bca = await prisma.bank.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      kode: 'BCA',
      nama: 'BCA',
      image: 'BCA.png',
    },
  });

  const mandiri = await prisma.bank.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      kode: 'MANDIRI',
      nama: 'MANDIRI',
      image: 'MANDIRI.png',
    },
  });

  const bri = await prisma.bank.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      kode: 'BRI',
      nama: 'BRI',
      image: 'BRI.png',
    },
  });

  const bni = await prisma.bank.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      kode: 'BNI',
      nama: 'BNI',
      image: 'BNI.png',
    },
  });

  await prisma.bankTransferOutlet.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      bankId: bca.id,
      accountName: 'PT OUTLET PULSA BCA',
      accountNumber: '1234567890',
    },
  });

  await prisma.bankTransferOutlet.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      bankId: mandiri.id,
      accountName: 'PT OUTLET PULSA MANDIRI',
      accountNumber: '0987654321',
    },
  });

  await prisma.bankTransferOutlet.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      bankId: bri.id,
      accountName: 'PT OUTLET PULSA BRI',
      accountNumber: '1122334455',
    },
  });

  await prisma.bankTransferOutlet.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      bankId: bni.id,
      accountName: 'PT OUTLET PULSA BNI',
      accountNumber: '5544332211',
    },
  });

  console.log('Bank & BankTransferOutlet seeded successfully.');
}
