const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/riwayat_fee_agen/index");
const helper = require("../../../helpers/user/riwayat_fee_agen/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Riwayat_fee_agen/server_side",
  [verify_session],
  controllers.server_side
);

router.post(
  "/Users/Riwayat_fee_agen/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Riwayat Fee Agen Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

// router.post(
//   "/Users/Daftar_agen/info_add_kostumer_agen",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Agen Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   controllers.info_add_kostumer_agen
// );

// router.post(
//   "/Users/Daftar_agen/add_kostumer_agen",
//   [verify_token],
//   body("id")
//     .notEmpty()
//     .withMessage("Id Agen Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.check_id),
//   body("kostumer")
//     .notEmpty()
//     .withMessage("Id Kostumer Tidak Boleh Kosong")
//     .trim()
//     .custom(helper.kostumer_id),
//   controllers.add_kostumer_agen
// );

module.exports = router;
