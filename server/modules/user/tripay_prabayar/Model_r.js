const moment = require("moment");
const {
  Op,
  Tripay_prabayar_produk,
  Tripay_prabayar_operator,
  Tripay_prabayar_kategori,
  Produk_prabayar,
  Operator,
} = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");
const { info } = require("../../../helpers/user/tripay_prabayar/index");
const Tripay = require("../../../library/tripay");

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

    var where = {
      status: body.active == "active" ? "tersedia" : "tidak tersedia",
    };
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
      "deskripsi",
      "updatedAt",
    ];
    sql["where"] = where;

    sql["include"] = [
      {
        required: true,
        model: Tripay_prabayar_operator,
        attributes: ["kode", "name"],
        include: {
          required: true,
          model: Tripay_prabayar_kategori,
          attributes: ["name", "type"],
        },
      },
    ];

    const query = await db_list_server(sql);
    const q = await Tripay_prabayar_produk.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    var list_produk_id = [];
    if (total > 0) {
      await Tripay_prabayar_produk.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              name: e.name,
              price: e.price,
              status: e.status,
              operator: e.Tripay_prabayar_operator.name,
              type: e.Tripay_prabayar_operator.Tripay_prabayar_kategori.type,
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

  async get_operator_tripay() {
    var list = [];
    await Tripay_prabayar_operator.findAll().then(async (value) => {
      var i = 0;
      await Promise.all(
        await value.map(async (e) => {
          list[i] = {
            id: e.id,
            kode: e.kode,
            name: e.name,
          };
          i++;
        })
      );
    });
    return { error: false, data: list };
  }

  async info_sinkronisasi_produk_tripay() {
    try {
      var list_produk_id = [];
      await Tripay_prabayar_produk.findAll({
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

  async update_produk_prabayar_tripay() {
    const tripay = new Tripay();
    const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
    try {
      await tripay.get_produk(async (json) => {
        if (json.success == true) {
          var operator_id = [];
          await Tripay_prabayar_operator.findAll({
            attributes: ["id"],
          }).then(async (value) => {
            var i = 0;
            await Promise.all(
              value.map(async (e) => {
                operator_id[i] = e.id;
                i++;
              })
            );
          });
          var data = json.data;
          await Tripay_prabayar_produk.update(
            {
              status: "tidak tersedia",
              updatedAt: myDate,
            },
            { where: {} }
          );
          await data.map(async (e) => {
            const q_total = await Tripay_prabayar_produk.findAndCountAll({
              where: { kode: e.code },
            });
            const total = await q_total.count;
            if (total > 0) {
              await Tripay_prabayar_produk.update(
                {
                  price: e.price,
                  status: e.status == 1 ? "tersedia" : "tidak tersedia",
                  updatedAt: myDate,
                },
                { where: { kode: e.code } }
              );
            } else {
              if (operator_id.includes(e.pembelianoperator_id)) {
                await Tripay_prabayar_produk.create({
                  operator_id: e.pembelianoperator_id,
                  kode: e.code,
                  name: e.product_name,
                  price: e.price,
                  deskripsi: e.desc,
                  status: e.status == 1 ? "tersedia" : "tidak tersedia",
                  createdAt: myDate,
                  updatedAt: myDate,
                });
              }
            }
          });
        }
      });
      return { error: false };
    } catch (error) {
      return { error: true };
    }
  }
}

module.exports = Model_r;
