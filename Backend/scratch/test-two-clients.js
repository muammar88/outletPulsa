const { PrismaClient } = require('../node_modules/@prisma/client');

async function main() {
  const p1 = new PrismaClient();
  const p2 = new PrismaClient();
  try {
    await p1.$connect();
    await p2.$connect();
    console.log('SUCCESS: Both Prisma clients connected to outletpulsa_db');
    const count = await p1.paymentGatewayCallbackInbox.count();
    console.log('paymentGatewayCallbackInbox count:', count);
  } finally {
    await p1.$disconnect();
    await p2.$disconnect();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
