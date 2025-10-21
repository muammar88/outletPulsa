const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/daftar_seller/index");
const helper = require("../../../helpers/user/daftar_seller/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Daftar_seller/server_side",
  [verify_session],
  body("status_seller")
    .notEmpty()
    .withMessage("Status Seller Tidak Boleh Kosong")
    .trim()
    .isIn(["semua", "terblokir", "tidak_terblokir"])
    .withMessage("Tipe Status Seller tidak ditemukan"),
  controllers.server_side
);

//  { id: "semua", value: "Semua Status" },
//           { id: "terblokir", value: "Terblokir" },
//           { id: "tidak_terblokir", value: "Tidak Terblokir" }

router.post(
  "/Users/Daftar_seller/get_info_rangking_seller",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Seller Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.get_info_rangking_seller
);

router.post(
  "/Users/Daftar_seller/update_rangking_seller",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Seller Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("rangking")
    .notEmpty()
    .withMessage("Rangking Seller Tidak Boleh Kosong")
    .trim()
    .isInt({ min: 1, max: 5 })
    .withMessage("Rangking Diluar Range"),
  controllers.update_rangking_seller
);

router.post(
  "/Users/Daftar_seller/blokir_seller",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Seller Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.blokir_seller
);

router.post(
  "/Users/Daftar_seller/buka_blokir_seller",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Seller Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.buka_blokir_seller
);

router.post(
  "/Users/Daftar_seller/delete_seller",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Seller Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete_seller
);

//

//

//

//

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
//   "/Users/Daftar_agen/add_kostumer_agen",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Agen Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   body("kostumer")
//     .notEmpty()
//     .withMessage("Id Kostumer Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.kostumer_id),
//   controllers.add_kostumer_agen
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
