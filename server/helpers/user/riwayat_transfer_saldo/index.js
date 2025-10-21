const { Op, Transaction } = require("../../../db/models");

const helper = {};

helper.check_id = async (value) => {
  check = await Transaction.findOne({
    where: {
      id: value,
      tipe: { [Op.in]: ["transfer_saldo", "terima_saldo"] },
    },
  });
  if (!check) {
    throw new Error(
      "Id Riwayat Transfer Saldo Tidak Terdaftar Dipangkalan Data."
    );
  }
  return true;
};

module.exports = helper;
