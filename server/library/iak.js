var request = require("request");
require("dotenv").config();
var md5 = require("md5");

class Iak {
  /* Param definition */
  constructor(req) {
    this.production = true;
    this.username = process.env.USERNAME_MOBILE_PHONE;
    this.key_production = process.env.PRODUCTION_API_KEY;
    this.key_dev = process.env.DEVELOPMENT_API_KEY;
    this.iak_callback_key = process.env.IAK_CALLBACK_KEY;
    this.url_production = process.env.PRODUCTION_URL_PREPAID;
    this.url_dev = process.env.DEVELOPMENT_URL_PREPAID;
    this.url_production_pasca = process.env.PRODUCTION_URL_POSTPAID;
    this.url_dev_pasca = process.env.DEVELOPMENT_URL_POSTPAID;
    this.url_check_balance = "api/check-balance";
    this.url_price_list = "api/pricelist";
    this.url_price_list_type = "api/pricelist/";
    this.url_check_operator = "api/check-operator";
    this.url_inquiry_pln = "api/inquiry-pln";
    this.url_inquiry_ovo = "api/inquiry-ovo";
    this.url_top_up = "api/top-up";
    this.url_check_status = "api/check-status";
    this.url_price_list_pascabayar = "api/v1/bill/check/";
  }

  /* Url Preparation */
  async url_act(url, pasca) {
    if (pasca != undefined && pasca == true) {
      return this.production == true
        ? this.url_production_pasca + url
        : this.url_dev_pasca + url;
    } else {
      return this.production == true
        ? this.url_production + url
        : this.url_dev + url;
    }
  }

  /* Start MD5 Operation  */
  async sign_md5_price_list() {
    var apiKey = this.production == true ? this.key_production : this.key_dev;
    return md5(this.username + apiKey + "pl");
  }

  async sign_md5_operator() {
    var apiKey = this.production == true ? this.key_production : this.key_dev;
    return md5(this.username + apiKey + "op");
  }

  async sign_md5_check_balance() {
    var apiKey = this.production == true ? this.key_production : this.key_dev;
    return md5(this.username + apiKey + "bl");
  }

  async sign_md5_top_up(ref_id) {
    var apiKey = this.production == true ? this.key_production : this.key_dev;
    return md5(this.username + apiKey + ref_id);
  }

  async sign_md5_check_status_pascabayar() {
    var apiKey = this.production == true ? this.key_production : this.key_dev;
    return md5(this.username + apiKey + "cs");
  }

  /* End MD5 Operation  */

  /* Verify callback key */
  async verify_kode(kode_verifikasi) {
    return kode_verifikasi == this.iak_callback_key ? true : false;
  }

  /* Cek Saldo IAK */
  async cek_saldo(callback) {
    var optionsGET = {
      uri: await this.url_act(this.url_check_balance),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      json: {
        username: this.username,
        sign: await this.sign_md5_check_balance(),
      },
    };
    request(optionsGET, async function (errorGET, responseGET, bodyGET) {
      if (!errorGET && responseGET.statusCode == 200) {
        console.log(bodyGET.data);
        return await callback({
          saldo: bodyGET.data.balance,
        });
      } else {
        return await callback({
          saldo: 0,
        });
      }
    });
  }

  /* Get product prabayar from IAK Server */
  async get_product_prabayar_iak(type, operator, operator_id, callback) {
    var optionsGET = {
      uri: await this.url_act(
        this.url_price_list + "/" + type + "/" + operator
      ),
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      json: {
        username: this.username,
        sign: await this.sign_md5_price_list(),
        statue: "all",
      },
    };

    return request(optionsGET, async function (errorGET, responseGET, bodyGET) {
      if (!errorGET && responseGET.statusCode == 200) {
        return await callback({
          data: bodyGET.data.pricelist,
          operator_id: operator_id,
        });
      } else {
        return await callback({
          data: {},
          operator_id: operator_id,
        });
      }
    });
  }

  /* Get product pascabayar from IAK server */
  async get_produk_pascabayar_iak(callback) {
    const options = {
      method: "POST",
      uri: await this.url_act(this.url_price_list_pascabayar, true),
      headers: { "Content-Type": "application/json" },
      body: {
        commands: "pricelist-pasca",
        username: this.username,
        sign: await this.sign_md5_price_list(),
        status: "all",
      },
      json: true,
    };

    request(options, async function (error, response, body) {
      if (!error && response.statusCode == 200) {
        callback(body);
      } else {
        return callback({});
      }
    });
  }
}

// helper.cek_saldo_IAK = async (callback) => {
//   var optionsGET = {
//     uri: await urlAct(url_check_balance),
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//     },
//     json: {
//       username: username,
//       sign: await sign_md5_check_balance(),
//     },
//   };
//   request(optionsGET, async function (errorGET, responseGET, bodyGET) {
//     if (!errorGET && responseGET.statusCode == 200) {
//       console.log(bodyGET.data);
//       return await callback({
//         saldo: bodyGET.data.balance,
//       });
//     } else {
//       return await callback({
//         saldo: 0,
//       });
//     }
//   });
// };

module.exports = Iak;
