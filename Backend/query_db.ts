import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const pengumumans = await prisma.pengumuman.findMany();
  console.log('--- PENGUMUMAN ---');
  console.log(pengumumans);

  const recipients = await prisma.pengumumanRecipient.findMany();
  console.log('--- RECIPIENTS ---');
  console.log(recipients);

  const devices = await prisma.deviceConnected.findMany();
  console.log('--- DEVICES ---');
  console.log(devices);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
