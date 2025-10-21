const moment = require("moment");
const { sequelize, Validasi_seller_digiflaz } = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const { info_bank } = require("../../../helpers/user/daftar_bank/index");

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
      // delete bank
      await Validasi_seller_digiflaz.destroy(
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
      this.message = `Menghapus Data Validasi seller digiflaz Dengan Validasi Seller Digiflaz Id : ${body.id}`;
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
