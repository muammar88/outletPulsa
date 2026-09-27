const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$queryRawUnsafe('ALTER TABLE "Transaction" ADD COLUMN "refund_id" TEXT;');
    console.log('added refund_id');
  } catch(e){
    console.log('Error adding refund_id:', e.message);
  }
  
  try {
    await prisma.$queryRawUnsafe('CREATE UNIQUE INDEX "Transaction_refund_id_key" ON "Transaction"("refund_id");');
    console.log('added index');
  } catch(e){
    console.log('Error adding index:', e.message);
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(console.error);
