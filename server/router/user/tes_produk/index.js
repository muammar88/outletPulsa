const express = require("express");
// const { verify } = require("jsonwebtoken");
// const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/tes_produk/index");
const helper = require("../../../helpers/user/tes_produk/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Tes_produk/server_side",
  [verify_session],
  controllers.server_side
);

router.get(
  "/Users/Tes_produk/info_saldo_digiflaz",
  [verify_session],
  controllers.info_saldo_digiflaz
);

router.get(
  "/Users/Tes_produk/info_tes",
  [verify_session],
  controllers.info_tes
);

router.post(
  "/Users/Tes_produk/get_produk_seller",
  [verify_token],
  body("seller_id")
    .notEmpty()
    .withMessage("ID Seller Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_seller_id),
  controllers.get_produk_seller
);

router.post(
  "/Users/Tes_produk/delete_transaksi_tes",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Seller Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

// blok_seller_transaksi_tes
router.post(
  "/Users/Tes_produk/blok_seller_transaksi_tes",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Seller Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.blok_seller_transaksi_tes
);

router.post(
  "/Users/Tes_produk/validasi_seller",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Seller Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.validasi_seller
);

//

module.exports = router;
