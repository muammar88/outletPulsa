const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/iak_prabayar/index");
const helper = require("../../../helpers/user/iak_prabayar/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Iak_prabayar/server_side",
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
  "/Users/Iak_prabayar/get_operator_iak",
  [verify_session],
  controllers.get_operator_iak
);

router.get(
  "/Users/Iak_prabayar/update_produk_prabayar_iak",
  [verify_session],
  controllers.update_produk_prabayar_iak
);

router.post(
  "/Users/Iak_prabayar/delete_koneksi",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk IAK Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete_koneksi
);

router.post(
  "/Users/Iak_prabayar/info_sinkronisasi_produk_iak",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk IAK Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_sinkronisasi_produk_iak
);

router.post(
  "/Users/Iak_prabayar/sinkronisasi_produk_iak",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk IAK Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("produk")
    .notEmpty()
    .withMessage("ID Produk Outlet Pulsa Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_produk_id),
  controllers.sinkronisasi_produk_iak
);

module.exports = router;
