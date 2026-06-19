import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fixing sequence for Produk...');
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Produk"', 'id'), coalesce(max(id)+1, 1), false) FROM "Produk";`);
  
  // also fix Operator, Server if they were seeded manually
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Operator"', 'id'), coalesce(max(id)+1, 1), false) FROM "Operator";`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"Server"', 'id'), coalesce(max(id)+1, 1), false) FROM "Server";`);

  console.log('Sequences fixed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
