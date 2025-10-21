const { jwt_value } = require("../../helpers/jwt");
const jwt = require("jsonwebtoken");
const Model_r = require("./Model_r");
const controllers = {};

/**
 * User Area
 **/
controllers.User_area = async (req, res) => {
  const model_r = new Model_r(req);
  const menu = await model_r.menu();
  const submenu = await model_r.submenu();
  const tab = await model_r.tab();

  const jwt = await jwt_value(req);
  const token = req.query.token;

  var list_tab = {};
  for (x in menu) {
    if (menu[x].tab != null) {
      var tabs = JSON.parse(menu[x].tab);
      var tempTab = [];
      var i = 0;
      for (let y in tabs) {
        tempTab[i] = tab[tabs[y].id];
        i++;
      }
      list_tab[menu[x].path] = tempTab;
    }
  }

  var list_submenu = {};
  submenu.forEach((e) => {
    if (e.tab != null) {
      var tabs = JSON.parse(e.tab);
      var tempTab = [];
      var i = 0;
      for (let y in tabs) {
        tempTab[i] = tab[tabs[y].id];
        i++;
      }
      list_tab[e.path] = tempTab;
    }
    if (!list_submenu.hasOwnProperty(e.menu_id)) {
      list_submenu[e.menu_id] = [
        {
          id: e.id,
          name: e.name,
          path: e.path,
          tab: e.tab,
        },
      ];
    } else {
      list_submenu[e.menu_id].push({
        id: e.id,
        name: e.name,
        path: e.path,
        tab: e.tab,
      });
    }
  });

  res.render("user/index", {
    kode: jwt.kode,
    name: jwt.name,
    token: token,
    menu: menu,
    default_menu: { icon: "fas fa-home", path: "beranda" },
    submenu: list_submenu,
    list_tab: list_tab,
    tab: tab,
  });
};

controllers.Logout_process = async (req, res) => {
  if (typeof req.session.login_session !== "undefined") {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    var kode;
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      kode = decoded.kode;
    });
    if (!req.session.login_session.hasOwnProperty(kode)) {
      const index = req.session.login_session.indexOf(kode);
      if (index > -1) {
        req.session.login_session.splice(index, 1);
      }
      res.status(200).json({
        msg: "Proses logout berhasil",
      });
    } else {
      res.status(200).json({
        msg: "Proses logout berhasil",
      });
    }
  } else {
    res.status(200).json({
      msg: "Proses logout berhasil",
    });
  }
};

controllers.Info_profil_admin = async (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  var kode;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    kode = decoded.kode;
  });
  const model_r = new Model_r(req);
  const info = await model_r.info_profil_admin(kode);
  // error checking
  if (info.error) {
    res.status(400).json({
      error: true,
      error_msg: "Data Info Profil Gagal Ditemukan",
    });
  } else {
    res.status(200).json({
      error: false,
      error_msg: "Data Info Profil Berhasil Ditemukan",
      data: info.data,
    });
  }
};

module.exports = controllers;
