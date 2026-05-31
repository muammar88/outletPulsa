import { PrismaClient } from '@prisma/client';

export default async function tabSeed(prisma: PrismaClient) {
  await prisma.tab.createMany({
    data: [
      {
        name: 'Ringkasan',
        icon: 'chart-pie',
        path: 'ringkasan',
        desc: 'Dashboard utama yang menampilkan ringkasan keseluruhan informasi aplikasi, statistik penting, dan navigasi menu utama.',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ],
    skipDuplicates: true,
  });
}
