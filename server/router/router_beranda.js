const express = require("express");
const { body } = require("express-validator");
const Controllers = require("../modules/beranda/controllers");
const {
  authenticateTokenAdministrator,
} = require("../middleware/authenticateToken");

// ROUTER
const router = express.Router();

router.get(
  "/beranda/get_saldo_iak",
  authenticateTokenAdministrator,
  (req, res) => new Controllers(req, res).get_saldo_iak()
);

router.get(
  "/beranda/get_saldo_tripay",
  authenticateTokenAdministrator,
  (req, res) => new Controllers(req, res).get_saldo_tripay()
);

module.exports = router;
