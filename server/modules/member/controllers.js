const jwt = require("jsonwebtoken");
const HandleErrors = require("../../utils/handleErrors");
const Models = require("./models");

class Controllers extends Models {
  constructor(req, res) {
    super(req);
    this.req = req;
    this.res = res;
    this.handleError = new HandleErrors();
    this.refreshTokens = [];
  }

  async list() {
    if (!(await this.handleError.handleValidationErrors(this.req, this.res)))
      return;

    try {
      // get data
      const data = await this.m_list();

      console.log("------RRR");
      console.log(data);
      console.log("------RRR");
      // response
      this.res.status(200).json({
        error: false,
        message: "Daftar member berhasil ditemukan.",
        ...data,
      });
    } catch (error) {
      this.handleError.handleServerError(this.res, error);
    }
  }

  async delete() {
    if (!(await this.handleError.handleValidationErrors(this.req, this.res))) {
      return;
    }

    try {
      // delete action
      await this.m_delete();
      // response
      if (await this.response()) {
        this.res.status(200).json({
          error: false,
          message: "Delete member berhasil dilakukan.",
        });
      } else {
        this.res.status(400).json({
          error: true,
          message: "Delete member gagal dilakukan.",
        });
      }
    } catch (error) {
      this.handleError.handleServerError(this.res, error);
    }
  }
}

module.exports = Controllers;
