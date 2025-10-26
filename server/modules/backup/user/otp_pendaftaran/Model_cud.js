const moment = require("moment");
const { sequelize, Otp } = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const {
  info_otp_pendaftaran,
} = require("../../../helpers/user/otp_pendaftaran/index");

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
    const inf = await info_otp_pendaftaran(body.id);
    // process
    try {
      // delete Otp
      await Otp.destroy(
        {
          where: {
            id: body.id,
            type: "register",
          },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Menghapus Data Otp dengan Otp Id : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  // async add_operator() {
  //   // initialize general property
  //   await this.initialize();

  //   const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  //   const body = this.req.body;
  //   // insert process
  //   try {
  //     const insert = await Operator.create(
  //       {
  //         kode: body.kode,
  //         name: body.name,
  //         createdAt: myDate,
  //         updatedAt: myDate,
  //       },
  //       {
  //         transaction: this.t,
  //       }
  //     );
  //     // write log message
  //     this.message = `Menambahkan Operator dengan Operator ID : ${insert.id} dan Kode Operator : ${body.kode} dan Nama Operator : ${body.name}`;
  //   } catch (error) {
  //     this.state = false;
  //   }
  // }

  // async update() {
  //   // initialize general property
  //   await this.initialize();

  //   const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  //   const body = this.req.body;
  //   const inf = await info_operator(body.id);
  //   // insert process
  //   try {
  //     // update data Operator
  //     await Operator.update(
  //       { kode: body.kode, name: body.name, updatedAt: myDate },
  //       {
  //         where: { id: body.id },
  //       },
  //       {
  //         transaction: this.t,
  //       }
  //     );
  //     // write log message
  //     this.message = `Memperbaharui Data Operator dengan Operator Id : ${body.id} dan Kode Operator Sebelumnya : ${inf.kode} dan Nama Operator Sebelumnya : ${inf.kode}`;
  //   } catch (error) {
  //     this.state = false;
  //   }
  // }

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
