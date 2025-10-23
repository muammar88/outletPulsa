const express = require("express");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/riwayat_validasi_seller/index");
const helper = require("../../../helpers/user/riwayat_validasi_seller/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Riwayat_validasi_seller/server_side",
  [verify_session],
  controllers.server_side
);

router.post(
  "/Users/Riwayat_validasi_seller/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Riwayat Validasi Seller Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

// router.post(
//   "/Users/Riwayat_validasi_seller/delete",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Riwayat Validasi Seller Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.delete
// );

// validasi_seller
// router.get(
//   "/Users/Tes_produk/info_saldo_digiflaz",
//   [verify_session],
//   controllers.info_saldo_digiflaz
// );

// router.get(
//   "/Users/Tes_produk/info_tes",
//   [verify_session],
//   controllers.info_tes
// );

// router.post(
//   "/Users/Tes_produk/get_produk_seller",
//   [verify_token],
//   body("seller_id")
//     .notEmpty()
//     .withMessage("ID Seller Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_seller_id),
//   controllers.get_produk_seller
// );

// // blok_seller_transaksi_tes
// router.post(
//   "/Users/Tes_produk/blok_seller_transaksi_tes",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Seller Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.blok_seller_transaksi_tes
// );

module.exports = router;
