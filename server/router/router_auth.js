const express = require("express");
const { body } = require("express-validator");
const Controllers = require("../modules/auth/controllers");
const Validation = require("../validation/auth");
const {
  authenticateTokenAdministrator,
} = require("../middleware/authenticateToken");

// ROUTER
const router = express.Router();

router.post(
  "/auth/login_administrator",
  body("username")
    .notEmpty()
    .withMessage("Username Tidak Boleh Kosong")
    .trim()
    .custom(Validation.username),
  body("password")
    .notEmpty()
    .withMessage("Password Tidak Boleh Kosong")
    .trim()
    .custom(Validation.password),
  (req, res) => new Controllers(req, res).login_process()
);

module.exports = router;
