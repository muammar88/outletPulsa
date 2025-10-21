const moment = require("moment");
const {
  sequelize,
  Transaction,
  Transaction_deposit,
  Request_deposit,
} = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const {
  info_transaction,
} = require("../../../helpers/user/daftar_deposit/index");

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
    const inf = await info_transaction(body.id);
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    // process
    try {
      // update data Bank Transfer
      var data = {};
      data["transaction_id"] = null;
      data["updatedAt"] = myDate;
      await Request_deposit.update(
        data,
        {
          where: { transaction_id: body.id },
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
      // delete transaction deposit
      await Transaction_deposit.destroy(
        {
          where: {
            transaction_id: body.id,
          },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Menghapus Data Transaksi Deposit Dengan Transaksi Id : ${body.id} dengan kode transaksi : ${inf.kode}`;
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
