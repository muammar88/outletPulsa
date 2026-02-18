
const moment = require("moment");
const { System_log, User } = require("../models");
const jwt = require("jsonwebtoken");
const helper = {};

helper.writeLog = async (req, t, param) => {
    // get ip user
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    // get datetimes
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    // get info user from token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const decoded = jwt.decode(token);

    var user_id = 0;
    var name = '';
    // get info user from database
    await User.findOne({
      attributes: ["id", "name"],
      where: { id: decoded.id },
    }).then(async (e) => {
      if (e) {
          user_id = e.id;
          name = e.name;
      }
    });

    try {
        // input system log to database
        await System_log.create({
            user_id : user_id,
            msg : name + " " + param.msg,
            ip : ip,
            createdAt : myDate,
            updatedAt : myDate
        }, {
            transaction: t,
        });

    } catch (error) {
        console.log("------ERERER");
        console.log(error);
        console.log("------ERERER");
    }
};

module.exports = helper;
