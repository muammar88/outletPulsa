const moment = require("moment");
const bcrypt = require("bcryptjs");
const {
  sequelize,
  Produk_prabayar,
  Digiflazz_product,
} = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
// const {
//   generate_pembayaran_fee_agen,
//   generate_transaction_code,
// } = require("../../../helpers/random");
const { hideCurrency } = require("../../../helpers/currency");
const {
  info_product_seller,
  info_produk_outlet,
  info,
} = require("../../../helpers/user/digiflaz_prabayar/index");

class Model_cud {
  constructor(req) {
    this.req = req;
    this.t;
    this.state;
  }

  async initialize() {
    // initialize transaction
    this.t = await sequelize.transaction();
    this.state = true;
  }

  async pilih_seller_manual() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const info_product = await info_product_seller(body.seller);
    // insert process
    try {
      await Digiflazz_product.update(
        {
          selectedSellerBuyerSkuKode: info_product.buyerSkuKode,
          selectedSellerPrice: info_product.price,
          selectedSellerStartCutOff: info_product.startCutOff,
          selectedSellerEndCutOff: info_product.endCutOff,
          updatedAt: myDate,
        },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Memilih Seller Secara Manual Dengan Digiflaz Produk ID : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async delete_koneksi_digiflaz() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const body = this.req.body;
    const inf = await info(body.id);
    // process
    try {
      // update data Server
      await Digiflazz_product.update(
        { produk_id: null, updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Menghapus Koneksi Produk Digiflaz dengan kode Produk Digiflazz: ${inf.kode}, nama produk Digiflazz : ${inf.name} dan Id Produk Digiflazz: ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async sinkronisasi_produk_digiflaz() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const body = this.req.body;
    const inf_produk_ot = await info_produk_outlet(body.id);
    const inf_digiflaz = await info(body.produk);
    // process
    try {
      // update data Server
      await Digiflazz_product.update(
        { produk_id: body.produk, updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Melakukan Sinkronisai Produk Digiflazz dengan kode Produk : ${inf_digiflaz.kode} dan Nama Produk : ${inf_digiflaz.name} dengan Produk Outlet Pulsa dengan kode Produk : ${inf_produk_ot.kode} dan Nama produk : ${inf_produk_ot.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  async response() {
    if (this.state) {
      await write_log(this.req, this.t, {
        msg: this.message,
      });
      // commit
      await this.t.commit();
      return true;
    } else {
      // rollback
      await this.t.rollback();
      return false;
    }
  }
}

module.exports = Model_cud;
