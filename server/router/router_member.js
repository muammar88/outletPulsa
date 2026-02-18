const express = require("express");
const { body } = require("express-validator");
const Controllers = require("../modules/member/controllers");
const Validation = require("../validation/member");
const {
  authenticateTokenAdministrator,
} = require("../middleware/authenticateToken");

// ROUTER
const router = express.Router();

router.post(
  "/member/list",
  authenticateTokenAdministrator,
  [
    body("perpage")
      .notEmpty()
      .withMessage("Perpage Tidak Boleh Kosong")
      .isInt()
      .withMessage("Perpage Harus Angka"),
    body("pageNumber")
      .notEmpty()
      .withMessage("Page Number Tidak Boleh Kosong")
      .isInt()
      .withMessage("Page Number Harus Angka"),
    body("search").optional().isString().withMessage("Search Harus String"),
  ],
  (req, res) => new Controllers(req, res).list()
);

router.post(
  "/member/delete",
  authenticateTokenAdministrator,
  [
    body("id")
      .notEmpty()
      .withMessage("ID Tidak Boleh Kosong")
      .isInt()
      .withMessage("ID Harus Angka")
      .custom(Validation.check_id_member),
  ],
  (req, res) => new Controllers(req, res).delete()
);

module.exports = router;
