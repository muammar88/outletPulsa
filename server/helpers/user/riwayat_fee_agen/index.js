const { Member, Riwayat_fee_agen } = require("../../../db/models");

const helper = {};

helper.check_id = async (value) => {
  check = await Riwayat_fee_agen.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Riwayat Fee Agen Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

module.exports = helper;
