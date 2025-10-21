const moment = require("moment");
const bcrypt = require("bcryptjs");
const {
  sequelize,
  Member,
  Agen,
  Transaction,
  Transaction_deposit_fee_agen,
  Riwayat_fee_agen,
} = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const {
  generate_pembayaran_fee_agen,
  generate_transaction_code,
} = require("../../../helpers/random");
const { hideCurrency } = require("../../../helpers/currency");
const { info } = require("../../../helpers/user/daftar_agen/index");

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
    const inf = await info(body.id);
    // process
    try {
      await Member.update(
        { agen_id: 0, updatedAt: myDate },
        {
          where: { agen_id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // delete agen
      await Agen.destroy(
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
      this.message = `Menghapus Data Agen Dengan Agen Id : ${body.id} dan Member Name : ${inf.fullname} dan nomor whatsapp : ${inf.whatsapp_number}`;
    } catch (error) {
      this.state = false;
    }
  }

  async update() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // insert process
    try {
      // update data Member
      var data = {};
      data["fullname"] = body.name;
      data["whatsapp_number"] = body.whatsapp_number;
      data["updatedAt"] = myDate;
      // check password exist
      if (body.password != "") {
        const saltRounds = 10;
        await bcrypt
          .genSalt(saltRounds)
          .then((salt) => {
            return bcrypt.hash(body.password, salt);
          })
          .then(async (hash) => {
            data["password"] = hash;
            await Member.update(
              data,
              {
                where: { id: body.id },
              },
              {
                transaction: this.t,
              }
            );
          })
          .catch((err) => {
            this.state = false;
          });
      } else {
        await Member.update(
          data,
          {
            where: { id: body.id },
          },
          {
            transaction: this.t,
          }
        );
      }
      // write log message
      this.message = `Memperbaharui Data Member dengan Member Id : ${body.id} dan Member Name : ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  async add_kostumer_agen() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // insert process
    try {
      await Member.update(
        { agen_id: body.id, updatedAt: myDate },
        {
          where: { id: body.kostumer },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Menambahkan Kostumer Agen dengan ID Kostumer : ${body.kostumer} dan ID Agen : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  async pembayaran_fee_agen() {
    // initialize general property
    await this.initialize();

    const body = this.req.body;
    const inf = await info(body.id);
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const kode = await generate_pembayaran_fee_agen();
    const biaya = await hideCurrency(body.fee);
    const fee_sebelum = inf.fee;
    const fee_sesudah = inf.fee - biaya;
    const status =
      body.withdraw_type == "withdraw_cash"
        ? "withdraw_fee_agen"
        : "widthdraw_fee_to_saldo";

    // insert process
    try {
      await Agen.update(
        { fee: fee_sesudah, updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      await Riwayat_fee_agen.create(
        {
          agen_id: body.id,
          kode: kode,
          debet: 0,
          kredit: biaya,
          status: status,
          fee_agen_sebelum: fee_sebelum,
          fee_agen_sesudah: fee_sesudah,
          ket: "Proses Widthdraw Fee Agen",
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // filter
      if (body.withdraw_type == "withdraw_saldo") {
        var saldo_before = inf.saldo;
        var saldo_after = saldo_before + biaya;
        const transaction_code = await generate_transaction_code();
        // update saldo member
        await Member.update(
          { saldo: saldo_after, updatedAt: myDate },
          {
            where: { id: inf.member_id },
          },
          {
            transaction: this.t,
          }
        );
        // insert to transaction table
        var iT = await Transaction.create(
          {
            kode: transaction_code,
            member_id: inf.member_id,
            tipe: "deposit_fee_agen",
            saldo_before: saldo_before,
            saldo_after: saldo_after,
            ket: `Withdraw fee agen as member saldo with invoice code : ${kode}`,
            createdAt: myDate,
            updatedAt: myDate,
          },
          {
            transaction: this.t,
          }
        );
        // insert ot transaction deposit fee agen table
        await Transaction_deposit_fee_agen.create(
          {
            transaction_id: iT.id,
            nominal: biaya,
            createdAt: myDate,
            updatedAt: myDate,
          },
          {
            transaction: this.t,
          }
        );
      }
      // write log message
      this.message = `Melakukan withdraw fee keagenan dengan tipe withdraw ${status} dengan biaya withdraw : ${biaya} dan nomor invoice withdraw : ${kode}`;
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
