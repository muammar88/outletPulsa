import { PrismaClient } from '@prisma/client';
import seedProdukPascabayar from '../seeds/produk_pascabayar.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Memulai Eksekusi Khusus Seed Produk Pascabayar ---');
  await seedProdukPascabayar(prisma);
  console.log('--- Eksekusi Seed Produk Pascabayar Selesai ---');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
