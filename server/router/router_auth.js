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

// const controllersMember = require("../modules/member/controllers/index");
// const validationMember = require("../validation/member");
// const controllersAdministrator = require("../modules/administrator/controllers/index");
// const validationAdministrator = require("../validation/administrator");
// controllersAdministrator.login_administrator_process
// router.post(
//   "/auth/login_member",
//   body("username")
//     .notEmpty()
//     .withMessage("Username Tidak Boleh Kosong")
//     .trim()
//     .custom(validationMember.username),
//   body("password")
//     .notEmpty()
//     .withMessage("Password Tidak Boleh Kosong")
//     .trim()
//     .custom(validationMember.password),
//   controllersMember.login_member_process
// );

// router.post(
//   "/auth/administrator/edit_profile",
//   authenticateTokenAdministrator,
//   [
//     body("name").notEmpty().withMessage("Name Tidak Boleh Kosong").trim(),
//     body("username")
//       .notEmpty()
//       .withMessage("Username Tidak Boleh Kosong")
//       .trim()
//       .custom(validationAdministrator.check_username),
//     body("password")
//       .optional()
//       .trim()
//       .custom(validationAdministrator.check_password),
//   ],
//   controllersAdministrator.edit_profile
// );

// router.post(
//   "/auth/member/edit_profile_member",
//   authenticateTokenMember,
//   [
//     body("fullname")
//       .notEmpty()
//       .withMessage("fullname Tidak Boleh Kosong")
//       .trim(),
//     body("username")
//       .notEmpty()
//       .withMessage("Username Tidak Boleh Kosong")
//       .trim()
//       .custom(validationMember.check_username),
//     body("password").optional().custom(validationMember.check_password),
//   ],
//   controllersMember.edit_profile_member
// );

// router.get(
//   "/auth/administrator/get_info_edit_profile",
//   authenticateTokenAdministrator,
//   controllersAdministrator.get_info_edit_profile
// );

// router.get(
//   "/auth/member/get_info_edit_profile_member",
//   authenticateTokenMember,
//   controllersMember.get_info_edit_profile_member
// );

// router.post(
//   "/auth/administrator/refresh",
//   controllersAdministrator.refreshToken
// );

// router.post("/auth/member/refresh", controllersMember.refreshToken);

// router.post(
//   "/auth/administrator/logout",
//   controllersAdministrator.logout_administrator_process
// );

module.exports = router;
