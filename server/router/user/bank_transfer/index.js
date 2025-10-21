const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/bank_transfer/index");
const helper = require("../../../helpers/user/bank_transfer/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Bank_transfer/server_side",
  [verify_session],
  controllers.server_side
);

router.get(
  "/Users/Bank_transfer/info_add",
  [verify_token],
  controllers.info_add
);

router.post(
  "/Users/Bank_transfer/add",
  [verify_token],
  body("bank_transfer")
    .notEmpty()
    .withMessage("ID Bank Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_bank_id),
  body("nomor").notEmpty().withMessage("Id Agen Tidak Boleh Kosong").trim(),
  body("name").notEmpty().withMessage("Nama Tidak Boleh Kosong").trim(),
  body("biaya_admin")
    .notEmpty()
    .withMessage("Biaya Admin Tidak Boleh Kosong")
    .trim(),
  controllers.add
);

router.post(
  "/Users/Bank_transfer/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Bank Transfer Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

router.post(
  "/Users/Bank_transfer/info_edit",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Bank Transfer Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_edit
);

router.post(
  "/Users/Bank_transfer/update",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Bank Transfer Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.update
);

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
