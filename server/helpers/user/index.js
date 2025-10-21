const { Op, Tab, Menu, Submenu, Company } = require("../../db/models");

const helper = {};

// helper.getInfoLevel = async (param) => {
//   var user_id = "";
//   var name = param.type;
//   if (param.type != "administrator") {
//     await Company_staff.findOne({
//       where: { code: param.code },
//     }).then(async (val) => {
//       if (val) {
//         user_id = val.id;
//         name = val.fullname;
//       }
//     });
//   }
//   return { user_id: user_id, name: name, type: param.type };
// };

helper.getCompanyIdByCode = async (code) => {
  var companyId = "";
  await Company.findOne({
    where: { code: code },
  }).then(async (val) => {
    if (val) {
      companyId = val.id;
    }
  });
  return companyId;
};

helper.get_menus = async () => {
  var default_submenu = {};
  var list_tab = [];
  await Tab.findAll().then(async (value) => {
    await Promise.all(
      await value.map(async (e) => {
        list_tab[e.id] = {
          name: e.name,
          path: e.path,
          icon: e.icon,
          description: e.description,
        };
      })
    );
  });

  var menu_submenu_tab = {};

  var list_submenu = [];
  await Submenu.findAll().then(async (value) => {
    var z = 0;
    await Promise.all(
      await value.map(async (e) => {
        if (Object.keys(default_submenu).length == 0) {
          default_submenu = { path: e.path, icon: e.icon };
        }
        if (e.tab != "") {
          var tab = [];
          var tabs = JSON.parse(e.tab);
          var i = 0;
          for (x in tabs) {
            var id = tabs[x].id;
            if (list_tab[id] != undefined) {
              tab[i] = {
                name: list_tab[id].name,
                path: list_tab[id].path,
                icon: list_tab[id].icon,
                description: list_tab[id].description,
              };
              i++;
            }
          }

          // get list tab
          menu_submenu_tab[e.path] = tab;

          list_submenu[z] = {
            menu_id: e.menu_id,
            name: e.name,
            path: e.path,
            tab: tab,
          };
        } else {
          list_submenu[z] = {
            menu_id: e.menu_id,
            name: e.name,
            path: e.path,
          };
        }
        z++;
      })
    );
  });

  var list = {};
  var default_menu = {};
  await Menu.findAll({ order: [["id", "ASC"]] }).then(async (menus) => {
    var i = 0;
    await Promise.all(
      await menus.map(async (e) => {
        var submenu = {};
        var k = 0;
        await Promise.all(
          await list_submenu.map(async (ex) => {
            if (ex.menu_id == e.id) {
              submenu[k] = {
                name: ex.name,
                path: ex.path,
              };
              k++;
            }
          })
        );

        if (Object.keys(default_menu).length == 0) {
          default_menu = { path: e.path, icon: e.icon };
        }

        if (e.tab != "") {
          var tabs = JSON.parse(e.tab);
          var tab = [];
          var j = 0;
          for (x in tabs) {
            var id = tabs[x].id;
            if (list_tab[id] != undefined) {
              tab[j] = {
                name: list_tab[id].name,
                path: list_tab[id].path,
                icon: list_tab[id].icon,
                description: list_tab[id].description,
              };
              j++;
            }
          }

          if (e.path != "#") {
            menu_submenu_tab[e.path] = tab;
          }

          list[i] = {
            id: e.id,
            name: e.name,
            path: e.path,
            icon: e.icon,
            submenu: submenu,
            tab: tab,
          };
        } else {
          list[i] = {
            id: e.id,
            name: e.name,
            path: e.path,
            icon: e.icon,
            submenu: submenu,
          };
        }
        i++;
      })
    );
  });

  if (Object.keys(default_menu).length == 0) {
    default_menu = default_submenu;
  }

  return { list, menu_submenu_tab, default_menu, tab: list_tab };
};

module.exports = helper;
