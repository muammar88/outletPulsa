const jwt = require("jsonwebtoken");
const HandleErrors = require("../../utils/handleErrors");
const Models = require("./models");

class Controllers extends Models {
  constructor(req, res) {
    super(req);
    this.req = req;
    this.res = res;
    this.handleError = new HandleErrors();
  }

  async administrator() {
    try {
      const data = await this.get_menu_submenu_tab();
      this.res.status(200).json({
        error: false,
        message: "Data Berhasil Ditemukan.",
        data: {
          menu_info: data.menu_info,
          user_info: data.user_info,
        },
      });
    } catch (error) {
      this.handleError.handleServerError(this.res, error);
    }
  }

  // this.refreshTokens = [];
  // console.log("-------error");
  // console.log(error);
  // console.log("-------error");

  // const data = await this.get_info();
  // console.log("-------data");
  // console.log(data);
  // console.log("-------data");
  // const userPayload = {
  //   id: data.id,
  //   username: data.username,
  //   fullname: data.fullname,
  // };
  // const access_token = jwt.sign(
  //   userPayload,
  //   process.env.ACCESS_TOKEN_SECRET,
  //   {
  //     expiresIn: "500m",
  //   }
  // );
  // const refresh_token = jwt.sign(
  //   userPayload,
  //   process.env.REFRESH_TOKEN_SECRET,
  //   { expiresIn: "7d" }
  // );
  // this.refreshTokens.push(refresh_token);
  // this.res.status(200).json({
  //   error: false,
  //   message: "Proses login berhasil dilakukan.",
  //   data: {
  //     access_token,
  //     refresh_token,
  //   },
  // });

  //   controllers.administrator = async (req, res) => {
  //   try {
  //     const model_r = new Model_r(req);
  //     const data = await model_r.get_menu_submenu_tab();
  //     res.status(200).json({
  //       error: false,
  //       message: "Data Berhasil Ditemukan.",
  //       menu_info: data.menu_info,
  //       user_info: data.user_info,
  //     });
  //   } catch (error) {
  //     handleServerError(res, error);
  //   }
  // };
}

module.exports = Controllers;
