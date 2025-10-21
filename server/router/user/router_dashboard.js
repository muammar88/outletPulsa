const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
// const user = require("../controllers/user/index");

// //------MIDDLEWARE-----//
const {
  verifySession,
  verifyToken,
} = require("../../middleware/verifySessionToken");

// ROUTER
const router = express.Router();

//router.get("/Users/", [verifySession], function () {});

module.exports = router;
