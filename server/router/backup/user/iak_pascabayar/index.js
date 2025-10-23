const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/iak_pascabayar/index");
const helper = require("../../../helpers/user/iak_pascabayar/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Iak_pascabayar/server_side",
  [verify_session],
  body("tipe")
    .notEmpty()
    .withMessage("Operator ID Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_tipe_id),
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
  "/Users/Iak_pascabayar/get_tipe_iak",
  [verify_session],
  controllers.get_tipe_iak
);

// update_produk_pascabayar_iak
router.get(
  "/Users/Iak_pascabayar/update_produk_pascabayar_iak",
  [verify_session],
  controllers.update_produk_pascabayar_iak
);

router.post(
  "/Users/Iak_pascabayar/delete_koneksi",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk Pascabayar IAK Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete_koneksi
);

router.post(
  "/Users/Iak_pascabayar/info_sinkronisasi_produk_pascabayar_iak",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk IAK Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_sinkronisasi_produk_pascabayar_iak
);

router.post(
  "/Users/Iak_pascabayar/sinkronisasi_produk_pascabayar_iak",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk IAK Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("produk")
    .notEmpty()
    .withMessage("ID Produk Pascabayar IAK Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_produk_id),
  controllers.sinkronisasi_produk_pascabayar_iak
);

// router.post(
//   "/Users/Daftar_server/delete",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Server Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.delete
// );

// // info_edit_server
// router.post(
//   "/Users/Daftar_server/info_edit_server",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Server Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.info_edit_server
// );

// router.post(
//   "/Users/Daftar_server/update",
//   [verify_token],
//   body("id").trim().custom(helper.check_id),
//   body("kode")
//     .notEmpty()
//     .withMessage("Kode Server Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_kode_server),
//   body("name").notEmpty().trim().withMessage("Nama Server Tidak Boleh Kosong"),
//   controllers.update
// );

// router.post(
//   "/Users/Daftar_server/info_status_server",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Server Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.info_status_server
// );

// router.post(
//   "/Users/Daftar_server/change_status_server",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Server Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   body("status")
//     .notEmpty()
//     .withMessage("Status Tidak Boleh Kosong")
//     .trim()
//     .isIn(["active", "inactive"])
//     .withMessage("Status Server tidak ditemukan"),
//   controllers.change_status_server
// );

module.exports = router;
