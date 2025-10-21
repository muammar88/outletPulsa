const express = require("express");
const { body } = require("express-validator");
const controllers = require("../controllers/login/index");

// ROUTER
const router = express.Router();

router.get("/Users/Login", controllers.Login_area);

router.post(
  "/Users/Login_process",
  body("username").notEmpty().withMessage("Username Tidak Boleh Kosong"),
  body("password").notEmpty().withMessage("Password Tidak Boleh Kosong"),
  controllers.Login_process
);

module.exports = router;
