const { Op, Kategori } = require("../../../db/models");

const { hideCurrency } = require("../../currency");

const helper = {};

helper.check_id = async (value) => {
  check = await Kategori.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Kategori Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.check_kode = async (value, { req }) => {
  var body = req.body;
  if (body.id) {
    var check = await Kategori.findOne({
      where: { name: value, id: { [Op.ne]: body.id } },
    });
  } else {
    var check = await Kategori.findOne({
      where: { name: value },
    });
  }
  if (check) {
    throw new Error("Kode Kategori Sudah Terdaftar Dipangkalan Data.");
  }

  return true;
};

helper.check_name = async (value, { req }) => {
  var body = req.body;
  if (body.id) {
    var check = await Kategori.findOne({
      where: { name: value, id: { [Op.ne]: body.id } },
    });
  } else {
    var check = await Kategori.findOne({
      where: { name: value },
    });
  }
  if (check) {
    throw new Error("Nama Kategori Sudah Terdaftar Dipangkalan Data.");
  }

  return true;
};

helper.info_kategori = async (id) => {
  var list = {};
  await Kategori.findOne({
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
