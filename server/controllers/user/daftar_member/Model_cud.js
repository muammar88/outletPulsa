const moment = require("moment");
const bcrypt = require("bcryptjs");
const {
  sequelize,
  Member,
  Agen,
  Transaction,
  Terima_saldo,
  Transfer_saldo,
  Transaction_deposit,
} = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const { hideCurrency } = require("../../../helpers/currency");
const { info } = require("../../../helpers/user/daftar_member/index");
const {
  generate_agen_code,
  generate_transaction_code,
} = require("../../../helpers/random");

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
    const inf = await info(body.id);
    // process
    try {
      // delete member
      await Member.destroy(
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
      this.message = `Menghapus Data Member Dengan Member Id : ${body.id} dan Member Name : ${inf.name} dan nomor whatsapp : ${inf.whatsapp_number}`;
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

  async become_agen() {
    // initialize general property
    await this.initialize();

    const body = this.req.body;
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const infos = await info(body.id);
    const gen_code = await generate_agen_code();

    // insert process
    try {
      // insert new become agen
      var insert = await Agen.create(
        {
          kode: gen_code,
          tipe_agen: "silver",
          member_id: infos.id,
          fee_agen: 0,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      this.message = `Menambahkan Agen Baru dengan Agen Id : ${insert.id}, Kode Agen : ${gen_code} dan Nama Member : ${infos.fullname}`;
    } catch (error) {
      this.state = false;
    }
  }

  async transfer_saldo() {
    // initialize general property
    await this.initialize();

    const body = this.req.body;
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const invoice_transfer = await generate_transaction_code();
    const invoice_terima = await generate_transaction_code();

    const nominal_transfer = await hideCurrency(body.saldo_yang_ditransfer);

    // info member
    const id_member = body.id;
    const info_member = await info(id_member);
    const saldo_awal_member = info_member.saldo;
    const saldo_akhir_member = info_member.saldo - nominal_transfer;

    // info target
    const id_target = body.target_transfer;
    const info_target = await info(id_target);
    const saldo_awal_target = info_target.saldo;
    const saldo_akhir_target = info_target.saldo + nominal_transfer;

    try {
      // update saldo member
      await Member.update(
        { saldo: saldo_akhir_member, updatedAt: myDate },
        {
          where: { id: id_member },
        },
        {
          transaction: this.t,
        }
      );
      // update saldo terima
      await Member.update(
        { saldo: saldo_akhir_target, updatedAt: myDate },
        {
          where: { id: id_target },
        },
        {
          transaction: this.t,
        }
      );
      // transaction for transfer
      var iTrans = await Transaction.create(
        {
          kode: invoice_transfer,
          member_id: id_member,
          tipe: "transfer_saldo",
          saldo_before: saldo_awal_member,
          saldo_after: saldo_akhir_member,
          ket: `Transfer Saldo Ke Member ID :${id_target} dengan nominal : ${nominal_transfer}`,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // transaction for terima
      var iReceive = await Transaction.create(
        {
          kode: invoice_terima,
          member_id: id_target,
          tipe: "terima_saldo",
          saldo_before: saldo_awal_target,
          saldo_after: saldo_akhir_target,
          ket: `Terima Saldo Dari Member ID :${id_member} dengan nominal : ${nominal_transfer}`,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // transfer
      await Transfer_saldo.create(
        {
          transaction_id: iTrans.id,
          biaya: nominal_transfer,
          invoice_terima: invoice_terima,
          nama_penerima: info_target.fullname,
          whatsapp_penerima: info_target.whatsapp_number,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      // terima
      await Terima_saldo.create(
        {
          transaction_id: iReceive.id,
          biaya: nominal_transfer,
          invoice_transfer: invoice_transfer,
          nama_pengirim: info_member.fullname,
          whatsapp_pengirim: info_member.whatsapp_number,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      this.message = `Melakukan transfer saldo dari member id : ${id_member} (WA : ${info_member.whatsapp_number})  ke member id ${id_target} ((WA : ${info_target.whatsapp_number})) dengan nominal ${nominal_transfer}`;
    } catch (error) {
      this.state = false;
    }
  }

  async tambah_saldo() {
    // initialize general property
    await this.initialize();

    const body = this.req.body;
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const invoice = await generate_transaction_code();
    const nominal_tambah = await hideCurrency(body.nominal);

    const id = body.id;

    const info_member = await info(id);
    const saldo_awal = info_member.saldo;
    const saldo_akhir = info_member.saldo + nominal_tambah;

    try {
      // update saldo member
      await Member.update(
        { saldo: saldo_akhir, updatedAt: myDate },
        {
          where: { id: id },
        },
        {
          transaction: this.t,
        }
      );
      // transaction for transfer
      var iTrans = await Transaction.create(
        {
          kode: invoice,
          member_id: id,
          tipe: "deposit",
          saldo_before: saldo_awal,
          saldo_after: saldo_akhir,
          ket: `Tambah Saldo Ke Member ID :${id}, Member Name : ${info.fullname} dan Nomor Whatsapp : ${info.whatsapp_number} dengan nominal : ${nominal_tambah}`,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );

      // terima
      await Transaction_deposit.create(
        {
          transaction_id: iTrans.id,
          biaya: nominal_tambah,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      this.message = `Menambah Saldo Ke Member ID :${id}, Member Name : ${info.fullname} dan Nomor Whatsapp : ${info.whatsapp_number} dengan nominal : ${nominal_tambah}`;
    } catch (error) {
      console.log("+++++++++++error");
      console.log(error);
      console.log("+++++++++++error");
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
