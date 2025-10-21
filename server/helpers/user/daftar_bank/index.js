const { Op, Bank } = require("../../../db/models");

const helper = {};

helper.kode = async (kode, { req }) => {
  const body = req.body;
  if (body.id) {
    var check = await Bank.findOne({
      where: { kode: kode, id: { [Op.ne]: body.id } },
    });
  } else {
    var check = await Bank.findOne({
      where: { kode: kode },
    });
  }
  // checking feedBack
  if (check) {
    throw new Error("Kode Bank Sudah Terdaftar Dipangkalan Data.");
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
      list["kode"] = val.kode;
      list["name"] = val.name;
      list["image"] = val.image;
    }
  });
  return list;
};

helper.check_id = async (value) => {
  check = await Bank.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Bank Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

module.exports = helper;
