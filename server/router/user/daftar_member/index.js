const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../../../controllers/user/daftar_member/index");
const helper = require("../../../helpers/user/daftar_member/index");

//------MIDDLEWARE-----//
const {
  verify_session,
  verify_token,
} = require("../../../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.post(
  "/Users/Daftar_member/server_side",
  [verify_session],
  controllers.server_side
);

router.post(
  "/Users/Daftar_member/delete",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("ID Member Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.delete
);

router.post(
  "/Users/Daftar_member/info_edit",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Member Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_edit
);

router.post(
  "/Users/Daftar_member/update",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Member Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.update
);

router.post(
  "/Users/Daftar_member/become_agen",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Member Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.become_agen
);

router.post(
  "/Users/Daftar_member/info_transfer_saldo",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Member Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  controllers.info_transfer_saldo
);

router.post(
  "/Users/Daftar_member/transfer_saldo",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Member Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("target_transfer")
    .notEmpty()
    .withMessage("Target Transfer Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_target_transfer),
  body("saldo_yang_ditransfer")
    .notEmpty()
    .withMessage("Saldo Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_saldo_not_null),
  controllers.transfer_saldo
);

router.post(
  "/Users/Daftar_member/tambah_saldo_member",
  [verify_token],
  body("id")
    .notEmpty()
    .withMessage("Id Member Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_id),
  body("nominal")
    .notEmpty()
    .withMessage("Nominal Saldo Tidak Boleh Kosong")
    .trim()
    .custom(helper.check_saldo_member_not_null),
  controllers.tambah_saldo_member
);
// tambah_saldo_member

//

// ("router/user");

// Daftar_member / update;

module.exports = router;
