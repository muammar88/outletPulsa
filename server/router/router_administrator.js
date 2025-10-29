const jwt = require("jsonwebtoken");
const express = require("express");
const { body } = require("express-validator");
// const controllers = require("../modules/administrator/controllers/index");
const Controllers = require("../modules/administrator/controllers");
const {
  authenticateTokenAdministrator,
} = require("../middleware/authenticateToken");

// ROUTER
const router = express.Router();

router.get("/administrator", authenticateTokenAdministrator, (req, res) =>
  new Controllers(req, res).administrator()
);

module.exports = router;
