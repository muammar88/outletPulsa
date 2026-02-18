const jwt = require("jsonwebtoken");
const HandleErrors = require("../../utils/handleErrors");
const Iak = require("../../library/iak");
const Tripay = require("../../library/tripay");
const Models = require("./models");

class Controllers extends Models {
  constructor(req, res) {
    super(req);
    this.req = req;
    this.res = res;
    this.handleError = new HandleErrors();
    this.refreshTokens = [];
  }

  async get_saldo_iak() {
    try {
      const iak = new Iak(this.req);
      await iak.cek_saldo((e) => {
        this.res.status(200).json({
          error: false,
          message: "Saldo ditemukan.",
          data: {
            saldo: e.saldo,
          },
        });
      });
    } catch (error) {
      this.res.status(400).json({
        error: true,
        message: "Error.",
      });
    }
  }

  async get_saldo_tripay() {
    try {
      const tripay = new Tripay(this.req);
      await tripay.cek_saldo((e) => {
        this.res.status(200).json({
          error: false,
          message: "Saldo ditemukan.",
          data: {
            saldo: e.saldo,
          },
        });
      });
    } catch (error) {
      this.res.status(400).json({
        error: true,
        message: "Error.",
      });
    }
  }

  //   async login_process() {
  //     if (!(await this.handleError.handleValidationErrors(this.req, this.res)))
  //       return;

  //     try {
  //       const data = await this.get_info();

  //       console.log("-------data");
  //       console.log(data);
  //       console.log("-------data");

  //       const userPayload = {
  //         id: data.id,
  //         username: data.username,
  //         fullname: data.fullname,
  //       };

  //       const access_token = jwt.sign(
  //         userPayload,
  //         process.env.ACCESS_TOKEN_SECRET,
  //         {
  //           expiresIn: "500m",
  //         }
  //       );

  //       const refresh_token = jwt.sign(
  //         userPayload,
  //         process.env.REFRESH_TOKEN_SECRET,
  //         { expiresIn: "7d" }
  //       );

  //       this.refreshTokens.push(refresh_token);

  //       this.res.status(200).json({
  //         error: false,
  //         message: "Proses login berhasil dilakukan.",
  //         data: {
  //           access_token,
  //           refresh_token,
  //         },
  //       });
  //     } catch (error) {
  //       console.log("-------error");
  //       console.log(error);
  //       console.log("-------error");
  //       this.handleError.handleServerError(this.res, error);
  //     }
  //   }
}

module.exports = Controllers;
