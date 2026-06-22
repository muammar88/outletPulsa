const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Check if TabMenu already exists
  let tabMenu = await prisma.tabMenu.findFirst({
    where: { path: 'pengaturan_jadwal' }
  });

  if (!tabMenu) {
    tabMenu = await prisma.tabMenu.create({
      data: {
        name: 'Pengaturan Jadwal',
        icon: 'IconClock',
        path: 'pengaturan_jadwal',
        desc: 'Pengaturan Jadwal BullMQ Scheduler'
      }
    });
    console.log("Created TabMenu:", tabMenu);
  } else {
    console.log("TabMenu already exists:", tabMenu);
  }

  // 2. Check if SubMenu already exists under menu_id 6 (Pengaturan)
  let subMenu = await prisma.subMenu.findFirst({
    where: { path: 'pengaturan_jadwal', menu_id: 6 }
  });

  if (!subMenu) {
    subMenu = await prisma.subMenu.create({
      data: {
        menu_id: 6,
        name: 'Pengaturan Jadwal',
        path: 'pengaturan_jadwal',
        icon: 'IconClock',
        tab: JSON.stringify([{ id: tabMenu.id }])
      }
    });
    console.log("Created SubMenu:", subMenu);
  } else {
    // update tab if it was wrong
    await prisma.subMenu.update({
      where: { id: subMenu.id },
      data: { tab: JSON.stringify([{ id: tabMenu.id }]) }
    });
    console.log("SubMenu already exists, updated tab:", subMenu);
  }
}

main().catch(console.error).finally(()=>prisma.$disconnect());
