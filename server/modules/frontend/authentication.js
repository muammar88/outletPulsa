const fs = require("fs");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const { QueryTypes } = require("sequelize");
const { dirname } = require("path");
var request = require("request");

const frontend = require("../../helpers/frontend");

const { validationResult } = require("express-validator");

const {
  Op,
  Company_administrator,
  Company_staff,
  Company,
} = require("../../db/models");

const controllers = {};

controllers.login_process = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var err_msg = "";
    let num = 0;
    errors.array().forEach((error) => {
      err_msg += error.msg;
      if (num != 0) err_msg += "<br>";
      num++;
    });
    res.status(400).json({ error: true, error_msg: err_msg });
  } else {
    const body = req.body;
    const level = body.level;
    // try {
    //console.log("1");
    if (level == "administrator") {
      // console.log("2");
      const admin = await Company_administrator.findOne({
        where: { username: body.username },
        include: {
          required: true,
          model: Company,
          attributes: ["code"],
        },
      });
      // admin
      if (admin) {
        // console.log("3");
        const kode = admin.code;
        const company_code = admin.Company.code;
        const validPassword = await bcrypt.compare(
          body.password,
          admin.password
        );
        // check validation password
        if (!validPassword) {
          console.log("4");
          res.status(400).json({
            msg: "Proses login <b style='color:red;'>GAGAL</b> dilakukan, Silahkan periksa kembali <b>USERNAME</b> dan <b>PASSWORD</b> anda.",
          });
        } else {
          console.log("5");
          if (typeof req.session.User_login !== "undefined") {
            if (!req.session.User_login.includes(kode)) {
              var list = [];
              var i = 0;
              req.session.User_login.forEach((element) => {
                console.log(element);
                list[i] = element;
                i++;
              });
              list[i] = kode;
              req.session.User_login = list;
            }
          } else {
            req.session.User_login = [kode];
          }
          const accessToken = jwt.sign(
            { kode },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "360d" }
          );
          res
            .status(200)
            .json({ kode, accessToken, company_code, type: "administrator" });
        }
      } else {
        res.status(400).json({
          msg: "Proses login <b style='color:red;'>GAGAL</b> dilakukan, Silahkan periksa kembali <b>USERNAME</b> dan <b>PASSWORD</b> anda.",
        });
      }
    } else if (level == "staff") {
      const staff = await Company_staff.findOne({
        where: { whatsapp: body.whatsapp },
        include: {
          required: true,
          model: Company,
          attributes: ["code"],
          where: {
            code: body.company_code,
          },
        },
      });
      // staff
      if (staff) {
        const kode = staff.code;
        const company_code = staff.Company.code;
        const validPassword = await bcrypt.compare(
          body.password,
          staff.password
        );
        // check validation password
        if (!validPassword) {
          res.status(400).json("Password Tidak Valid");
        } else {
          if (typeof req.session.User_login !== "undefined") {
            if (!req.session.User_login.includes(kode)) {
              var list = [];
              var i = 0;
              req.session.User_login.forEach((element) => {
                console.log(element);
                list[i] = element;
                i++;
              });
              list[i] = kode;
              req.session.User_login = list;
            }
          } else {
            req.session.User_login = [kode];
          }
          const accessToken = jwt.sign(
            { kode },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "360d" }
          );
          res
            .status(200)
            .json({ kode, accessToken, company_code, type: "staff" });
        }
      }
    } else {
      res.status(400).json({
        msg: "Proses login <b style='color:red;'>GAGAL</b> dilakukan, Silahkan periksa kembali tipe akun anda.",
      });
    }
  }
};

module.exports = controllers;
