const { User } = require("../models");
const bcrypt = require("bcryptjs");

const validation = {};

validation.username = async (value) => {
  try {
    var check = await User.findOne({
      where: { username: value },
    });
    if (!check) {
      console.log("-----Error-----JJJJJJJJJJJJJ");

      throw new Error("Username tidak terdaftar dipangkalan data");
    } else {
      console.log("-----Error-----xxxxxxxxxxxx");
      return true;
    }
  } catch (error) {
    console.log("-----Error-----1");
    console.log(error);
    console.log("-----Error-----1");
    throw new Error(error.message);
  }
};

validation.password = async (value, { req }) => {
  try {
    var q = await User.findOne({
      where: { username: req.body.username },
    });
    if (!q) {
      throw new Error("User ini tidak terdaftar dipangkalan data");
    } else {
      const salt = await bcrypt.genSalt(10);
      const hasil = await bcrypt.hash(value, salt);

      console.log("-----Hasil-----");
      console.log(hasil);
      console.log("-----Hasil-----");

      const valid_password = await bcrypt.compare(value, q.password);
      if (!valid_password) {
        throw new Error("Username atau Password anda tidak valid.");
      } else {
        return true;
      }
    }
  } catch (error) {
    console.log("-----Error-----2");
    console.log(error);
    console.log("-----Error-----2");
    throw new Error(error.message);
  }
};

module.exports = validation;
