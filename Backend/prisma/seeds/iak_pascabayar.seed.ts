import { PrismaClient } from '@prisma/client';

export default async function iakPascabayarSeed(prisma: PrismaClient) {
  console.log('Seeding IAK Pascabayar Master Data...');

  const pascabayarTypes = [
    'asuransi',
    'bpjs',
    'emoney',
    'finance',
    'gas',
    'hp',
    'internet',
    'pajak-daerah',
    'pajak-kendaraan',
    'pbb',
    'pdam',
    'pln',
    'tv'
  ];

  for (const type of pascabayarTypes) {
    const existing = await prisma.iakPascabayarType.findFirst({
      where: { type }
    });

    if (!existing) {
      await prisma.iakPascabayarType.create({
        data: { type }
      });
    }
  }

  console.log('Seeding IAK Pascabayar Master Data selesai.');
}
