const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function test() {
  const res = await prisma.requestDeposit.findMany();
  console.log('Rows RequestDeposit:', res.length);
  res.forEach(r => console.log(r.id, r.kode));
  const seq = await prisma.$queryRaw`SELECT * FROM "RequestDeposit_id_seq"`;
  console.log('Sequence RequestDeposit:', seq);
}
test().catch(console.error).finally(() => prisma.$disconnect());
