const moment = require("moment");
const {
  Op,
  Iak_prabayar_produk,
  Iak_prabayar_operator,
  Iak_prabayar_type,
  Produk_prabayar,
  Operator,
} = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");
const { info } = require("../../../helpers/user/iak_prabayar/index");

const Iak = require("../../../library/iak");

class Model_r {
  constructor(req) {
    this.req = req;
    this.json;
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

    if (body.operator != 0) {
      where = { ...where, ...{ operator_id: body.operator } };
    }

    if (body.koneksi != "semua") {
      if (body.koneksi == "sudah_konek") {
        where = { ...where, ...{ produk_id: { [Op.ne]: null } } };
      } else {
        where = { ...where, ...{ produk_id: null } };
      }
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "DESC"]];
    sql["attributes"] = [
      "id",
      "kode",
      "name",
      "price",
      "status",
      "produk_id",
      "updatedAt",
    ];
    sql["where"] = where;

    sql["include"] = [
      {
        required: true,
        model: Iak_prabayar_operator,
        attributes: ["name"],
        include: {
          required: true,
          model: Iak_prabayar_type,
          attributes: ["type"],
        },
      },
    ];

    const query = await db_list_server(sql);
    const q = await Iak_prabayar_produk.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    var list_produk_id = [];
    if (total > 0) {
      await Iak_prabayar_produk.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              name: e.name,
              price: e.price,
              status: e.status,
              operator: e.Iak_prabayar_operator.name,
              type: e.Iak_prabayar_operator.Iak_prabayar_type.type,
              koneksi: {},
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            if (e.produk_id != null) {
              list_produk_id[e.produk_id] = i;
            }
            i++;
          })
        );
      });

      // convert array to object
      const tempListProdukId = Object.assign({}, list_produk_id);

      if (Object.keys(tempListProdukId).length > 0) {
        let ids = Object.keys(tempListProdukId);
        await Produk_prabayar.findAll({
          attributes: ["id", "kode", "name"],
          where: { id: { [Op.in]: ids } },
          include: {
            required: true,
            model: Operator,
            attributes: ["name"],
          },
        }).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              list[list_produk_id[e.id]].koneksi = {
                kode: e.kode,
                name: e.name,
                operator:
                  e.Operator != null
                    ? e.Operator.name
                    : "<b style='color :red'>Operator NULL</b>",
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

  async get_operator_iak() {
    var list = [];
    await Iak_prabayar_operator.findAll().then(async (value) => {
      var i = 0;
      await Promise.all(
        await value.map(async (e) => {
          list[i] = {
            id: e.id,
            name: e.name,
          };
          i++;
        })
      );
    });
    return { error: false, data: list };
  }

  async info_sinkronisasi_produk_iak() {
    try {
      var list_produk_id = [];
      await Iak_prabayar_produk.findAll({
        where: { produk_id: { [Op.ne]: null } },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list_produk_id[i] = e.produk_id;
            i++;
          })
        );
      });

      var where = {};
      if (list_produk_id.length > 0) {
        where = { id: { [Op.notIn]: list_produk_id } };
      }

      var list = [];
      await Produk_prabayar.findAll({
        where: where,
        include: {
          required: true,
          model: Operator,
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
              operator: e.Operator.name,
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

  async operator_types() {
    var list = [];
    await Iak_prabayar_operator.findAll({
      attributes: ["id", "name"],
      include: {
        required: true,
        model: Iak_prabayar_type,
        attributes: ["type"],
      },
    }).then(async (e) => {
      var i = 0;
      await Promise.all(
        await e.map(async (a) => {
          list[i] = {
            operator_id: a.id,
            operator: a.name,
            type: a.Iak_prabayar_type.type,
          };
          i++;
        })
      );
    });

    return list;
  }

  async kode_produk_iak() {
    var list = [];
    await Iak_prabayar_produk.findAll({
      attributes: ["kode"],
    }).then(async (e) => {
      var i = 0;
      await Promise.all(
        await e.map(async (a) => {
          list[i] = a.kode;
          i++;
        })
      );
    });
    return list;
  }

  async update_produk_prabayar_iak() {
    try {
      const operator_type = await this.operator_types();
      const kode_produk = await this.kode_produk_iak();
      const iak = new Iak();

      await operator_type.map(async (j) => {
        await iak.get_product_prabayar_iak(
          j.type,
          j.operator,
          j.operator_id,
          async function (json) {
            const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            const dt = json.data;
            const operator_id = json.operator_id;

            if (dt != undefined) {
              var data_insert = [];
              var data_update = [];
              var y = 0;
              var z = 0;

              for (let x in dt) {
                if (!kode_produk.includes(dt[x].product_code)) {
                  // insert
                  data_insert[y] = {
                    operator_id: operator_id,
                    kode: dt[x].product_code,
                    name: dt[x].product_nominal,
                    price: dt[x].product_price,
                    status: dt[x].status,
                    createdAt: myDate,
                    updatedAt: myDate,
                  };
                  y++;
                } else {
                  // update
                  data_update[z] = {
                    param: dt[x].product_code,
                    data: {
                      price: dt[x].product_price,
                      status: dt[x].status,
                      updatedAt: myDate,
                    },
                  };
                  z++;
                }
              }

              if (data_insert != undefined) {
                for (let x in data_insert) {
                  await Iak_prabayar_produk.create(data_insert[x]);
                }
              }

              if (data_update != undefined) {
                for (let x in data_update) {
                  await Iak_prabayar_produk.update(data_update[x].data, {
                    where: { kode: data_update[x].param },
                  });
                }
              }
            }
          }
        );
      });
      return { error: false };
    } catch (error) {
      return { error: true };
    }
  }
}

module.exports = Model_r;
