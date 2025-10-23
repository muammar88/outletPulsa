const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/riwayat_transfer_saldo/index");
const helper = require("../../../helpers/user/riwayat_transfer_saldo/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Riwayat_transfer_saldo/server_side",
  [verify_session],
  controllers.server_side
);

router.post(
  "/Users/Riwayat_transfer_saldo/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Riwayat Transfer Saldo Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

module.exports = router;
