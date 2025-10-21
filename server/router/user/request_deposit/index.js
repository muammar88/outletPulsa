const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/request_deposit/index");
const helper = require("../../../helpers/user/request_deposit/index");
// const { format } = require("@fast-csv/format");
// var Excel = require("exceljs");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Request_deposit/server_side",
  [verify_session],
  body("search").trim(),
  controllers.server_side
);

router.post(
  "/Users/Request_deposit/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Request Deposit Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

//
router.post(
  "/Users/Request_deposit/tolak",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Request Deposit Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.tolak
);

router.post(
  "/Users/Request_deposit/setuju",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Request Deposit Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.setuju
);

//

// router.get(
//   "/Users/Produk_prabayar/get_param_produk_prabayar",
//   [verify_session],
//   controllers.get_param_produk_prabayar
// );

// router.post(
//   "/Users/Produk_prabayar/get_operator_produk",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Kategori Produk Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_kategori_id),
//   controllers.get_operator_produk
// );

// router.post(
//   "/Users/Produk_prabayar/ubah_urutan",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Produk Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_produk_id),
//   body("urutan")
//     .notEmpty()
//     .withMessage("Urutan Produk Tidak Boleh Kosong")
//     .trim(),
//   controllers.ubah_urutan
// );

// router.get(
//   "/Users/Produk_prabayar/get_info_add_produk",
//   [verify_session],
//   controllers.get_info_add_produk
// );

// router.post(
//   "/Users/Produk_prabayar/get_info_add_operator_by_kategori",
//   [verify_token],
//   body("kategori_id")
//     .notEmpty()
//     .withMessage("ID Kategori Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_kategori_id),
//   controllers.get_info_add_operator_by_kategori
// );

// router.post(
//   "/Users/Produk_prabayar/add_produk_prabayar",
//   [verify_token],
//   body("operator")
//     .notEmpty()
//     .withMessage("ID Operator Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_operator_id_produk_prabayar),
//   body("kode")
//     .notEmpty()
//     .withMessage("Kode Produk Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_kode_produk_prabayar),
//   body("name").notEmpty().withMessage("Nama Produk Tidak Boleh Kosong").trim(),
//   controllers.add_produk_prabayar
// );

// router.post(
//   "/Users/Produk_prabayar/get_daftar_server_terkoneksi",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Produk Prabayar Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_produk_id),
//   controllers.get_daftar_server_terkoneksi
// );

// router.post(
//   "/Users/Produk_prabayar/pilih_server_manual",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Produk Prabayar Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_produk_id),
//   body("server_id")
//     .notEmpty()
//     .withMessage("Server ID Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_server_id),
//   controllers.pilih_server_manual
// );

// router.post(
//   "/Users/Produk_prabayar/get_info_edit_produk_prabayar",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Produk Prabayar Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_produk_id),
//   controllers.get_info_edit_produk_prabayar
// );

// router.post(
//   "/Users/Produk_prabayar/update_produk_prabayar",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Produk Prabayar Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_produk_id),
//   body("operator")
//     .notEmpty()
//     .withMessage("ID Operator Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_operator_id_produk_prabayar),
//   body("kode")
//     .notEmpty()
//     .withMessage("Kode Produk Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_kode_produk_prabayar),
//   body("name").notEmpty().withMessage("Nama Produk Tidak Boleh Kosong").trim(),
//   controllers.update_produk_prabayar
// );

// router.post(
//   "/Users/Produk_prabayar/get_info_markup_produk_prabayar",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Produk Prabayar Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_produk_id),
//   controllers.get_info_markup_produk_prabayar
// );

// router.post(
//   "/Users/Produk_prabayar/update_markup_produk_prabayar",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("ID Produk Prabayar Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_produk_id),
//   body("markup")
//     .notEmpty()
//     .withMessage("ID Produk Prabayar Tidak Boleh Kosong")
//     .trim(),
//   controllers.update_markup_produk_prabayar
// );

// router.get(
//   "/Users/Produk_prabayar/pilih_produk_seller_terbaik",
//   [verify_session],
//   controllers.pilih_produk_seller_terbaik
// );

// router.post(
//   "/Users/Produk_prabayar/markup_produk_prabayar_all",
//   [verify_token],
//   body("nominal_1")
//     .notEmpty()
//     .withMessage("Nominal Markup 1 - 10.000 Tidak Boleh Kosong")
//     .trim(),
//   body("nominal_2")
//     .notEmpty()
//     .withMessage("Nominal Markup 10.001 - 50.000 Tidak Boleh Kosong")
//     .trim(),
//   body("nominal_3")
//     .notEmpty()
//     .withMessage("Nominal Markup 50.001 - 100.000 Tidak Boleh Kosong")
//     .trim(),
//   body("nominal_4")
//     .notEmpty()
//     .withMessage("Nominal Markup 100.001 - 300.000 Tidak Boleh Kosong")
//     .trim(),
//   body("nominal_5")
//     .notEmpty()
//     .withMessage("Nominal Markup 300.001 - 500.000 Tidak Boleh Kosong")
//     .trim(),
//   body("nominal_6")
//     .notEmpty()
//     .withMessage("Nominal Markup Lebih Besar Dari 500.001 Tidak Boleh Kosong")
//     .trim(),
//   controllers.markup_produk_prabayar_all
// );

// router.post(
//   "/Users/Produk_prabayar/download_produk_prabayar",
//   [verify_token],
//   body("kategori").notEmpty().withMessage("Kategori Tidak Boleh Kosong").trim(),
//   body("operator").notEmpty().withMessage("Operator Tidak Boleh Kosong").trim(),
//   body("server").notEmpty().withMessage("Server Tidak Boleh Kosong").trim(),
//   body("koneksi").notEmpty().withMessage("Koneksi Tidak Boleh Kosong").trim(),
//   body("search").trim(),
//   controllers.download_produk_prabayar
// );

// router.get(
//   "/Users/Produk_prabayar/download_excel",
//   [verify_session],
//   controllers.download_excel
// );

module.exports = router;
