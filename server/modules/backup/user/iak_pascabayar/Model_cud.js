const moment = require("moment");
const { sequelize, Iak_pascabayar_product } = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const {
  info,
  info_produk,
} = require("../../../helpers/user/iak_pascabayar/index");

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
      await Iak_pascabayar_product.update(
        { produk_pascabayar_id: null, updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Menghapus Koneksi Produk Pascabayar IAK dengan kode Produk Pascabayar IAK : ${inf.kode}, nama produk Pascabayar IAK : ${inf.name} dan Id Produk Pascabayar IAK : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async sinkronisasi_produk_pascabayar_iak() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const body = this.req.body;
    const inf = await info(body.id);
    const inf_iak = await info_produk(body.produk);
    // process
    try {
      // update data Server
      await Iak_pascabayar_product.update(
        { produk_pascabayar_id: body.produk, updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Melakukan Sinkronisai Produk Pascabayar IAK dengan kode Produk Pascabayar : ${inf_iak.kode} dan Nama Produk Pascabayar : ${inf_iak.name} dengan Produk Pascabayar Outlet Pulsa dengan kode Produk : ${inf.kode} dan Nama Produk Pascabayar : ${inf.name}`;
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
