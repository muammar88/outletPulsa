const { User } = require("../models");
const bcrypt = require("bcryptjs");

const validation = {};

validation.username = async (value) => {
  try {
    const check = await User.findOne({ where: { username: value } });
    if (!check) {
      throw new Error("Username tidak terdaftar di pangkalan data");
    }
    return true;
  } catch (err) {
    throw new Error(err.message);
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
      const valid_password = await bcrypt.compare(value, q.password);
      if (!valid_password) {
        throw new Error("Username atau Password anda tidak valid.");
      } else {
        return true;
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = validation;
