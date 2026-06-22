const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const seq = await prisma.$queryRaw`SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'RequestDeposit'`;
  console.log(seq);
}
test().catch(console.error).finally(() => prisma.$disconnect());
