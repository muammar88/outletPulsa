import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function run() {
  const seedsDir = path.join(__dirname, 'prisma/seeds');
  
  // Update TabMenu
  const tabContent = fs.readFileSync(path.join(seedsDir, 'tab.seed.ts'), 'utf-8');
  const tabMatches = [...tabContent.matchAll(/icon:\s*'([^']+)',\s*path:\s*'([^']+)'/g)];
  for (const match of tabMatches) {
    const [, icon, pathName] = match;
    await prisma.tabMenu.updateMany({
      where: { path: pathName },
      data: { icon }
    });
  }

  // Update Menu
  const menuContent = fs.readFileSync(path.join(seedsDir, 'menu.seed.ts'), 'utf-8');
  const menuMatches = [...menuContent.matchAll(/icon:\s*'([^']+)',\s*path:\s*'([^']+)'/g)];
  for (const match of menuMatches) {
    const [, icon, pathName] = match;
    await prisma.menu.updateMany({
      where: { path: pathName },
      data: { icon }
    });
  }

  // Update SubMenu
  const subContent = fs.readFileSync(path.join(seedsDir, 'sub.seed.ts'), 'utf-8');
  const subMatches = [...subContent.matchAll(/icon:\s*'([^']+)',\s*path:\s*'([^']+)'/g)];
  for (const match of subMatches) {
    const [, icon, pathName] = match;
    await prisma.subMenu.updateMany({
      where: { path: pathName },
      data: { icon }
    });
  }

  console.log('Icons updated successfully!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
