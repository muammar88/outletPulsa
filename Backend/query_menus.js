const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("SubMenus:");
  console.log(await prisma.subMenu.findMany());
  console.log("TabMenus:");
  console.log(await prisma.tabMenu.findMany());
}

main().catch(console.error).finally(()=>prisma.$disconnect());
