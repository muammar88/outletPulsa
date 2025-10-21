const express = require("express");
const sharp = require("sharp");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/daftar_bank/index");
const helper = require("../../../helpers/user/daftar_bank/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

// FILE
var multer = require("multer");

// define storage bank
var storage_bank = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "./public/img/bank");
  },
  filename: function (req, file, callback) {
    callback(null, Date.now() + path.extname(file.originalname));
  },
});

router.post(
  "/Users/Daftar_bank/server_side",
  [verify_session],
  controllers.server_side
);

router.post(
  "/Users/Daftar_bank/add",
  [verify_token],
  multer({ storage: storage_bank }).single("photo"),
  body("kode")
    .notEmpty()
    .withMessage("Kode Tidak Boleh Kosong")
    .trim()
    .custom(helper.kode),
  body("name").notEmpty().withMessage("Nama Tidak Boleh Kosong").trim(),
  controllers.add
);

router.post(
  "/Users/Daftar_bank/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Bank Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

router.post(
  "/Users/Daftar_bank/info_edit",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Bank Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_edit
);

router.post(
  "/Users/Daftar_bank/update",
  [verify_token],
  multer({ storage: storage_bank }).single("photo"),
  body("id")
    .notEmpty()
    .withMessage("Id Bank Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("kode")
    .notEmpty()
    .withMessage("Kode Tidak Boleh Kosong")
    .trim()
    .custom(helper.kode),
  body("name").notEmpty().withMessage("Nama Tidak Boleh Kosong").trim(),
  controllers.update
);

module.exports = router;
