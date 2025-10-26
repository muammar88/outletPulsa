const jwt = require("jsonwebtoken");
const HandleError = require("../../utils/handleErrors");
const Models = require("./models");

class Controllers extends Models {
  constructor(req, res) {
    super(req);
    this.req = req;
    this.res = res;
    this.handleError = new HandleError(res, res);
    this.refreshTokens = [];
  }

  async login_process() {
    const satset = await this.handleError.handleValidationErrors(
      this.req,
      this.res
    );

    console.log("-------satset");
    console.log(satset);
    console.log("-------satset");

    if (!satset) return;

    try {
      const data = await this.get_info();

      console.log("-------data");
      console.log(data);
      console.log("-------data");

      const userPayload = {
        id: data.id,
        username: data.username,
        fullname: data.fullname,
      };

      const access_token = jwt.sign(
        userPayload,
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "500m",
        }
      );

      const refresh_token = jwt.sign(
        userPayload,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      this.refreshTokens.push(refresh_token);

      this.res.status(200).json({
        error: false,
        message: "Proses login berhasil dilakukan.",
        data: {
          access_token,
          refresh_token,
        },
      });
    } catch (error) {
      console.log("-------error");
      console.log(error);
      console.log("-------error");
      this.handleError.handleServerError(this.res, error);
    }
  }
}

module.exports = Controllers;
