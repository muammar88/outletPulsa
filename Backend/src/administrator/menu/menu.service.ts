import { Injectable,
  InternalServerErrorException,
  NotFoundException, } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}
  
  async getAll(uuid: string, idPegawai: number, role: string) {
    try {
      let allowedMenus: number[] = [];
      let allowedTabs: number[] = [];
      let allowedSubmenus: number[] = [];

      const tabs = await this.prisma.tabMenu.findMany();

      const tabMap = new Map(tabs.map((t) => [t.id, t]));

      const menus = await this.prisma.menu.findMany({
        include: {
          subMenus: true,
        },
      });

      const filteredMenus =
        role === 'administrator' || role === 'admin'
          ? menus
          : menus.filter((m) => allowedMenus.includes(m.id));

      const result = filteredMenus.map((menu) => {
        // FILTER TAB MENU
        const menuTabs = menu.tab
          ? JSON.parse(menu.tab)
              .map((t: { id: any }) => tabMap.get(Number(t.id)))
              .filter(Boolean)
              .filter((t: any) =>
                role === 'administrator' || role === 'admin' ? true : allowedTabs.includes(Number(t.id)),
              )
              .map((t: any) => ({
                id: t.id,
                name: t.name,
                path: t.path,
                icon: t.icon,
              }))
          : [];

        // FILTER SUBMENU
        const mappedSubMenus = menu.subMenus
          .filter((sub) =>
            role === 'administrator' || role === 'admin' ? true : allowedSubmenus.includes(sub.id),
          )
          .map((sub) => {
            // FILTER TAB SUBMENU
            const subTabs = sub.tab
              ? JSON.parse(sub.tab)
                  .map((t: any) => tabMap.get(Number(t.id)))
                  .filter(Boolean)
                  .filter((t: any) =>
                    role === 'administrator' || role === 'admin' ? true : allowedTabs.includes(Number(t.id)),
                  )
                  .map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    path: t.path,
                    icon: t.icon,
                  }))
              : [];

            return {
              ...sub,
              tab: subTabs,
            };
          });

        const { tab, subMenus, ...menuRest } = menu;

        return {
          ...menuRest,
          tab: menuTabs,
          submenus: mappedSubMenus,
        };
      });


      return {
        data: {
          menus: result,
        },
      };
    } catch (error) {
      throw new NotFoundException('Data tidak ditemukan');
    }
  }

//   async getAll() {
  
//     let allowedMenus: number[] = [];
//     let allowedTabs: number[] = [];
//     let allowedSubmenus: number[] = [];

//     const tabs = await this.prisma.tabMenu.findMany();

//     const tabMap = new Map(tabs.map((t) => [t.id, t]));

//     const menus = await this.prisma.menu.findMany({
//       orderBy: { id: 'asc' },
//       include: {
//         subMenus: {
//           orderBy: { id: 'asc' },
//         },
//       },
//     });

// // .filter((t: any) =>
// //                 role === 'admin' ? true : allowedTabs.includes(Number(t.id)),
// //               )

//     const result = menus.map((menu) => {

//        // FILTER TAB MENU
//         const menuTabs = menu.tab
//           ? JSON.parse(menu.tab)
//               .map((t: { id: any }) => tabMap.get(Number(t.id)))
//               .filter(Boolean)
              
//               .map((t: any) => ({
//                 id: t.id,
//                 name: t.name,
//                 path: t.path,
//                 icon: t.icon,
//               }))
//           : [];


//       // Map SubMenus
//       const mappedSubMenus = menu.subMenus.map((sub) => {
//         const { tab, ...subRest } = sub;
        
//         let parsedSubTabs = [];
//         if (tab) {
//           try {
//             parsedSubTabs = typeof tab === 'string' ? JSON.parse(tab) : tab;
//           } catch (e) {
//             parsedSubTabs = [];
//           }
//         }
        
//         return {
//           ...subRest,
//           tabs: parsedSubTabs,
//         };
//       });



//       const { subMenus, tab, ...menuRest } = menu;

//       let parsedMenuTabs = [];
//       if (tab) {
//         try {
//           parsedMenuTabs = typeof tab === 'string' ? JSON.parse(tab) : tab;
//         } catch (e) {
//           parsedMenuTabs = [];
//         }
//       }

//       return {
//         ...menuRest,
//         tabs: parsedMenuTabs,
//         submenus: mappedSubMenus,
//       };
//     });

//     return result;
//   }
}
