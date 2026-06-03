import { PrismaClient } from '@prisma/client';

export default async function activityLogSeed(prisma: PrismaClient) {
  const users = await prisma.user.findMany();
  const members = await prisma.member.findMany();

  if (users.length === 0 || members.length === 0) return;

  const actions = ['LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'VIEW'];
  const entities = ['Member', 'Produk', 'RiwayatSaldo', 'Server', 'System', 'Transaksi'];
  
  const logs: any[] = [];

  for (let i = 1; i <= 200; i++) {
    const isUser = Math.random() > 0.5;
    const action = actions[Math.floor(Math.random() * actions.length)];
    const entity = entities[Math.floor(Math.random() * entities.length)];
    const randomDate = new Date(new Date().getTime() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)); // random within last 30 days
    
    let description = '';
    
    if (isUser) {
      const user = users[Math.floor(Math.random() * users.length)];
      description = `Admin ${user.name} melakukan aksi ${action} pada ${entity}.`;
      logs.push({
        userId: user.id,
        memberId: null,
        action,
        entity,
        entityId: Math.floor(Math.random() * 100).toString(),
        description,
        createdAt: randomDate,
      });
    } else {
      const member = members[Math.floor(Math.random() * members.length)];
      description = `Member ${member.fullname} melakukan aksi ${action} pada ${entity}.`;
      logs.push({
        userId: null,
        memberId: member.id,
        action,
        entity,
        entityId: Math.floor(Math.random() * 100).toString(),
        description,
        createdAt: randomDate,
      });
    }
  }

  await prisma.activityLog.createMany({
    data: logs,
    skipDuplicates: true,
  });
}
