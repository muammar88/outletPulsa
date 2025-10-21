var request = require("request");
var md5 = require("md5");

class Digiflaz {
  constructor(req) {
    this.production = true;
    this.username = "gapajaD7VQKo";
    this.development_key = "dev-82309dd0-8684-11ee-bada-e3aa4ec369e9";
    this.production_key = "39a2cc82-ffb3-5a56-9d99-59a9a49d99b3";
    this.webhook_id = "oElB1g";
    this.secret = "ejh1v2eo120912sj1v10jbsbjbv892oi213lkj09saks0912kbaws";
    this.url = "https://api.digiflazz.com/v1/";
    this.url_cek_saldo = this.url + "cek-saldo";
    this.url_price_list = this.url + "price-list";
    this.url_deposit = this.url + "deposit";
    this.url_transaction = this.url + "transaction";
    this.url_ping_endpoin = this.url + "report/hooks/" + this.webhook_id + "/pings";
  }

  async sign_md5_cek_saldo() {
    var apiKey =
      this.production == true ? this.production_key : this.development_key;
    console.log("apiKey");
    console.log(apiKey);
    console.log("apiKey");
    return md5(this.username + apiKey + "depo");
  }

  async sign_md5_price_list() {
    var apiKey =
      this.production == true ? this.production_key : this.development_key;
    return md5(this.username + apiKey + "pricelist");
  }

  async sign_md5_top_up(ref_id) {
    var apiKey =
      this.production == true ? this.production_key : this.development_key;
    return md5(this.username + apiKey + ref_id);
  }

  async url_act(param_url) {
    return this.url + param_url;
  }

  async get_produk(callback) {
    const payload = {
      cmd: "prepaid",
      username: this.username,
      sign: await this.sign_md5_price_list(),
    };
    const str = payload.toString();
    var optionsGET = {
      uri: this.url_price_list,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      json: payload,
    };
    request(optionsGET, async function (errorGET, responseGET, bodyGET) {
      if (!errorGET && responseGET.statusCode == 200) {
        const json = bodyGET;
        if (json.data != undefined) {
          return callback({
            data: json.data,
          });
        } else {
          return callback({ data: {} });
        }
      } else {
        return callback({ data: {} });
      }
    });
  }

  async cek_saldo(callback) {
    const payload = {
      cmd: "deposit",
      username: this.username,
      sign: await this.sign_md5_cek_saldo(),
    };
    const str = payload.toString();
    var optionsGET = {
      uri: this.url_cek_saldo,
      method: "POST", //  kemungkinan ganti
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      json: payload,
    };
    return request(optionsGET, async function (errorGET, responseGET, bodyGET) {
      if (!errorGET && responseGET.statusCode == 200) {
        const json = bodyGET;
        if (json.data != undefined) {
          return callback({
            data: {
              saldo: json.data.deposit,
            },
          });
        } else {
          return callback({ data: { saldo: 0 } });
        }
      } else {
        return callback({ data: { saldo: 0 } });
      }
    });
  }
}

module.exports = Digiflaz;
