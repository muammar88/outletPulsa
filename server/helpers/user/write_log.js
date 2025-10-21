const moment = require("moment");

const { System_log, User } = require("../../db/models");
const { jwt_value } = require("../../helpers/jwt");

const helper = {};

helper.info_user = async (req) => {
  const jwt = await jwt_value(req);
  var list = {};
  await User.findOne({
    where: { kode: jwt.kode },
  }).then(async (val) => {
    if (val) {
      list["id"] = val.id;
      list["name"] = val.name;
      list["whatsapp_number"] = val.whatsapp_number;
    }
  });
  return list;
};

helper.write_log = async (req, t, param) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  const info = await helper.info_user(req);
  const data = {};
  data["user_id"] = info.id;
  data["msg"] = info.name + " " + param.msg;
  data["ip"] = ip;
  data["createdAt"] = myDate;
  data["updatedAt"] = myDate;

  await System_log.create(data, {
    transaction: t,
  });
};

module.exports = helper;
