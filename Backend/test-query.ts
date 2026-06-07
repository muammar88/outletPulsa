import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const produks = await prisma.produk.count();
  console.log(`Total produk: ${produks}`);

  const produksWithPiu = await prisma.produk.count({
    where: {
      operator: {
        OR: [{ name: { contains: 'PIU' } }, { kode: 'PIU' }],
      },
    },
  });
  console.log(`Total produk operator PIU: ${produksWithPiu}`);
  
  const allOperators = await prisma.operator.findMany({
    take: 10,
    select: { name: true, kode: true }
  });
  console.log('Sample operators:', allOperators);
}

main().finally(() => prisma.$disconnect());
