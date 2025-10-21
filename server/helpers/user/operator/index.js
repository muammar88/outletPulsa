const { Op, Operator } = require("../../../db/models");
const helper = {};

helper.check_id = async (value) => {
  check = await Operator.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Operator Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.check_kode = async (value, { req }) => {
  var body = req.body;
  if (body.id) {
    var check = await Operator.findOne({
      where: { name: value, id: { [Op.ne]: body.id } },
    });
  } else {
    var check = await Operator.findOne({
      where: { name: value },
    });
  }
  if (check) {
    throw new Error("Kode Operator Sudah Terdaftar Dipangkalan Data.");
  }

  return true;
};

helper.check_name = async (value, { req }) => {
  var body = req.body;
  if (body.id) {
    var check = await Operator.findOne({
      where: { name: value, id: { [Op.ne]: body.id } },
    });
  } else {
    var check = await Operator.findOne({
      where: { name: value },
    });
  }
  if (check) {
    throw new Error("Nama Operator Sudah Terdaftar Dipangkalan Data.");
  }

  return true;
};

helper.info_operator = async (id) => {
  var list = {};
  await Operator.findOne({
    where: { id: id },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["kode"] = val.kode;
      list["name"] = val.name;
    }
  });
  return list;
};

module.exports = helper;
