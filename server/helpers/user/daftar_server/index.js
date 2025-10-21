const { Op, Server } = require("../../../db/models");

const helper = {};

helper.check_id = async (value, { req }) => {
  var body = req.body;
  if (body.id) {
    check = await Server.findOne({
      where: { id: value },
    });
    if (!check) {
      throw new Error("Id Server Tidak Terdaftar Dipangkalan Data.");
    }
  }
  return true;
};

helper.check_kode_server = async (kode, { req }) => {
  var body = req.body;

  if (body.id != undefined) {
    check = await Server.findOne({
      where: { id: { [Op.ne]: body.id }, kode: kode },
    });
  } else {
    check = await Server.findOne({
      where: { kode: kode },
    });
  }
  // checking process
  if (check) {
    throw new Error("Kode Server Sudah Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.info = async (id) => {
  var list = {};
  await Server.findOne({
    where: { id: id },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["kode"] = val.kode;
      list["name"] = val.name;
      list["status"] = val.status;
    }
  });
  return list;
};

module.exports = helper;
