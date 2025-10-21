const moment = require("moment");
const {
  sequelize,
  Transaction,
  Transfer_saldo,
  Terima_saldo,
} = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");

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

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const body = this.req.body;
    // process
    try {
      // delete Transfer Saldo
      await Transfer_saldo.destroy(
        {
          where: {
            transaction_id: body.id,
          },
        },
        {
          transaction: this.t,
        }
      );
      // delete Terima Saldo
      await Terima_saldo.destroy(
        {
          where: {
            transaction_id: body.id,
          },
        },
        {
          transaction: this.t,
        }
      );
      // delete transaction
      await Transaction.destroy(
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
      this.message = `Menghapus Data Riwayat Transfer Saldo Dengan Transaction Id : ${body.id}`;
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
