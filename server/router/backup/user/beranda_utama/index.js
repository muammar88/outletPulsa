const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/beranda_utama/index");
const helper = require("../../../helpers/user/beranda_utama/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.get(
  "/Users/Beranda_utama/get_saldo_iak",
  [verify_session],
  controllers.get_saldo_iak
);

router.get(
  "/Users/Beranda_utama/get_saldo_tripay",
  [verify_session],
  controllers.get_saldo_tripay
);

router.get(
  "/Users/Beranda_utama/get_saldo_digiflaz",
  [verify_session],
  controllers.get_saldo_digiflaz
);

router.get(
  "/Users/Beranda_utama/get_transaksi_hari_ini",
  [verify_session],
  controllers.get_transaksi_hari_ini
);

router.get(
  "/Users/Beranda_utama/get_member_baru_hari_ini",
  [verify_session],
  controllers.get_member_baru_hari_ini
);

router.get(
  "/Users/Beranda_utama/total_member",
  [verify_session],
  controllers.total_member
);

//

// router.get(
//   "/Users/Bank_transfer/info_add",
//   [verify_token],
//   controllers.info_add
// );

// router.post(
//   "/Users/Bank_transfer/add",
//   [verify_token],
//   body("bank_transfer")
//     .notEmpty()
//     .withMessage("ID Bank Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_bank_id),
//   body("nomor").notEmpty().withMessage("Id Agen Tidak Boleh Kosong").trim(),
//   body("name").notEmpty().withMessage("Nama Tidak Boleh Kosong").trim(),
//   body("biaya_admin")
//     .notEmpty()
//     .withMessage("Biaya Admin Tidak Boleh Kosong")
//     .trim(),
//   controllers.add
// );

// router.post(
//   "/Users/Bank_transfer/delete",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Bank Transfer Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.delete
// );

// router.post(
//   "/Users/Bank_transfer/info_edit",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Bank Transfer Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.info_edit
// );

// router.post(
//   "/Users/Bank_transfer/update",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Bank Transfer Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.update
// );

// info_add

// body("id")
//   .notEmpty()
//   .withMessage("Id Agen Tidak Boleh Kosong")
//   .trim()
//   .custom(helper.check_id),

// router.post(
//   "/Users/Daftar_agen/info_add_kostumer_agen",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Agen Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.info_add_kostumer_agen
// );

// router.post(
//   "/Users/Daftar_agen/info_pembayaran_fee_agen",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Agen Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.info_pembayaran_fee_agen
// );

// router.post(
//   "/Users/Daftar_agen/pembayaran_fee_agen",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Agen Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   body("withdraw_type")
//     .notEmpty()
//     .withMessage("Tipe withdraw type Tidak Boleh Kosong")
//     .isIn(["withdraw_cash", "withdraw_saldo"])
//     .withMessage("Tipe withdraw tidak ditemukan"),
//   body("fee")
//     .notEmpty()
//     .withMessage("Pembayaran Fee Agen Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.currency_not_null),
//   controllers.pembayaran_fee_agen
// );

//
module.exports = router;

//
