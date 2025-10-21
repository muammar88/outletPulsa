const { Op, Member } = require("../../../db/models");
const { hideCurrency } = require("../../currency");

const helper = {};

helper.info = async (id) => {
  var list = {};
  await Member.findOne({
    where: { id: id },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["fullname"] = val.fullname;
      list["whatsapp_number"] = val.whatsapp_number;
      list["saldo"] = val.saldo;
    }
  });
  return list;
};

helper.info_by_kode = async (kode) => {
  var list = {};
  await Member.findOne({
    where: { kode: kode },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["fullname"] = val.fullname;
      list["whatsapp_number"] = val.whatsapp_number;
    }
  });
  return list;
};

helper.check_id = async (value) => {
  check = await Member.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Member Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.check_target_transfer = async (value, { req }) => {
  var body = req.body;
  const check = await Member.findOne({
    where: { [Op.and]: [{ id: value }, { id: { [Op.ne]: body.id } }] },
  });
  if (!check) {
    throw new Error("Id Target Transfer Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.check_saldo_not_null = async (value, { req }) => {
  const info_member = helper.info(req.body.id);
  const currency = await hideCurrency(value);
  if (currency <= 0) {
    throw new Error("Nominal yang ditransfer tidak boleh Rp 0");
  } else {
    if (info_member.saldo < currency) {
      throw new Error(
        "Nominal saldo yang ditransfer tidak boleh lebih besar dari saldo member yang tersedia."
      );
    }
  }
  return true;
};

helper.check_saldo_member_not_null = async (value) => {
  const currency = await hideCurrency(value);
  if (currency <= 0) {
    throw new Error("Nominal saldo yang ditambahkan tidak boleh Rp 0.");
  }
  return true;
};

module.exports = helper;
