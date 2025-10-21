const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/daftar_transaksi_hari_ini/index");
const helper = require("../../../helpers/user/daftar_transaksi_hari_ini/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Daftar_transaksi_hari_ini/server_side",
  [verify_session],
  body("status_transaksi")
    .notEmpty()
    .withMessage("Status Transaksi Tidak Boleh Kosong")
    .trim()
    .isIn(["semua", "sukses", "proses", "gagal"])
    .withMessage("Status Transaksi tidak ditemukan"),
  controllers.server_side
);

router.post(
  "/Users/Daftar_transaksi_hari_ini/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Transaksi Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

// router.post(
//   "/Users/Daftar_server/add_new_server",
//   [verify_token],
//   body("kode")
//     .notEmpty()
//     .withMessage("Kode Server Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_kode_server),
//   body("name").notEmpty().trim().withMessage("Nama Server Tidak Boleh Kosong"),
//   controllers.add_new_server
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
