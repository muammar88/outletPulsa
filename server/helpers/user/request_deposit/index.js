const { Request_deposit, Member } = require("../../../db/models");

const helper = {};

helper.check_id = async (value) => {
  check = await Request_deposit.findOne({
    where: { id: value },
  });
  if (!check) {
    throw new Error("Request Deposit ID Tidak Terdaftar Dipangkalan Data.");
  }

  return true;
};

helper.info_request_deposit = async (id) => {
  var list = {};
  await Request_deposit.findOne({
    where: { id: id },
    include: {
      required: true,
      model: Member,
      attributes: ["saldo", "biaya_admin"],
    },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["kode"] = val.kode;
      list["nominal"] = val.nominal;
      list["nominal_tambahan"] = val.nominal_tambahan;
      list["member_id"] = val.member_id;
      list["saldo_member"] = val.Member.saldo;
      list["biaya_admin_member"] =
        val.Member.biaya_admin == null ? 0 : val.Member.biaya_admin;
      list["biaya_admin_request"] = val.biaya_admin;
    }
  });
  return list;
};

// helper.check_kategori_id = async (id) => {
//   if (id != 0) {
//     var check = await Kategori.findOne({
//       where: { id: id },
//     });
//     if (!check) {
//       throw new Error("ID Kategori Tidak Terdaftar Dipangkalan Data.");
//     }
//   }

//   return true;
// };

// helper.check_produk_id = async (id) => {
//   var check = await Produk_prabayar.findOne({
//     where: { id: id },
//   });
//   if (!check) {
//     throw new Error("ID Produk Tidak Terdaftar Dipangkalan Data.");
//   }
//   return true;
// };

// helper.check_kategori_id = async (id) => {
//   if (id != 0) {
//     var check = await Kategori.findOne({
//       where: { id: id },
//     });
//     if (!check) {
//       throw new Error("ID Kategori Tidak Terdaftar Dipangkalan Data.");
//     }
//   }

//   return true;
// };

// helper.check_operator_id_produk_prabayar = async (operator_id) => {
//   var check = await Operator.findOne({
//     where: { id: operator_id },
//   });
//   if (!check) {
//     throw new Error("ID Operator Tidak Terdaftar Dipangkalan Data.");
//   }
//   return true;
// };

// helper.check_kode_produk_prabayar = async (kode, { req }) => {
//   var body = req.body;
//   if (body.id) {
//     var check = await Produk_prabayar.findOne({
//       where: { kode: kode, id: { [Op.ne]: body.id } },
//     });
//   } else {
//     var check = await Produk_prabayar.findOne({
//       where: { kode: kode },
//     });
//   }
//   if (check) {
//     throw new Error("Kode Produk Prabayar Sudah Terdaftar Dipangkalan Data.");
//   }
//   return true;
// };

// helper.server_price = async (id, server_id) => {
//   var price = 0;
//   if (server_id == 1) {
//     await Iak_prabayar_produk.findOne({
//       where: { produk_id: id },
//     }).then(async (val) => {
//       if (val) {
//         price = val.price;
//       }
//     });
//   } else if (server_id == 2) {
//     await Tripay_prabayar_produk.findOne({
//       where: { produk_id: id },
//     }).then(async (val) => {
//       if (val) {
//         price = val.price;
//       }
//     });
//   } else if (server_id == 3) {
//     await Digiflazz_product.findOne({
//       where: { produk_id: id },
//     }).then(async (val) => {
//       if (val) {
//         price = val.selectedSellerPrice;
//       }
//     });
//   }
//   return price;
// };

module.exports = helper;
