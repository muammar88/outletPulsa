const { User } = require("../../db/models");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  async get_one_user() {
    const body = this.req.body;
    return await User.findOne({
      where: { name: body.username },
    });
  }
}

module.exports = Model_r;
