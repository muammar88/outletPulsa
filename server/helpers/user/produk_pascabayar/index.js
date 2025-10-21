const { Op, Kategori, Produk_pascabayar } = require("../../../db/models");
const helper = {};

helper.check_kategori = async (value, {}) => {
  if (value == 0) {
    throw new Error("Anda wajib memilih salah satu kategori.");
  } else {
    check = await Kategori.findOne({
      where: { id: value },
    });
    if (!check) {
      throw new Error("Id Kategori Tidak Terdaftar Dipangkalan Data.");
    }
  }
  return true;
};

helper.check_kode = async (value, { req }) => {
  var body = req.body;
  if (body.id) {
    var check = await Produk_pascabayar.findOne({
      where: { name: value, id: { [Op.ne]: body.id } },
    });
  } else {
    var check = await Produk_pascabayar.findOne({
      where: { name: value },
    });
  }
  if (check) {
    throw new Error("Kode Produk_pascabayar Sudah Terdaftar Dipangkalan Data.");
  }

  return true;
};

helper.check_id = async (value) => {
  var check = await Produk_pascabayar.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("ID Produk Pascabayar Tidak Terdaftar Dipangkalan Data.");
  }

  return true;
};

helper.info_produk_pascabayar = async (id) => {
  var list = {};
  await Produk_pascabayar.findOne({
    where: { id: id },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["kode"] = val.kode;
      list["name"] = val.name;
      list["markup"] = val.outletFee;
    }
  });
  return list;
};

module.exports = helper;
