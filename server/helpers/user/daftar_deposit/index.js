const { Op, Transaction } = require("../../../db/models");

const helper = {};

helper.check_id = async (value) => {
  check = await Transaction.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Transaction Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.info_transaction = async (id) => {
  var list = {};
  await Transaction.findOne({
    where: { id: id, tipe: "deposit" },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["kode"] = val.kode;
      list["saldo_before"] = val.saldo_before;
      list["saldo_after"] = val.saldo_after;
    }
  });
  return list;
};

module.exports = helper;
