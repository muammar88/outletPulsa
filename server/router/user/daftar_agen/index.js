const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/daftar_agen/index");
const helper = require("../../../helpers/user/daftar_agen/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Daftar_agen/server_side",
  [verify_session],
  controllers.server_side
);

router.post(
  "/Users/Daftar_agen/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Agen Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

router.post(
  "/Users/Daftar_agen/info_add_kostumer_agen",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Agen Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_add_kostumer_agen
);

router.post(
  "/Users/Daftar_agen/add_kostumer_agen",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Agen Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("kostumer")
    .notEmpty()
    .withMessage("Id Kostumer Tidak Boleh Kosong")
    .trim()
    .custom(helper.kostumer_id),
  controllers.add_kostumer_agen
);

router.post(
  "/Users/Daftar_agen/info_pembayaran_fee_agen",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Agen Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_pembayaran_fee_agen
);

router.post(
  "/Users/Daftar_agen/pembayaran_fee_agen",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Agen Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("withdraw_type")
    .notEmpty()
    .withMessage("Tipe withdraw type Tidak Boleh Kosong")
    .isIn(["withdraw_cash", "withdraw_saldo"])
    .withMessage("Tipe withdraw tidak ditemukan"),
  body("fee")
    .notEmpty()
    .withMessage("Pembayaran Fee Agen Tidak Boleh Kosong")
    .trim()
    .custom(helper.currency_not_null),
  controllers.pembayaran_fee_agen
);

//
module.exports = router;
