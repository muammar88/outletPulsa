// const { Transaction } = require("sequelize");
const { Agen, Riwayat_fee_agen, Transaction } = require("../db/models");

const helper = {};

helper.randomString = async (length, chars) => {
  var result = "";
  for (var i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
};

helper.generate_agen_code = async () => {
  var rand = 0;
  let condition = true;
  while (condition) {
    rand = await helper.randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    check = await Agen.findOne({ where: { kode: rand } });
    if (!check) condition = false;
  }
  return rand;
};

helper.generate_pembayaran_fee_agen = async () => {
  var rand = 0;
  let condition = true;
  while (condition) {
    rand = await helper.randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    check = await Riwayat_fee_agen.findOne({ where: { kode: rand } });
    if (!check) condition = false;
  }
  return rand;
};

helper.generate_transaction_code = async () => {
  var rand = 0;
  let condition = true;
  while (condition) {
    rand = await helper.randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
    check = await Transaction.findOne({ where: { kode: rand } });
    if (!check) condition = false;
  }
  return rand;
};

// helper.genBankCode = async () => {
//   var rand = 0;
//   let condition = true;
//   while (condition) {
//     rand = await helper.randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
//     check = await Bank.findOne({ where: { code: rand } });
//     if (!check) condition = false;
//   }
//   return rand;
// };

// helper.genPenggunaCode = async () => {
//   var rand = 0;
//   let condition = true;
//   while (condition) {
//     rand = await helper.randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
//     check = await Company_staff.findOne({ where: { code: rand } });
//     if (!check) condition = false;
//   }
//   return rand;
// };

// helper.getInvoiceCodeDepositUmrah = async () => {
//   var rand = 0;
//   let condition = true;
//   while (condition) {
//     rand = await helper.randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
//     check = await Deposit_umrah.findOne({ where: { transaction_code: rand } });
//     if (!check) condition = false;
//   }
//   return rand;
// };

// helper.genPaketCode = async () => {
//   var rand = 0;
//   let condition = true;
//   while (condition) {
//     rand = await helper.randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
//     check = await Paket.findOne({ where: { code: rand } });
//     if (!check) condition = false;
//   }
//   return rand;
// };

// helper.genInvoiceKasKeluarMasuk = async () => {
//   var rand = 0;
//   let condition = true;
//   while (condition) {
//     rand = await helper.randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
//     check = await Kas_keluar_masuk.findOne({ where: { invoice: rand } });
//     if (!check) condition = false;
//   }
//   return rand;
// };

// helper.genInvoiceTransaksiVisa = async () => {
//   var rand = 0;
//   let condition = true;
//   while (condition) {
//     rand = await helper.randomString(6, "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ");
//     check = await Visa_transaction.findOne({ where: { invoice: rand } });
//     if (!check) condition = false;
//   }
//   return rand;
// };
module.exports = helper;
