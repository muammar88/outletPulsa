const moment = require("moment");
const {
  sequelize,
  Testing_digiflaz,
  Digiflazz_seller,
  Validasi_seller_digiflaz,
} = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const { info } = require("../../../helpers/user/tes_produk/index");

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

  async delete() {
    // initialize general property
    await this.initialize();
    const body = this.req.body;
    // process
    try {
      // delete testing digiflazz
      await Testing_digiflaz.destroy(
        {
          where: {
            id: body.id,
          },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Menghapus Data Transaksi Tes Dengan Transaksi Tes Id : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async blok_seller_transaksi_tes() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const infos = await info(body.id);
    // blok process
    try {
      // update data digiflazz seller
      await Digiflazz_seller.update(
        { status: "banned", updatedAt: myDate },
        {
          where: { id: infos.seller_id },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Memblok data seller dengan Seller Id : ${infos.seller_id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async validasi_seller() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const infos = await info(body.id);
    // blok process
    try {
      // insert validasi data seller
      const insert = await Validasi_seller_digiflaz.create(
        {
          seller_id: infos.seller_id,
          createdAt: infos.createdAt,
          updatedAt: infos.createdAt,
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Memvalidasi data seller dengan Seller Id : ${infos.seller_id} dan Validasi ID : ${insert.id}`;
    } catch (error) {
      console.log("---------------------");
      console.log(error);
      console.log("---------------------");
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
