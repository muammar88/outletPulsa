const { Op, Digiflazz_seller } = require("../../../db/models");

const { hideCurrency } = require("../../currency");

const helper = {};

// helper.member_info = async (id) => {
//   var list = {};
//   await Member.findOne({
//     where: { id: id },
//   }).then(async (val) => {
//     if (val) {
//       list["id"] = val.id;
//       list["fullname"] = val.fullname;
//       list["whatsapp_number"] = val.whatsapp_number;
//       list["saldo"] = val.saldo;
//     }
//   });
//   return list;
// };

// helper.info = async (id) => {
//   var list = {};

//   await Agen.findOne({
//     where: { id: id },
//   }).then(async (val) => {
//     if (val) {
//       list["id"] = val.id;
//       list["kode"] = val.kode;
//       list["tipe_agen"] = val.tipe_agen;
//       list["member_id"] = val.member_id;
//       list["fee"] = val.fee;
//     }
//   });

//   await Member.findOne({ where: { id: list["member_id"] } }).then(
//     async (val) => {
//       if (val) {
//         list["fullname"] = val.fullname;
//         list["whatsapp_number"] = val.whatsapp_number;
//         list["saldo"] = val.saldo;
//       }
//     }
//   );

//   return list;
// };

// helper.kostumer_id = async (id) => {
//   check = await Member.findOne({
//     where: { id: id, agen_id: { [Op.is]: null } },
//   });
//   if (!check) {
//     throw new Error("Id Member Tidak Terdaftar Dipangkalan Data.");
//   }
//   return true;
// };

helper.check_id = async (value) => {
  check = await Digiflazz_seller.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Id Seller Tidak Terdaftar Dipangkalan Data.");
  }
  return true;
};

// helper.currency_not_null = async (value) => {
//   var currency = await hideCurrency(value);
//   if (currency <= 0) {
//     throw new Error("Pembayaran Fee Agen Tidak Boleh Rp 0");
//   }
//   return true;
// };

module.exports = helper;
