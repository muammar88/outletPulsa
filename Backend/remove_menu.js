const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.subMenu.deleteMany({
    where: { path: 'pengaturan_jadwal' }
  });
  
  await prisma.tabMenu.deleteMany({
    where: { path: 'pengaturan_jadwal' }
  });

  console.log("Deleted pengaturan_jadwal from DB");
}

main().catch(console.error).finally(()=>prisma.$disconnect());
