const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/digiflaz_prabayar/index");
const helper = require("../../../helpers/user/digiflaz_prabayar/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Digiflaz_prabayar/server_side",
  [verify_session],
  body("type")
    .notEmpty()
    .withMessage("Tipe ID Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_tipe_id),
  body("brand")
    .notEmpty()
    .withMessage("Brand ID Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_brand_id),
  body("kategori")
    .notEmpty()
    .withMessage("Brand ID Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_kategori_id),
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
  "/Users/Digiflaz_prabayar/get_param_digiflaz",
  [verify_session],
  controllers.get_param_digiflaz
);

//
router.get(
  "/Users/Digiflaz_prabayar/update_produk_digiflazz_prabayar",
  [verify_session],
  controllers.update_produk_digiflazz_prabayar
);

router.post(
  "/Users/Digiflaz_prabayar/get_info_pilih_seller_manual",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Digiflaz Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.get_info_pilih_seller_manual
);

// Digiflaz_prabayar/pilih_seller_manual
router.post(
  "/Users/Digiflaz_prabayar/pilih_seller_manual",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Digiflaz Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.pilih_seller_manual
);

router.post(
  "/Users/Digiflaz_prabayar/delete_koneksi_digiflaz",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Digiflaz Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete_koneksi_digiflaz
);

// info_sinkronisasi_produk_digiflaz

router.post(
  "/Users/Digiflaz_prabayar/info_sinkronisasi_produk_digiflaz",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Digiflaz Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_sinkronisasi_produk_digiflaz
);

//

router.post(
  "/Users/Digiflaz_prabayar/sinkronisasi_produk_digiflaz",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk Digiflaz Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("produk")
    .notEmpty()
    .withMessage("ID Produk Outlet Pulsa Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_produk_id),
  controllers.sinkronisasi_produk_digiflaz
);

module.exports = router;
