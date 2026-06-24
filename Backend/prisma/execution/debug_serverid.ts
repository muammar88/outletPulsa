import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const all = await prisma.produkPascabayar.findMany({
    select: { id: true, name: true, serverId: true }
  });
  console.log("Total Products:", all.length);
  
  const iak = all.filter(p => p.serverId === 1).length;
  const none = all.filter(p => p.serverId === null).length;
  const other = all.filter(p => p.serverId !== 1 && p.serverId !== null).length;
  
  console.log("serverId=1 (IAK):", iak);
  console.log("serverId=null:", none);
  console.log("serverId=other:", other);
  
  const grouped = await prisma.produkPascabayar.groupBy({
    by: ['serverId'],
    _count: { id: true }
  });
  console.log("Grouped:", grouped);
}

main().catch(console.error).finally(() => prisma.$disconnect());
