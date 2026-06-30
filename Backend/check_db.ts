import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const devices = await prisma.deviceConnected.findMany();
  console.log('Devices:', devices);
  const notifs = await prisma.pengumumanRecipient.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Recipients:', notifs);
  const notifRecords = await prisma.pengumuman.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5
  });
  console.log('Notifications:', notifRecords);
}
main().finally(() => prisma.$disconnect());
