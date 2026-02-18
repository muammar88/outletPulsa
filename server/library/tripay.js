var request = require("request");
require("dotenv").config();

class Tripay {
  constructor(req) {
    this.req = req;
    this.production = true;
    this.url_sandbox = process.env.TRIPAY_URL_SANDBOX;
    this.url_production = process.env.TRIPAY_URL_PRODUCTION;
    this.api_key = process.env.TRIPAY_API_KEY;
    this.tripay_callback_key = process.env.TRIPAY_CALLBACK_KEY;
    this.main_url = "";
    this.pin = process.env.TRIPAY_PIN;
    this.no_hp_owner = process.env.USERNAME_MOBILE_PHONE;
  }

  async url_action(url) {
    return this.production == true
      ? this.url_production + url
      : this.url_sandbox + url;
  }

  async tripay_verify(secret) {
    return secret == this.tripay_callback_key ? true : false;
  }

  async get_price_from_server(product_code, callback) {
    const params = new URLSearchParams({
      code: product_code,
    });
    var options_GET = {
      uri: await this.url_action("pembelian/produk/cek?" + params),
      method: "GET",
      headers: {
        Authorization: "Bearer " + this.api_key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    request(options_GET, async function (errorGET, responseGET, bodyGET) {
      if (!errorGET && responseGET.statusCode == 200) {
        const json = JSON.parse(bodyGET);
        var harga = 0;
        if (json.success == true) {
          harga = json.data.price;
        }
        return callback(harga);
      }
    });
  }

  async get_produk(callback) {
    var options_GET = {
      uri: await this.url_action("pembelian/produk/"),
      method: "GET",
      headers: {
        Authorization: "Bearer " + this.api_key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    request(options_GET, async function (errorGET, responseGET, bodyGET) {
      if (!errorGET && responseGET.statusCode == 200) {
        const json = JSON.parse(bodyGET);
        return callback(json);
      }
    });
  }

  async check_harga(param, callback) {
    const payload = new URLSearchParams({
      code: param.code,
    });
    const str = payload.toString();
    var options_GET = {
      uri: await this.url_action("pembelian/produk/cek?" + str),
      method: "POST",
      headers: {
        Authorization: "Bearer " + this.api_key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    request(options_GET, async function (errorGET, responseGET, bodyGET) {
      if (!errorGET && responseGET.statusCode == 200) {
        const json = JSON.parse(bodyGET);
        if (json.data != undefined) {
          return callback({
            data: json,
          });
        } else {
          return callback({ data: {} });
        }
      }
    });
  }

  async cek_saldo(callback) {
    var optionsGET = {
      uri: await this.url_action("ceksaldo"),
      method: "GET",
      headers: {
        Authorization: "Bearer " + this.api_key,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };

    request(optionsGET, async function (errorGET, responseGET, bodyGET) {
      if (!errorGET && responseGET.statusCode == 200) {
        const json = JSON.parse(bodyGET);
        if (json.data != undefined) {
          return callback({
            saldo: json.data,
          });
        } else {
          return callback({ saldo: 0 });
        }
      }
    });
  }
}

module.exports = Tripay;
