const moment = require("moment");
const { sequelize, Bank } = require("../../../db/models");
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

  async add() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // insert process
    try {
      const insert = await Bank.create(
        {
          kode: body.kode,
          name: body.name,
          image: this.req.file.filename,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menambahkan Bank Baru dengan Bank ID : ${insert.id}, kode Bank : ${body.kode} dan nama Bank : ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  async delete() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const inf = await info_bank(body.id);
    // process
    try {
      // delete bank
      await Bank.destroy(
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
      this.message = `Menghapus Data Bank Dengan Bank Id : ${body.id}, Kode Bank : ${inf.kode} dan Nama Bank : ${inf.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  async update() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    var data = { kode: body.kode, name: body.name, updatedAt: myDate };
    if (this.req.file != undefined) {
      data["image"] = this.req.file.filename;
    }
    // insert process
    try {
      await Bank.update(
        data,
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Memperbaharui Data Bank dengan Bank Id : ${body.id}, Kode Bank : ${body.kode} dan Nama Bank : ${body.name}`;
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
