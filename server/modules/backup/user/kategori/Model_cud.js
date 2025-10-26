const moment = require("moment");
const bcrypt = require("bcryptjs");
const { sequelize, Kategori } = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const { hideCurrency } = require("../../../helpers/currency");
const { info_kategori } = require("../../../helpers/user/kategori/index");

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

  async add_kategori() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // insert process
    try {
      const insert = await Kategori.create(
        {
          kode: body.kode,
          name: body.name,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menambahkan Kategori dengan Kategori ID : ${insert.id} dan Kode Kategori : ${body.kode} dan Nama Kategori : ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  async delete() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");

    const body = this.req.body;
    const inf = await info_kategori(body.id);
    // process
    try {
      // delete kategori
      await Kategori.destroy(
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
      this.message = `Menghapus Data Kategori dengan Kategori Id : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async update() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const inf = await info_kategori(body.id);
    // insert process
    try {
      // update data Member
      await Kategori.update(
        { kode: body.kode, name: body.name, updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Memperbaharui Data Kategori dengan Kategori Id : ${body.id} dan Kode Kategori Sebelumnya : ${inf.kode} dan Nama Kategori Sebelumnya : ${inf.kode}`;
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
