const { Op, Otp } = require("../../../db/models");
const helper = {};

helper.check_id = async (value) => {
  check = await Otp.findOne({
    where: { id: value, type: "login" },
  });
  if (!check) {
    throw new Error("Id Otp Login Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

helper.info_otp_pendaftaran = async (id) => {
  var list = {};
  await Otp.findOne({
    where: { id: id, type: "login" },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["nomor_tujuan"] = val.nomor_tujuan;
      list["otp"] = val.otp;
    }
  });
  return list;
};

// helper.check_kode = async (value, { req }) => {
//   var body = req.body;
//   if (body.id) {
//     var check = await Operator.findOne({
//       where: { name: value, id: { [Op.ne]: body.id } },
//     });
//   } else {
//     var check = await Operator.findOne({
//       where: { name: value },
//     });
//   }
//   if (check) {
//     throw new Error("Kode Operator Sudah Terdaftar Dipangkalan Data.");
//   }

//   return true;
// };

// helper.check_name = async (value, { req }) => {
//   var body = req.body;
//   if (body.id) {
//     var check = await Operator.findOne({
//       where: { name: value, id: { [Op.ne]: body.id } },
//     });
//   } else {
//     var check = await Operator.findOne({
//       where: { name: value },
//     });
//   }
//   if (check) {
//     throw new Error("Nama Operator Sudah Terdaftar Dipangkalan Data.");
//   }

//   return true;
// };

module.exports = helper;
