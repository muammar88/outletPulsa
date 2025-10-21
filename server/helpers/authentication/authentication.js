// const bcrypt = require("bcrypt");

const {
  Op,
  Profile_testimoni,
  Profile_contact,
  Profile_sosial_media,
} = require("../../db/models");

const helper = {};

helper.check_login_company_code = async (value, { req }) => {
  const body = req.body;
  if (body.level == "staff") {
    if (value != "") {
      // pengecekan kdoe perusahaan
    } else {
      throw new Error("Kode Perusahaan Tidak Boleh Kosong.");
    }
  }
  return true;
};

module.exports = helper;
