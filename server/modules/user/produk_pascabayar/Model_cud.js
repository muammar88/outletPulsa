const moment = require("moment");
const {
  sequelize,
  Produk_pascabayar,
  Iak_prabayar_produk,
  Iak_pascabayar_product,
} = require("../../../db/models");
const { write_log } = require("../../../helpers/user/write_log");
const {
  info_produk_pascabayar,
} = require("../../../helpers/user/produk_pascabayar/index");

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
    // insert process
    try {
      const insert = await Produk_pascabayar.create(
        {
          kategori_id: body.kategori,
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
      this.message = `Menambahkan Produk Pascabayar dengan  Produk Pascabayar ID : ${insert.id} dan Kode Produk Pascabayar : ${body.kode} dan Nama Produk Pascabayar : ${body.name}`;
    } catch (error) {
      this.state = false;
    }
  }

  async delete() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const inf = await info_produk_pascabayar(body.id);
    // process
    try {
      // delete produk pascabayar
      await Produk_pascabayar.destroy(
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
      this.message = `Menghapus Data Produk Pascabayar dengan Produk Pascabayar Id : ${body.id} dan kode Produk Pascabayar : ${inf.kode}`;
    } catch (error) {
      this.state = false;
    }
  }

  async update() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const inf = await info_produk_pascabayar(body.id);
    // insert process
    try {
      // update data Produk Pascabayar
      await Produk_pascabayar.update(
        {
          kategori_id: body.kategori,
          kode: body.kode,
          name: body.name,
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
      this.message = `Memperbaharui Data Produk Pascabayar dengan Produk Pascabayar Id : ${body.id} dan Kode Produk Pascabayar Sebelumnya : ${inf.kode} `;
    } catch (error) {
      this.state = false;
    }
  }

  async update_markup() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    const inf = await info_produk_pascabayar(body.id);
    const markup = await hideCurrency(body.markup);
    // insert process
    try {
      // update data markup Produk Pascabayar
      await Produk_pascabayar.update(
        {
          outletFee: markup,
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
      this.message = `Memperbaharui Data Markup Produk Pascabayar dengan Produk Pascabayar Id : ${body.id} dan Markup Produk Pascabayar Sebelumnya : ${inf.kode} `;
    } catch (error) {
      this.state = false;
    }
  }

  async update_markup_all_produk() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    var nominal_1 = await hideCurrency(body.nominal_1);
    var nominal_2 = await hideCurrency(body.nominal_2);
    var nominal_3 = await hideCurrency(body.nominal_3);
    // insert process
    try {
      var markup = [];
      await Produk_pascabayar.findAll({
        attributes: ["id", "comission"],
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          value.map(async (e) => {
            if (e.comission >= 1 && e.comission <= 1000) {
              markup[i] = { id: e.id, markup: nominal_1 };
            } else if (e.comission >= 1001 && e.comission <= 2000) {
              markup[i] = { id: e.id, markup: nominal_2 };
            } else if (e.comission >= 2001) {
              markup[i] = { id: e.id, markup: nominal_3 };
            }
            i++;
          })
        );
      });
      await Promise.all(
        markup.map(async (a) => {
          await Produk_pascabayar.update(
            {
              outletFee: a.markup,
              updatedAt: myDate,
            },
            {
              where: { id: a.id },
            }
          );
        })
      );
      // write log message
      this.message = `Memperbaharui Data Markup Seluruh Produk Pascabayar `;
    } catch (error) {
      this.state = false;
    }
  }

  async update_harga_produk_pascabayar() {
    // initialize general property
    await this.initialize();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    const body = this.req.body;
    // insert process
    try {
      var list_produk_iak = {};
      await Iak_pascabayar_product.findAll({
        attributes: ["fee", "komisi", "produk_pascabayar_id"],
        where: {
          status: "active",
        },
        include: [
          {
            required: true,
            model: Produk_pascabayar,
          },
        ],
      }).then(async (tripay) => {
        var i = 0;
        await Promise.all(
          await tripay.map(async (a) => {
            list_produk_iak[i] = {
              id: a.produk_pascabayar_id,
              fee: a.fee,
              komisi: a.komisi,
            };
            i++;
          })
        );
      });

      for (let x in list_produk_iak) {
        await Produk_pascabayar.update(
          {
            fee: list_produk_iak[x].fee,
            comission: list_produk_iak[x].komisi,
            updatedAt: myDate,
          },
          {
            where: { id: list_produk_iak[x].id },
          }
        );
      }

      // write log message
      this.message = `Memperbaharui Data Harga Seluruh Produk Pascabayar `;
    } catch (error) {
      this.state = false;
    }
  }

  // // const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  // await Produk_pascabayar.findAll({
  //   attributes: ["id", "fee", "comission"],
  // }).then(async (value) => {
  //   await Promise.all(
  //     value.map(async (e) => {
  //       // if (list_produk_iak[e.id] !== undefined) {
  //       //   await Produk_pascabayar.update(
  //       //     {
  //       //       fee: list_produk_iak[e.id].fee,
  //       //       comission: list_produk_iak[e.id].komisi,
  //       //       updatedAt: myDate,
  //       //     },
  //       //     {
  //       //       where: { id: e.id },
  //       //     }
  //       //   );
  //       // }
  //     })
  //   ).then((x) => {
  //     res.status(200).json({
  //       msg: "Proses Update Harga Produk Pascabayar berhasil dilakukan.",
  //     });
  //   });
  // });
  // var markup = [];
  // await Produk_pascabayar.findAll({
  //   attributes: ["id", "comission"],
  // }).then(async (value) => {
  //   var i = 0;
  //   await Promise.all(
  //     value.map(async (e) => {
  //       if (e.comission >= 1 && e.comission <= 1000) {
  //         markup[i] = { id: e.id, markup: nominal_1 };
  //       } else if (e.comission >= 1001 && e.comission <= 2000) {
  //         markup[i] = { id: e.id, markup: nominal_2 };
  //       } else if (e.comission >= 2001) {
  //         markup[i] = { id: e.id, markup: nominal_3 };
  //       }
  //       i++;
  //     })
  //   );
  // });
  // await Promise.all(
  //   markup.map(async (a) => {
  //     await Produk_pascabayar.update(
  //       {
  //         outletFee: a.markup,
  //         updatedAt: myDate,
  //       },
  //       {
  //         where: { id: a.id },
  //       }
  //     );
  //   })
  // );

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
