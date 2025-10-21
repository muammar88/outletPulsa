const moment = require("moment");
const {
  sequelize,
  Op,
  Transaction,
  Transaction_pascabayar,
  Transaction_prabayar,
} = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const { info } = require("../../../helpers/user/daftar_transaksi/index");

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
    const inf = await info(body.id); // info server
    // process
    try {
      if (inf.tipe == "beli_produk_prabayar") {
        // delete transaction prabayar
        await Transaction_prabayar.destroy(
          {
            where: {
              transaction_id: body.id,
            },
          },
          {
            transaction: this.t,
          }
        );
      } else if (inf.tipe == "beli_produk_pascabayar") {
        // delete transaction pascabayar
        await Transaction_pascabayar.destroy(
          {
            where: {
              transaction_id: body.id,
            },
          },
          {
            transaction: this.t,
          }
        );
      }
      // delete Transaction table
      await Transaction.destroy(
        {
          where: {
            id: body.id,
            tipe: {
              [Op.in]: ["beli_produk_prabayar", "beli_produk_pascabayar"],
            },
          },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Menghapus Data Transaksi Dengan Transaksi Id : ${
        body.id
      }, Kode Transaksi : ${inf.kode} Tipe Transksi : ${
        inf.tipe == "beli_produk_prabayar" ? "Prabayar" : "Pascabayar"
      }`;
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
