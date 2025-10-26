const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error_msg } = require("../../helpers/error");
const { validationResult } = require("express-validator");
const Model_r = require("./Model_r");

const controllers = {};

/**
 * Login Area Views
 **/
controllers.Login_area = async (req, res) => {
  res.render("login/index");
};

/**
 * Melakukan authentikasi proses login user
 **/
controllers.Login_process = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err_msg = await error_msg(errors);
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const model_r = new Model_r(req);
    try {
      const data = await model_r.get_one_user();
      if (data) {
        const body = req.body;
        const valid_password = await bcrypt.compare(
          body.password,
          data.password
        );
        if (!valid_password) {
          res.status(400).json({ msg: "Password Tidak Valid" });
        } else {
          if (typeof req.session.login_session !== "undefined") {
            if (!req.session.login_session.hasOwnProperty(data.kode)) {
              var list = [];
              req.session.login_session.forEach((element, key) => {
                list[key] = element;
              });
              list[data.kode] = { name: data.name };
              req.session.login_session = list;
            }
          } else {
            req.session.login_session = { [data.kode]: { name: data.name } };
          }
          const access_token = jwt.sign(
            { kode: data.kode, name: data.name },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "360d" }
          );
          res.status(200).json({
            msg: "Login Berhasih Dilakukan",
            kode: data.kode,
            access_token: access_token,
          });
        }
      } else {
        res.status(400).json({ msg: "Username tidak ditemukan" });
      }
    } catch (error) {
      res.status(400).json({ msg: error });
    }
  }
};

module.exports = controllers;
