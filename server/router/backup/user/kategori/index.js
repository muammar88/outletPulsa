const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/kategori/index");
const helper = require("../../../helpers/user/kategori/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Kategori/server_side",
  [verify_session],
  controllers.server_side
);

router.post(
  "/Users/Kategori/tambah_kategori",
  [verify_token],
  body("kode")
    .notEmpty()
    .withMessage("Kode Kategori Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_kode),
  body("name")
    .notEmpty()
    .withMessage("Name Kategori Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_name),
  controllers.add_kategori
);

router.post(
  "/Users/Kategori/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Kategori Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

router.post(
  "/Users/Kategori/info_edit",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Kategori Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_edit
);

router.post(
  "/Users/Kategori/update",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Kategori Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("kode")
    .notEmpty()
    .withMessage("Kode Kategori Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_kode),
  body("name")
    .notEmpty()
    .withMessage("Name Kategori Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_name),
  controllers.update
);

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
