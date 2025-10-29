const jwt = require("jsonwebtoken");
const { User, Submenu, Tab, Menu } = require("../../models");

class Models {
  constructor(req) {
    this.req = req;
  }

  async get_menu_submenu_tab() {
    try {
      const authHeader = this.req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];
      const decoded = jwt.decode(token);
      var user_info = {};
      await User.findOne({
        where: {
          id: decoded.id,
        },
      }).then(async (e) => {
        if (e) {
          user_info["fullname"] = e.fullname;
          // user_info["grup_id"] = e.grup_id;
          // user_info["grup"] = e.Grup.name;
          // if (e.grup_id == 1) {
          //   user_info["group_access"] = {};
          // } else {
          //   user_info["group_access"] = JSON.parse(e.Grup.group_access);
          // }
        }
      });

      var list_tab_user = { menu: [], submenu: [] };
      for (let x in user_info.group_access) {
        list_tab_user.menu.push(user_info.group_access[x].id);
        if (user_info.group_access[x].Submenus.length > 0) {
          for (let y in user_info.group_access[x].Submenus) {
            list_tab_user.submenu.push(
              user_info.group_access[x].Submenus[y].id
            );
          }
        }
      }

      var menu = {};
      await Menu.findAll().then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            menu[e.id] = {
              id: e.id,
              name: e.name,
              path: e.path,
              icon: e.icon,
              tab: e.path === "#" ? "" : JSON.parse(e.tab),
            };
          })
        );
      });

      var submenu = {};
      await Submenu.findAll().then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            if (submenu[e.menu_id] === undefined) {
              submenu = {
                ...submenu,
                ...{
                  [e.menu_id]: [
                    {
                      id: e.id,
                      name: e.name,
                      path: e.path,
                      tab: e.tab === "" ? "" : JSON.parse(e.tab),
                    },
                  ],
                },
              };
            } else {
              submenu[e.menu_id].push({
                id: e.id,
                name: e.name,
                path: e.path,
                tab: e.tab === "" ? "" : JSON.parse(e.tab),
              });
              // if (user_info["grup_id"] === 1) {

              // } else {
              //   if (list_tab_user.submenu.includes(e.id)) {
              //     submenu[e.menu_id].push({
              //       id: e.id,
              //       name: e.name,
              //       path: e.path,
              //       tab: e.tab === "" ? "" : JSON.parse(e.tab),
              //     });
              //   }
              // }
            }
          })
        );
      });

      var tab = {};
      await Tab.findAll().then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            tab = {
              ...tab,
              ...{
                [e.id]: {
                  id: e.id,
                  name: e.name,
                  icon: e.icon,
                  path: e.path,
                  title: e.title,
                  desc: e.description,
                },
              },
            };
          })
        );
      });

      return { menu_info: { menu, submenu, tab }, user_info: user_info };
    } catch (error) {
      console.log("-------error");
      console.log(error);
      console.log("-------error");
      return {};
    }
    // try {
    //   var q = await User.findOne({
    //     where: { username: this.req.body.username },
    //   });
    //   // console.log("-----Q-----");
    //   // console.log(q);
    //   // console.log("-----Q-----");
    //   return {
    //     id: q.id,
    //     username: q.username,
    //     fullname: q.fullname,
    //     password: q.password,
    //   };
    // } catch (error) {
    //   return {};
    // }
  }
}

module.exports = Models;
