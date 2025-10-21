const moment = require("moment");
const { sequelize, Tripay_prabayar_produk } = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const {
  info,
  info_produk,
} = require("../../../helpers/user/tripay_prabayar/index");

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

  async delete_koneksi() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const body = this.req.body;
    const inf = await info(body.id);
    // process
    try {
      // update data Server
      await Tripay_prabayar_produk.update(
        { produk_id: null, updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Menghapus Koneksi Produk Tripay dengan kode Produk Tripay : ${inf.kode}, nama produk Tripay : ${inf.name} dan Id Produk Tripay : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async sinkronisasi_produk_tripay() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const body = this.req.body;
    const inf = await info(body.id);
    const inf_tripay = await info_produk(body.produk);
    // process
    try {
      // update data Server
      await Tripay_prabayar_produk.update(
        { produk_id: body.produk, updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Melakukan Sinkronisai Produk IAK dengan kode Produk : ${inf_tripay.kode} dan Nama Produk : ${inf_tripay.name} dengan Produk Outlet Pulsa dengan kode Produk : ${inf.kode} dan Nama produk : ${inf.name}`;
    } catch (error) {
      console.log("__________________");
      console.log(error);
      console.log("__________________");
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
