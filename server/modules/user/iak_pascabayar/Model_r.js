const moment = require("moment");
const {
  Op,
  Iak_pascabayar_product,
  Iak_pascabayar_type,
  Produk_pascabayar,
  Kategori,
} = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");
const { info } = require("../../../helpers/user/iak_pascabayar/index");
const Iak = require("../../../library/iak");

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

    var where = { status: body.active == "active" ? "active" : "non active" };
    if (body.search != undefined && body.search != "") {
      where = {
        ...where,
        ...{
          [Op.or]: [
            { kode: { [Op.like]: "%" + body.search + "%" } },
            { name: { [Op.like]: "%" + body.search + "%" } },
          ],
        },
      };
    }

    if (body.tipe != 0) {
      where = { ...where, ...{ type_id: body.tipe } };
    }

    if (body.koneksi != "semua") {
      if (body.koneksi == "sudah_konek") {
        where = { ...where, ...{ produk_pascabayar_id: { [Op.ne]: null } } };
      } else {
        where = { ...where, ...{ produk_pascabayar_id: null } };
      }
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "DESC"]];
    sql["attributes"] = [
      "id",
      "code",
      "name",
      "status",
      "fee",
      "komisi",
      "produk_pascabayar_id",
      "updatedAt",
    ];
    sql["where"] = where;

    sql["include"] = [
      {
        required: true,
        model: Iak_pascabayar_type,
        attributes: ["type"],
      },
    ];

    const query = await db_list_server(sql);
    const q = await Iak_pascabayar_product.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    var list_produk_pascabayar_id = [];
    if (total > 0) {
      await Iak_pascabayar_product.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.code,
              name: e.name,
              status: e.status,
              fee: e.fee,
              komisi: e.komisi,
              koneksi: {},
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            if (e.produk_pascabayar_id != null) {
              list_produk_pascabayar_id[e.produk_pascabayar_id] = i;
            }
            i++;
          })
        );
      });

      const tempListProdukPascabayarId = Object.assign(
        {},
        list_produk_pascabayar_id
      );

      if (Object.keys(tempListProdukPascabayarId).length > 0) {
        let ids = Object.keys(tempListProdukPascabayarId);
        await Produk_pascabayar.findAll({
          attributes: ["id", "kode", "name"],
          where: { id: { [Op.in]: ids } },
          include: {
            required: true,
            model: Kategori,
            attributes: ["kode", "name"],
          },
        }).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              list[list_produk_pascabayar_id[e.id]].koneksi = {
                kode: e.kode,
                name: e.name,
                tipe:
                  e.Kategori != null
                    ? "(" + e.Kategori.kode + ") " + e.Kategori.name
                    : "<b style='color :red'>Tipe NULL</b>",
              };
            })
          );
        });
      }
    }

    return {
      data: list,
      total: total,
    };
  }

  async get_tipe_iak() {
    var list = [];
    await Iak_pascabayar_type.findAll().then(async (value) => {
      var i = 0;
      await Promise.all(
        await value.map(async (e) => {
          list[i] = {
            id: e.id,
            name: e.type,
          };
          i++;
        })
      );
    });
    return { error: false, data: list };
  }

  async info_sinkronisasi_produk_pascabayar_iak() {
    try {
      var list_produk_pascabayar_id = [];
      await Iak_pascabayar_product.findAll({
        where: { produk_pascabayar_id: { [Op.ne]: null } },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list_produk_pascabayar_id[i] = e.produk_pascabayar_id;
            i++;
          })
        );
      });
      var where = {};
      if (list_produk_pascabayar_id.length > 0) {
        where = { id: { [Op.notIn]: list_produk_pascabayar_id } };
      }

      var list = [];
      await Produk_pascabayar.findAll({
        where: where,
        include: {
          required: true,
          model: Kategori,
          attributes: ["name"],
        },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              name: e.name,
              kategori: e.Kategori.name,
            };
            i++;
          })
        );
      });

      return { error: false, data: list };
    } catch (error) {
      return { error: true };
    }
  }

  async iak_type() {
    var type = [];
    var list_type = {};
    await Iak_pascabayar_type.findAll({
      attributes: ["id", "type"],
    }).then(async (e) => {
      var i = 0;
      await Promise.all(
        await e.map(async (a) => {
          type[i] = a.type;
          list_type[a.type] = a.id;
          i++;
        })
      );
    });
    return { type, list_type };
  }

  async iak_produk_pascabayar() {
    var product = [];
    await Iak_pascabayar_product.findAll({
      attributes: ["code"],
    }).then(async (e) => {
      var j = 0;
      await Promise.all(
        await e.map(async (a) => {
          product[j] = a.code;
          j++;
        })
      );
    });
    return product;
  }

  async update_produk_pascabayar_iak() {
    const iakType = await this.iak_type();
    const type = iakType.type;
    const list_type = iakType.list_type;
    const product = await this.iak_produk_pascabayar();
    const iak = new Iak();
    try {
      await iak.get_produk_pascabayar_iak(async (json) => {
        var data = json.data.pasca;
        const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
        var insertData = [];
        await data.map(async (dat) => {
          if (product.includes(dat.code)) {
            // update data Produk Pascabayar
            await Iak_pascabayar_product.update(
              {
                status: dat.status == 1 ? "active" : "non active",
                fee: dat.fee,
                komisi: dat.komisi,
                updatedAt: myDate,
              },
              {
                where: { code: dat.code },
              }
            );
          } else {
            if (insertData.includes(dat.code)) {
              // update data Produk Pascabayar
              await Iak_pascabayar_product.update(
                {
                  status: dat.status == 1 ? "active" : "non active",
                  fee: dat.fee,
                  komisi: dat.komisi,
                  updatedAt: myDate,
                },
                {
                  where: { code: dat.code },
                }
              );
            } else {
              // insert
              if (type.includes(dat.type)) {
                // insert
                await Iak_pascabayar_product.create({
                  code: dat.code,
                  name: dat.name,
                  status: dat.status == 1 ? "active" : "non active",
                  fee: dat.fee,
                  komisi: dat.komisi,
                  type_id: list_type[dat.type],
                  createdAt: myDate,
                  updatedAt: myDate,
                });
              } else {
                const i = await Iak_pascabayar_type.create({
                  type: dat.type,
                  createdAt: myDate,
                  updatedAt: myDate,
                });
                // insert
                await Iak_pascabayar_product.create({
                  code: dat.code,
                  name: dat.name,
                  status: dat.status == 1 ? "active" : "non active",
                  fee: dat.fee,
                  komisi: dat.komisi,
                  type_id: i.id,
                  createdAt: myDate,
                  updatedAt: myDate,
                });
              }
            }
          }
        });
      });
      return { error: false };
    } catch (error) {
      return { error: true };
    }
  }
}

module.exports = Model_r;
