const moment = require("moment");
const { sequelize, Bank_transfer } = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const { hideCurrency } = require("../../../helpers/currency");

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

  async add() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const biaya_admin = await hideCurrency(body.biaya_admin);
    // insert process
    try {
      const insert = await Bank_transfer.create(
        {
          bank_id: body.bank_transfer,
          account_name: body.name,
          account_number: body.nomor,
          biaya_admin: biaya_admin,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menambahkan Bank Transfer Baru dengan ID Bank Transfer  : ${insert.id} dan ID Bank : ${body.bank_transfer}`;
    } catch (error) {
      this.state = false;
    }
  }

  async delete() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // process
    try {
      // delete bank transfer
      await Bank_transfer.destroy(
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
      this.message = `Menghapus Data Bank Transfer Dengan Bank Transfer Id : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async update() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const biaya_admin = await hideCurrency(body.biaya_admin);
    // insert process
    try {
      // update data Bank Transfer
      var data = {};
      data["bank_id"] = body.bank_transfer;
      data["account_name"] = body.name;
      data["account_number"] = body.nomor;
      data["biaya_admin"] = biaya_admin;
      data["updatedAt"] = myDate;
      await Bank_transfer.update(
        data,
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );

      // write log message
      this.message = `Memperbaharui Data Bank Transfer dengan Bank Transfer Id : ${body.id}`;
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
