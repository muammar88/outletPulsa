const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Menus:");
  console.log(await prisma.menu.findMany());
}

main().catch(console.error).finally(()=>prisma.$disconnect());
