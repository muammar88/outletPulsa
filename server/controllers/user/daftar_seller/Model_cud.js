const moment = require("moment");
const { sequelize, Digiflazz_seller } = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const { hideCurrency } = require("../../../helpers/currency");
const { info } = require("../../../helpers/user/daftar_seller/index");

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

  /**
   * Fungsi untuk mengupdate rangking seller
   **/
  async update_rangking_seller() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // insert process
    try {
      await Digiflazz_seller.update(
        { rangking: body.rangking, updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Mengupdate Data Rangking Seller Dengan ID : ${body.id} dan Rangking Seller Menjadi : ${body.rangking}`;
    } catch (error) {
      this.state = false;
    }
  }

  /**
   * Fungsi untuk memblokir seller
   **/
  async blokir_seller() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // insert process
    try {
      await Digiflazz_seller.update(
        { status: "banned", updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Memblokir Seller Dengan ID : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  /**
   * Fungsi untuk membuka blokir seller
   **/
  async buka_blokir_seller() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // insert process
    try {
      await Digiflazz_seller.update(
        { status: "unbanned", updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Membuka blokir Seller Dengan ID : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  /**
   * Fungsi untuk menghapus seller
   **/
  async delete_seller() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // insert process
    try {
      // delete seller
      await Digiflazz_seller.destroy(
        {
          where: {
            id: body.id,
          },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menghapus data Seller Dengan Seller ID : ${body.id}`;
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
