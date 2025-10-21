const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/produk_pascabayar/index");
const helper = require("../../../helpers/user/produk_pascabayar/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Produk_pascabayar/server_side",
  [verify_session],
  controllers.server_side
);

router.get(
  "/Users/Produk_pascabayar/get_param_produk_pascabayar",
  [verify_session],
  controllers.get_param_produk_pascabayar
);

router.get(
  "/Users/Produk_pascabayar/get_info_add_produk_pascabayar",
  [verify_session],
  controllers.get_info_add_produk_pascabayar
);

router.post(
  "/Users/Produk_pascabayar/add",
  [verify_token],
  body("kategori")
    .notEmpty()
    .withMessage("ID Kategori Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_kategori),
  body("kode")
    .notEmpty()
    .withMessage("Kode Produk Pascabayar Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_kode),
  body("name")
    .notEmpty()
    .withMessage("Name Produk Pascabayar Tidak Boleh Kosong")
    .trim(),
  controllers.add
);

router.post(
  "/Users/Produk_pascabayar/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Produk Pascabayar Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

router.post(
  "/Users/Produk_pascabayar/get_info_edit_produk_pascabayar",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Produk Pascabayar Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_edit
);

router.post(
  "/Users/Produk_pascabayar/update",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Produk Pascabayar Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("kategori")
    .notEmpty()
    .withMessage("ID Kategori Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_kategori),
  body("kode")
    .notEmpty()
    .withMessage("Kode Produk Pascabayar Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_kode),
  body("name")
    .notEmpty()
    .withMessage("Name Produk Pascabayar Tidak Boleh Kosong")
    .trim(),
  controllers.update
);

router.post(
  "/Users/Produk_pascabayar/get_info_markup_produk_pascabayar",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Produk Pascabayar Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.get_info_markup_produk_pascabayar
);

router.post(
  "/Users/Produk_pascabayar/update_markup",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Produk Pascabayar Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("markup").notEmpty().withMessage("Markup Tidak Boleh Kosong").trim(),
  controllers.update_markup
);

router.post(
  "/Users/Produk_pascabayar/update_markup_all_produk",
  [verify_token],
  body("nominal_1")
    .notEmpty()
    .withMessage("Nominal Markup 1 - 1.000 Tidak Boleh Kosong")
    .trim(),
  body("nominal_2")
    .notEmpty()
    .withMessage("Nominal Markup 1.001 - 2.000 Tidak Boleh Kosong")
    .trim(),
  body("nominal_3")
    .notEmpty()
    .withMessage("Nominal Markup > 2.001 Tidak Boleh Kosong")
    .trim(),
  controllers.update_markup_all_produk
);

//.
router.get(
  "/Users/Produk_pascabayar/update_harga_produk_pascabayar",
  [verify_session],
  controllers.update_harga_produk_pascabayar
);

module.exports = router;
