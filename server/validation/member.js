const { Member } = require("../models");

const validation = {};

validation.check_id_member = async (value) => {
  try {
    const check = await Member.findOne({ where: { id: value } });
    if (!check) {
      throw new Error("ID Member tidak terdaftar di pangkalan data");
    }
    return true;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = validation;
