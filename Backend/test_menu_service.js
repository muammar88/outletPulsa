const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  let allowedSubmenus = [];
  let allowedTabs = [];
  const role = 'administrator';
  const tabs = await prisma.tabMenu.findMany();
  const tabMap = new Map(tabs.map((t) => [t.id, t]));

  const menus = await prisma.menu.findMany({
    include: { subMenus: true },
  });

  const result = menus.map((menu) => {
    const mappedSubMenus = menu.subMenus
      .filter((sub) => role === 'administrator' || role === 'admin' ? true : allowedSubmenus.includes(sub.id))
      .map((sub) => {
        const subTabs = sub.tab
          ? JSON.parse(sub.tab)
              .map((t) => tabMap.get(Number(t.id)))
              .filter(Boolean)
              .filter((t) => role === 'administrator' || role === 'admin' ? true : allowedTabs.includes(Number(t.id)))
              .map((t) => ({ id: t.id, name: t.name, path: t.path, icon: t.icon }))
          : [];

        return {
          ...sub,
          tab: subTabs,
        };
      });

    const { tab, subMenus, ...menuRest } = menu;
    return {
      ...menuRest,
      submenus: mappedSubMenus,
    };
  });

  console.log(JSON.stringify(result.find(m => m.id === 6), null, 2));
}

main().catch(console.error).finally(()=>prisma.$disconnect());
