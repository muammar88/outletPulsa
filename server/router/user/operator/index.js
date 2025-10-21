const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/operator/index");
const helper = require("../../../helpers/user/operator/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Operator/server_side",
  [verify_session],
  controllers.server_side
);

router.post(
  "/Users/Operator/tambah_operator",
  [verify_token],
  body("kode")
    .notEmpty()
    .withMessage("Kode Operator Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_kode),
  body("name")
    .notEmpty()
    .withMessage("Name Operator Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_name),
  controllers.add_operator
);

router.post(
  "/Users/Operator/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Operator Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

router.post(
  "/Users/Operator/info_edit",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Operator Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_edit
);

router.post(
  "/Users/Operator/update",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Operator Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("kode")
    .notEmpty()
    .withMessage("Kode Operator Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_kode),
  body("name")
    .notEmpty()
    .withMessage("Name Operator Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_name),
  controllers.update
);

module.exports = router;
