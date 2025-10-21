const {
  Tripay_prabayar_produk,
  Tripay_prabayar_operator,
  Produk_prabayar,
} = require("../../../db/models");

const helper = {};

helper.check_operator_id = async (value) => {
  if (value != 0) {
    check = await Tripay_prabayar_operator.findOne({
      where: { id: value },
    });
    if (!check) {
      throw new Error("Operator ID Tidak Terdaftar Dipangkalan Data.");
    }
  }
  return true;
};

helper.check_id = async (value) => {
  check = await Tripay_prabayar_produk.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("ID Produk Tripay Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.info = async (id) => {
  var list = {};
  await Tripay_prabayar_produk.findOne({
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

helper.info_produk = async (id) => {
  var list = {};
  await Produk_prabayar.findOne({
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

helper.check_produk_id = async (id) => {
  var check = await Tripay_prabayar_produk.findOne({
    where: { produk_id: id },
  });
  if (!check) {
    var check_to = await Produk_prabayar.findOne({
      where: { id: id },
    });
    if (!check_to) {
      throw new Error("ID Produk Tidak Terdaftar Dipangkalan Data.");
    }
  } else {
    throw new Error(
      "ID Produk ini sudah terkoneksi dengan produk Tripay yang lain."
    );
  }
  return true;
};

module.exports = helper;
