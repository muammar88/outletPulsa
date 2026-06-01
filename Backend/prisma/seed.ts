import { PrismaClient } from '@prisma/client';

import menuSeed from './seeds/menu.seed';
import subMenuSeed from './seeds/sub.seed';
import tabMenuSeed from './seeds/tab.seed';
import userSeed from './seeds/user.seed';

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
