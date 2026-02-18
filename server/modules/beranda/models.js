// const { User } = require("../../db/models");
const { User } = require("../../models");

class Models {
  constructor(req) {
    this.req = req;
  }

  // async get_one_user() {
  //   const body = this.req.body;
  //   return await User.findOne({
  //     where: { name: body.username },
  //   });
  // }
}

module.exports = Models;
