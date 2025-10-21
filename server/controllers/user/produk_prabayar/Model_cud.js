const moment = require("moment");
const { sequelize, Produk_prabayar, Op } = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const { hideCurrency } = require("../../../helpers/currency");
const {
  info_produk,
  server_price,
} = require("../../../helpers/user/produk_prabayar/index");

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

  /**
   * Fungsi untuk mengubah urutan produk prabayar
   **/
  async ubah_urutan() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // process
    try {
      // update data Produk Prabayar
      await Produk_prabayar.update(
        { urutan: body.urutan, updatedAt: myDate },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Mengubah urutan Produk Prabayar dengan produk ID : ${body.id}`;
    } catch (error) {
      this.state = false;
    }
  }

  /**
   * Fungsi untuk menambah produk prabayar baru
   **/
  async add_produk_prabayar() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;

    // insert process
    try {
      // insert new produk
      var insert = await Produk_prabayar.create(
        {
          kode: body.kode,
          name: body.name,
          status: "active",
          operator_id: body.operator,
          createdAt: myDate,
          updatedAt: myDate,
        },
        {
          transaction: this.t,
        }
      );
      this.message = `Menambahkan Produk Prabayar Baru dengan Produk Prabayar Id : ${insert.id}, Kode Produk : ${body.kode} dan Nama Produk : ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  /**
   * Fungsi untuk menghapus produk prabayar
   **/
  async delete_produk_prabayar() {
    // initialize general property
    await this.initialize();

    const body = this.req.body;
    const inf = await info_produk(body.id);
    // process
    try {
      // delete produk prabayar
      await Produk_prabayar.destroy(
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
      this.message = `Menghapus Data Produk Prabayar dengan Produk Prabayar Id : ${body.id} dan Kode Produk : ${inf.kode} dan Nama Produk : ${inf.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  /**
   * Fungsi untuk memilih server secara manual
   **/
  async pilih_server_manual() {
    // initialize general property
    await this.initialize();

    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const harga_server = await server_price(body.id, body.server_id);
    // insert process
    try {
      await Produk_prabayar.update(
        {
          purchase_price: harga_server,
          server_id: body.server_id,
          updatedAt: myDate,
        },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // write log message
      this.message = `Melakukan pemilihan server manual dengan server ID : ${body.server_id}`;
    } catch (error) {
      this.state = false;
    }
  }

  /**
   * Fungsi untuk mengupdate produk prabayar
   **/
  async update_produk_prabayar() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const info = await info_produk(body.id);
    // process
    try {
      // update data Produk Prabayar
      await Produk_prabayar.update(
        {
          kode: body.kode,
          name: body.name,
          operator_id: body.operator,
          updatedAt: myDate,
        },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Melakukan Update Produk Prabayar Dengan Produk Prabayar ID : ${body.id}, Kode Produk : ${info.kode} dan Nama Produk :  ${info.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  /**
   * Fungsi untuk mengupdate markup produk prabayar
   **/
  async update_markup_produk_prabayar() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const info = await info_produk(body.id);
    const markup = await hideCurrency(body.markup);
    // process
    try {
      // update Markup data Produk Prabayar
      await Produk_prabayar.update(
        {
          markup: markup,
          updatedAt: myDate,
        },
        {
          where: { id: body.id },
        },
        {
          transaction: this.t,
        }
      );
      // message log
      this.message = `Melakukan Update Marup Produk Prabayar Dengan Produk Prabayar ID : ${body.id}, Kode Produk : ${info.kode} dan Nama Produk :  ${info.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  /**
   * Fungsi untuk memilih produk seller terbaik
   **/
  async pilih_produk_seller_terbaik(data) {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const server_id = { iak: 1, tripay: 2, digiflaz: 3 };
    // process
    try {
      // pilih produk seller terbaik
      for (let x in data) {
        var server_select = "";
        var purchase_price = "";
        for (let z in data[x].select_produk_server) {
          server_select = z;
          purchase_price = data[x].select_produk_server[z];
        }
        await Produk_prabayar.update(
          {
            purchase_price: purchase_price,
            server_id: server_id[server_select],
            updatedAt: myDate,
          },
          {
            where: { id: data[x].id },
          },
          {
            transaction: this.t,
          }
        );
      }
      // message log
      this.message = `Melakukan Mencari Seller Terbaik`;
    } catch (error) {
      this.state = false;
    }
  }

  /**
   * Fungsi untuk melakukan markup seluruh produk prabayar
   **/
  async markup_produk_prabayar_all(data) {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const server_id = { iak: 1, tripay: 2, digiflaz: 3 };
    // process markup seluruh produk prabayar
    try {
      for (let x in data) {
        await Produk_prabayar.update(
          {
            markup: data[x].markup,
            updatedAt: myDate,
          },
          {
            where: { id: data[x].id },
          },
          {
            transaction: this.t,
          }
        );
      }
      // message log
      this.message = `Melakukan Markup Untuk Seluruh Produk Prabayar`;
    } catch (error) {
      this.state = false;
    }
  }

  async upload_excel(data) {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    try {
      for (let x in data) {
        await Produk_prabayar.update(
          {
            urutan: data[x]["NOMOR URUT"],
            updatedAt: myDate,
          },
          {
            where: { kode: data[x]["KODE PRODUK"] },
          },
          {
            transaction: this.t,
          }
        );
      }
      // message log
      this.message = `Melakukan Update Data Produk Prabayar`;
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
