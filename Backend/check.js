const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const menus = await prisma.menu.findMany();
  console.log('Total Menus:', menus.length);
  for (const m of menus) {
    console.log(`Menu [${m.id}] ${m.name}: tab =`, m.tab);
  }
}
check().finally(() => prisma.$disconnect());
