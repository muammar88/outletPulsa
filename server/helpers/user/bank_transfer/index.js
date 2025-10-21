const { Op, Bank, Bank_transfer } = require("../../../db/models");

const helper = {};

helper.check_bank_id = async (value) => {
  check = await Bank.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Bank Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.info_bank = async (id) => {
  var list = {};
  await Bank.findOne({
    where: { id: id },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      // list["kode"] = val.kode;
      // list["name"] = val.name;
      // list["image"] = val.image;
    }
  });
  return list;
};

helper.check_id = async (value) => {
  check = await Bank_transfer.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Bank Transfer Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

module.exports = helper;
