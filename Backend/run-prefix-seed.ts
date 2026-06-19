import { PrismaClient } from '@prisma/client';
import prefixSeed from './prisma/seeds/prefix.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Menjalankan prefix seed...');
  await prefixSeed(prisma);
  console.log('Selesai!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
