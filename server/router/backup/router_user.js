const express = require("express");
const { verify } = require("jsonwebtoken");
const path = require("path");
const { body, validationResult } = require("express-validator");
const controllers = require("../controllers/user/index");

//------MIDDLEWARE-----//
const { verify_session } = require("../middleware/verify_session_token");

// ROUTER
const router = express.Router();

router.get("/Users/", [verify_session], controllers.User_area);

router.get("/Users/Logout", [verify_session], controllers.Logout_process);

router.get(
  "/Users/Info_profil_admin",
  [verify_session],
  controllers.Info_profil_admin
);

//

module.exports = router;
