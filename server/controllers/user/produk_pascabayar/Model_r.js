const moment = require("moment");
const {
  Op,
  Kategori,
  Produk_pascabayar,
  Server,
} = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  // get data in server side
  async server_side() {
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined) page = body.pageNumber;

    var where = {};
    if (body.search != undefined && body.search != "") {
      where = {
        [Op.or]: [
          { kode: { [Op.like]: "%" + body.search + "%" } },
          { name: { [Op.like]: "%" + body.search + "%" } },
        ],
      };
    }

    var where_kategori = {};
    if (body.kategori != 0) {
      where_kategori = {
        ...where_kategori,
        ...{ id: body.kategori },
      };
    }

    if (body.server != 0) {
      where = { ...where, ...{ server_id: body.server } };
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["updatedAt", "DESC"]];
    sql["attributes"] = [
      "id",
      "kode",
      "name",
      "fee",
      "comission",
      "outletFee",
      "status",
      "updatedAt",
    ];
    sql["where"] = where;
    sql["include"] = [
      { required: true, model: Server, attributes: ["kode", "name"] },
      {
        required: true,
        model: Kategori,
        attributes: ["kode", "name"],
        where: where_kategori,
      },
    ];

    const query = await db_list_server(sql);
    const q = await Produk_pascabayar.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    if (total > 0) {
      await Produk_pascabayar.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              name: e.name,
              kategori: e.Kategori.name,
              fee: e.fee,
              status: e.status,
              comission: e.comission,
              outletFee: e.outletFee,
              kode_server: e.Server == null ? "" : e.Server.kode,
              nama_server: e.Server == null ? "" : e.Server.name,
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            i++;
          })
        );
      });
    }

    return {
      data: list,
      total: total,
    };
  }

  /**
   * Fungsi untuk mengambil informasi dari parameter produk pascabayar
   **/
  async get_param_produk_pascabayar() {
    var list_kategori = [];
    await Kategori.findAll({
      attributes: ["id", "kode", "name"],
      where: { type: "pascabayar" },
    }).then(async (value) => {
      var i = 0;
      await Promise.all(
        await value.map(async (e) => {
          list_kategori[i] = {
            id: e.id,
            kode: e.kode,
            name: e.name,
          };
          i++;
        })
      );
    });

    var list_server = [];
    await Server.findAll({
      attributes: ["id", "kode", "name"],
    }).then(async (value) => {
      var i = 0;
      await Promise.all(
        await value.map(async (e) => {
          list_server[i] = {
            id: e.id,
            kode: e.kode,
            name: e.name,
          };
          i++;
        })
      );
    });

    return {
      error: false,
      data: { kategori: list_kategori, server: list_server },
    };
  }

  //

  /**
   * Fungsi untuk mengambil informasi saat melakukan add produk pascabayar
   **/
  async get_info_add_produk_pascabayar() {
    try {
      var list_kategori = [];
      await Kategori.findAll({
        where: { type: "pascabayar" },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list_kategori[i] = { id: e.id, kode: e.kode, name: e.name };
            i++;
          })
        );
      });

      return { error: false, data: { list_kategori: list_kategori } };
    } catch (error) {
      return { error: true };
    }
  }

  async info_edit() {
    const body = this.req.body;
    try {
      var data = [];
      await Kategori.findAll({
        where: { type: "pascabayar" },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            data[i] = { id: e.id, kode: e.kode, name: e.name };
            i++;
          })
        );
      });

      var values = [];
      await Produk_pascabayar.findAll({
        attributes: ["id", "kode", "name", "kategori_id"],
        where: { id: body.id },
      }).then(async (v) => {
        var i = 0;
        await Promise.all(
          await v.map(async (e) => {
            values = {
              id: e.id,
              kode: e.kode,
              name: e.name,
              kategori_id: e.kategori_id,
            };
            i++;
          })
        );
      });
      return { error: false, data: data, value: values };
    } catch (error) {
      return { error: true };
    }
  }

  async get_info_markup_produk_pascabayar() {
    const body = this.req.body;
    try {
      var values = [];
      await Produk_pascabayar.findAll({
        attributes: ["id", "outletFee"],
        where: { id: body.id },
      }).then(async (v) => {
        var i = 0;
        await Promise.all(
          await v.map(async (e) => {
            values = {
              id: e.id,
              markup: e.outletFee,
            };
            i++;
          })
        );
      });
      return { error: false, value: values };
    } catch (error) {
      return { error: true };
    }
  }
}

module.exports = Model_r;
