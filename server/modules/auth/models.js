const jwt = require("jsonwebtoken");
const { User, Tab, Menu } = require("../../models");

class Models {
  constructor(req) {
    this.req = req;
  }

  async get_info() {
    try {
      var q = await User.findOne({
        where: { username: this.req.body.username },
      });
      return {
        id: q.id,
        username: q.username,
        fullname: q.fullname,
        password: q.password,
      };
    } catch (error) {
      return {};
    }
  }
}

module.exports = Models;
