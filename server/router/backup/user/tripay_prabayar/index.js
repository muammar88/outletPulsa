const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/tripay_prabayar/index");
const helper = require("../../../helpers/user/tripay_prabayar/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Tripay_prabayar/server_side",
  [verify_session],
  body("operator")
    .notEmpty()
    .withMessage("Operator ID Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_operator_id),
  body("active")
    .notEmpty()
    .withMessage("Status Aktif Tidak Boleh Kosong")
    .trim()
    .isIn(["active", "inactive"])
    .withMessage("Status Aktif tidak ditemukan"),
  body("koneksi")
    .notEmpty()
    .withMessage("Koneksi Tidak Boleh Kosong")
    .trim()
    .isIn(["semua", "sudah_konek", "belum_konek"])
    .withMessage("Status Koneksi tidak ditemukan"),
  controllers.server_side
);

router.get(
  "/Users/Tripay_prabayar/get_operator_tripay",
  [verify_session],
  controllers.get_operator_tripay
);

router.get(
  "/Users/Tripay_prabayar/update_produk_prabayar_tripay",
  [verify_session],
  controllers.update_produk_prabayar_tripay
);

router.post(
  "/Users/Tripay_prabayar/delete_koneksi",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk Tripay Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete_koneksi
);

router.post(
  "/Users/Tripay_prabayar/info_sinkronisasi_produk_tripay",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk Tripay Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_sinkronisasi_produk_tripoay
);
// Users/Tripay_prabayar/sinkronisasi_produk_tripay
router.post(
  "/Users/Tripay_prabayar/sinkronisasi_produk_tripay",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk Tripay Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("produk")
    .notEmpty()
    .withMessage("ID Produk Tripay Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_produk_id),
  controllers.sinkronisasi_produk_tripay
);

module.exports = router;
