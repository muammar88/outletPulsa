const express = require("express");
const sharp = require("sharp");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/daftar_deposit/index");
const helper = require("../../../helpers/user/daftar_deposit/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Daftar_deposit/server_side",
  [verify_session],
  controllers.server_side
);

router.post(
  "/Users/Daftar_deposit/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Deposit Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

module.exports = router;
