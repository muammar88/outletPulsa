const { Op, Transaction } = require("../../../db/models");

const helper = {};

helper.info = async (id) => {
  var list = {};
  await Transaction.findOne({
    where: {
      id: id,
      tipe: {
        [Op.in]: ["beli_produk_prabayar", "beli_produk_pascabayar"],
      },
    },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["kode"] = val.kode;
      list["tipe"] = val.tipe;
      list["saldo_before"] = val.saldo_before;
      list["saldo_after"] = val.saldo_after;
    }
  });

  return list;
};

helper.check_id = async (value) => {
  check = await Transaction.findOne({
    where: {
      id: value,
      tipe: {
        [Op.in]: ["beli_produk_prabayar", "beli_produk_pascabayar"],
      },
    },
  });
  if (!check) {
    throw new Error("Id Transaksi Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

module.exports = helper;
