import { PrismaClient } from '@prisma/client';

import menuSeed from './seeds/menu.seed';
import subMenuSeed from './seeds/sub.seed';
import tabMenuSeed from './seeds/tab.seed';
import userSeed from './seeds/user.seed';
import memberSeed from './seeds/member.seed';
import kategoriSeed from './seeds/kategori.seed';
import operatorSeed from './seeds/operator.seed';
import serverSeed from './seeds/server.seed';
import produkSeed from './seeds/produk.seed';
import produkPascabayarSeed from './seeds/produk_pascabayar.seed';
import activityLogSeed from './seeds/activity_log.seed';
import rbacSeed from './seeds/rbac.seed';
import notifSeed from './seeds/notif.seed';
import transactionSeed from './seeds/transaction.seed';
import depositSeed from './seeds/deposit.seed';
import iakPrabayarSeed from './seeds/iak_prabayar.seed';
const prisma = new PrismaClient();

async function main() {

  console.log('Seeding TabMenu...');
  await tabMenuSeed(prisma);

  console.log('Seeding Menu...');
  await menuSeed(prisma);

  console.log('Seeding SubMenu...');
  await subMenuSeed(prisma);

  console.log('Seeding User...');
  await userSeed(prisma);
  
  console.log('Seeding Member...');
  await memberSeed(prisma);
  
  console.log('Seeding Kategori...');
  await kategoriSeed(prisma);
  
  console.log('Seeding Operator...');
  await operatorSeed(prisma);
  
  console.log('Seeding Server...');
  await serverSeed(prisma);
  
  console.log('Seeding Produk...');
  await produkSeed(prisma);
  
  console.log('Seeding Produk Pascabayar...');
  await produkPascabayarSeed(prisma);
  
  console.log('Seeding ActivityLog...');
  await activityLogSeed(prisma);

  console.log('Seeding RBAC...');
  await rbacSeed(prisma);

  console.log('Seeding Notif...');
  await notifSeed(prisma);

  console.log('Seeding Transaction and Deposit...');
  await transactionSeed(prisma);

  console.log('Seeding Additional Deposits...');
  await depositSeed(prisma);

  console.log('Seeding IAK Prabayar Master Data...');
  await iakPrabayarSeed(prisma);

  console.log('Seeding completed successfully.');
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
