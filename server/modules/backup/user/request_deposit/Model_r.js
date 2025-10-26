const jwt = require("jsonwebtoken");
const moment = require("moment");
const {
  Op,
  Member,
  Bank_transfer,
  Transaction,
  Request_deposit,
} = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  /**
   * Fungsi untuk mengambil data produk prabayar dari database
   **/
  async server_side() {
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined) page = body.pageNumber;

    var where = {};

    // if (body.active) {
    //   where = {
    //     ...where,
    //     ...{ status: body.active == "active" ? "active" : "inactive" },
    //   };
    // }

    var where_member = {};

    if (body.search != undefined && body.search != "") {
      where = {
        ...where,
        ...{
          [Op.or]: [{ kode: { [Op.like]: "%" + body.search + "%" } }],
        },
      };
      where_member = {
        [Op.or]: [
          { fullname: { [Op.like]: "%" + body.search + "%" } },
          { whatsapp_number: { [Op.like]: "%" + body.search + "%" } },
        ],
      };
    }

    // if (body.server != 0) {
    //   where = { ...where, ...{ server_id: body.server } };
    // }

    // var where_member = {};

    // if (body.operator != 0) {
    //   where = { ...where, ...{ operator_id: body.operator } };
    // } else {
    //   if (body.kategori != 0) {
    //     where_kategori = {
    //       ...where_kategori,
    //       ...{ id: body.kategori },
    //     };
    //   }
    // }

    // if (body.koneksi != "semua") {
    //   if (body.koneksi == "sudah_konek") {
    //     where = { ...where, ...{ server_id: { [Op.ne]: null } } };
    //   } else {
    //     where = { ...where, ...{ server_id: { [Op.eq]: null } } };
    //   }
    // }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "DESC"]];
    sql["attributes"] = [
      "id",
      // "urutan",
      "kode",
      "nominal",
      "nominal_tambahan",
      "status",
      "waktu_request",
      "status_kirim",
      "action_do",
      "biaya_admin",
      "waktu_kirim",
      "alasan_penolakan",
      "updatedAt",
    ];
    sql["where"] = where;
    sql["include"] = [
      {
        required: false,
        model: Bank_transfer,
        attributes: ["account_name", "account_number"],
      },
      {
        required: false,
        model: Transaction,
        attributes: ["kode", "saldo_before", "saldo_after"],
      },
      {
        required: true,
        model: Member,
        attributes: ["fullname", "whatsapp_number", "status"],
        where: where_member,
      },
    ];

    const query = await db_list_server(sql);
    const q = await Request_deposit.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    // var list_produk_id = [];
    if (total > 0) {
      await Request_deposit.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              // urutan: e.urutan,
              kode: e.kode,
              nominal: e.nominal,
              nominal_tambahan: e.nominal_tambahan,
              status: e.status,
              waktu_request: e.waktu_request,
              status_kirim: e.status_kirim,
              waktu_kirim: e.waktu_kirim,
              action_do: e.action_do,
              biaya_admin: e.biaya_admin,
              nama_member: e.Member.fullname,
              nomor_whatsapp: e.Member.whatsapp_number,
              status_member: e.Member.status,
              alasan_penolakan: e.alasan_penolakan,
              // name: e.name,
              // kategori: e.Operator.Kategori.name,
              // operator: e.Operator.name,
              // harga_server: e.purchase_price,
              // markup: e.markup,
              // status: e.status,
              // server_name:
              //   e.Server != null ? e.Server.name : "Server Tidak Ditemukan",
              // koneksi: {},
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            // list_produk_id[i] = e.id;
            i++;
          })
        );
      });
    }

    // "kode",
    //   "nominal",
    //   "nominal_tambahan",
    //   "status",
    //   "waktu_request",
    //   "status_kirim",
    //   "action_do",
    //   "biaya_admin",

    return {
      data: list,
      total: total,
    };
  }

  /**
   * Fungsi untuk mengambil informasi dari parameter produk prabayar
   **/
  async get_param_produk_prabayar() {
    var list_kategori = [];
    await Kategori.findAll({
      attributes: ["id", "kode", "name"],
      where: { type: "prabayar" },
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

  /**
   * Fungsi untuk mengambil informasi operator berdasarkan kategori id
   **/
  async get_operator_produk() {
    const body = this.req.body;
    try {
      var data = [];
      await Operator.findAll({
        attributes: ["id", "kode", "name"],
        where: { kategori_id: body.id },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            data[i] = {
              id: e.id,
              kode: e.kode,
              name: e.name,
            };
            i++;
          })
        );
      });
      return { error: false, data: data };
    } catch (error) {
      return { error: true };
    }
  }

  /**
   * Fungsi untuk mengambil informasi operator saat pertama sekali melakuka penambahan produk prabayar
   **/
  async get_info_add_operator_by_kategori(kategori_id) {
    const body = this.req.body;
    try {
      var list_operator = [];
      await Operator.findAll({
        where: { kategori_id: body.kategori_id },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list_operator[i] = { id: e.id, kode: e.kode, name: e.name };
            i++;
          })
        );
      });

      return { error: false, data: list_operator };
    } catch (error) {
      return { error: true };
    }
  }

  /**
   * Fungsi untuk mengambil informasi daftar server terkoneksi
   **/
  async get_daftar_server_terkoneksi() {
    const body = this.req.body;
    try {
      var id = body.id;
      var list = [];
      var i = 0;

      var server_id = "";
      // tripay
      await Produk_prabayar.findOne({
        where: { id: id },
      }).then(async (val) => {
        if (val) {
          server_id = val.server_id;
        }
      });

      // tripay
      await Tripay_prabayar_produk.findOne({
        where: { produk_id: id },
      }).then(async (val) => {
        if (val) {
          list[i] = {
            id: 2,
            kode: val.kode,
            name: val.name,
            price: val.price,
            server_name: "Tripay",
          };
          i++;
        }
      });

      // iak
      await Iak_prabayar_produk.findOne({
        where: { produk_id: id },
      }).then(async (val) => {
        if (val) {
          list[i] = {
            id: 1,
            kode: val.kode,
            name: val.name,
            price: val.price,
            server_name: "Iak",
          };
          i++;
        }
      });

      // digiflazz
      await Digiflazz_product.findOne({
        where: { produk_id: id },
      }).then(async (val) => {
        if (val) {
          list[i] = {
            id: 3,
            kode: val.selectedSellerBuyerSkuKode,
            name: val.name,
            price: val.selectedSellerPrice,
            server_name: "Digiflaz",
          };
          i++;
        }
      });

      return { error: false, data: list, selected: server_id };
    } catch (error) {
      return { error: true };
    }
  }

  /**
   * Fungsi untuk mengambil informasi saat melakukan penambahan produk prabayar baru
   **/
  async get_info_add_produk() {
    try {
      var list_kategori = [];
      await Kategori.findAll({
        where: { type: "prabayar" },
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

  /**
   * Fungsi untuk mengambil informasi edit produk prabayar
   **/
  async get_info_edit_produk_prabayar() {
    const body = this.req.body;
    try {
      var list = {};
      await Produk_prabayar.findOne({
        where: { id: body.id },
        include: {
          required: true,
          model: Operator,
          attributes: ["kategori_id"],
        },
      }).then(async (val) => {
        if (val) {
          list["id"] = val.id;
          list["operator_id"] = val.operator_id;
          list["kategori_id"] = val.Operator.kategori_id;
          list["kode"] = val.kode;
          list["name"] = val.name;
        }
      });

      var list_operator = [];
      var list_kategori = [];
      if (Object.keys(list).length > 0) {
        await Operator.findAll({
          where: { kategori_id: list["kategori_id"] },
        }).then(async (value) => {
          var i = 0;
          await Promise.all(
            await value.map(async (e) => {
              list_operator[i] = { id: e.id, kode: e.kode, name: e.name };
              i++;
            })
          );
        });

        await Kategori.findAll({}).then(async (value) => {
          var i = 0;
          await Promise.all(
            await value.map(async (e) => {
              list_kategori[i] = { id: e.id, kode: e.kode, name: e.name };
              i++;
            })
          );
        });
      }

      return {
        error: false,
        data: { list_operator, list_kategori },
        value: list,
      };
    } catch (error) {
      return { error: true };
    }
  }

  /**
   * Fungsi untuk mengambil informasi markup produk prabayar
   **/
  async get_info_markup_produk_prabayar() {
    const body = this.req.body;
    try {
      var markup = "";
      await Produk_prabayar.findOne({
        where: { id: body.id },
      }).then(async (val) => {
        if (val) {
          markup = val.markup;
        }
      });
      return {
        error: false,
        data: { markup },
      };
    } catch (error) {
      return { error: true };
    }
  }

  /**
   * Fungsi untuk mengambil data produk prabayar
   **/
  async get_produk_prabayar() {
    var list = [];
    var i = 0;
    await Produk_prabayar.findAll().then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          list[i] = {
            id: e.id,
            kode: e.kode,
            name: e.name,
            produk_server: {},
            select_produk_server: {},
          };
          i++;
        })
      );
    });
    return list;
  }

  /**
   * Fungsi untuk mengambil informasi produk prabayar iak
   **/
  async get_produk_iak() {
    var list = [];
    await Iak_prabayar_produk.findAll({
      where: { produk_id: { [Op.ne]: null } },
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          list[e.produk_id] = {
            id: e.id,
            kode: e.kode,
            name: e.name,
            price: e.price,
          };
        })
      );
    });
    return list;
  }

  /**
   * Fungsi untuk mengambil data produk prabayar tripay
   **/
  async get_produk_tripay() {
    var list = [];
    await Tripay_prabayar_produk.findAll({
      where: { produk_id: { [Op.ne]: null } },
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          list[e.produk_id] = {
            id: e.id,
            kode: e.kode,
            name: e.name,
            price: e.price,
          };
        })
      );
    });
    return list;
  }

  /**
   * Fungsi untuk mengambil informasi produk digiflaz
   **/
  async get_produk_digiflaz() {
    var list = [];
    await Digiflazz_product.findAll({
      where: { produk_id: { [Op.ne]: null } },
    }).then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          list[e.produk_id] = {
            id: e.id,
            kode: e.selectedSellerBuyerSkuKode,
            name: e.name,
            price: e.selectedSellerPrice,
          };
        })
      );
    });
    return list;
  }

  /**
   * Fungsi untuk mengambil informasi markup produk prabayar
   **/
  async get_produk_prabayar_markup() {
    var list = [];
    await Produk_prabayar.findAll().then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          list[e.id] = {
            id: e.id,
            purchase_price: e.purchase_price,
            markup: e.markup,
          };
        })
      );
    });
    return list;
  }

  async info_user() {
    const token = this.req.query.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    try {
      var data = {};
      await User.findOne({
        where: { kode: decoded.kode },
      }).then(async (val) => {
        if (val) {
          data["id"] = val.id;
          data["name"] = val.name;
        }
      });
      return { error: false, data: data };
    } catch (error) {
      return { error: true };
    }
  }

  async info_produk_prabayar() {
    const body = this.req.body;

    var where = {};
    if (body.active) {
      where = {
        ...where,
        ...{ status: body.active == "active" ? "active" : "inactive" },
      };
    }

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

    if (body.server != 0 && body.server != undefined) {
      where = { ...where, ...{ server_id: body.server } };
    }

    var where_kategori = {};

    if (body.operator != 0 && body.operator != undefined) {
      where = { ...where, ...{ operator_id: body.operator } };
    } else {
      if (body.kategori != 0 && body.operator != undefined) {
        where_kategori = {
          ...where_kategori,
          ...{ id: body.kategori },
        };
      }
    }

    if (body.koneksi != "semua" && body.koneksi != undefined) {
      if (body.koneksi == "sudah_konek") {
        where = { ...where, ...{ server_id: { [Op.ne]: null } } };
      } else {
        where = { ...where, ...{ server_id: { [Op.eq]: null } } };
      }
    }

    var sql = {};
    sql["order"] = [
      ["urutan", "ASC"],
      ["id", "DESC"],
    ];
    sql["attributes"] = [
      "id",
      "urutan",
      "kode",
      "name",
      "markup",
      "purchase_price",
      "status",
      "updatedAt",
    ];
    sql["where"] = where;
    sql["include"] = [
      {
        required: true,
        model: Operator,
        attributes: ["kode", "name"],
        include: {
          required: true,
          model: Kategori,
          attributes: ["kode", "name"],
          where: where_kategori,
        },
      },
      {
        required: false,
        model: Server,
        attributes: ["kode", "name"],
      },
    ];

    const query = await db_list_server(sql);
    const q = await Produk_prabayar.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    var list_produk_id = [];
    if (total > 0) {
      await Produk_prabayar.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              urutan: e.urutan,
              kode: e.kode,
              name: e.name,
              kategori: e.Operator.Kategori.name,
              kode_operator: e.Operator.kode,
              operator: e.Operator.name,
              harga_server: e.purchase_price,
              markup: e.markup,
              status: e.status,
              server_name:
                e.Server != null ? e.Server.name : "Server Tidak Ditemukan",
              koneksi: {},
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            list_produk_id[i] = e.id;
            i++;
          })
        );
      });

      if (list_produk_id.length > 0) {
        var list_produk_digiflaz = [];
        var i = 0;
        await Digiflazz_product.findAll({
          attributes: [
            "produk_id",
            "id",
            "selectedSellerBuyerSkuKode",
            "name",
            "selectedSellerPrice",
            "status",
          ],
          where: { produk_id: { [Op.in]: list_produk_id } },
        }).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              list_produk_digiflaz[e.produk_id] = {
                name: e.name,
                kode: e.selectedSellerBuyerSkuKode,
                price: e.selectedSellerPrice,
                server: "digiflaz",
                status: e.status,
              };
            })
          );
        });

        var list_produk_iak = [];
        var i = 0;
        await Iak_prabayar_produk.findAll({
          attributes: ["id", "produk_id", "kode", "name", "price", "status"],
          where: { produk_id: { [Op.in]: list_produk_id } },
        }).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              list_produk_iak[e.produk_id] = {
                name: e.name,
                kode: e.kode,
                price: e.price,
                server: "iak",
                status: e.status,
              };
            })
          );
        });

        var list_produk_tripay = [];
        var i = 0;
        await Tripay_prabayar_produk.findAll({
          attributes: ["id", "produk_id", "kode", "name", "price", "status"],
          where: { produk_id: { [Op.in]: list_produk_id } },
        }).then(async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              list_produk_tripay[e.produk_id] = {
                name: e.name,
                kode: e.kode,
                price: e.price,
                server: "tripay",
                status: e.status,
              };
            })
          );
        });

        var list_koneksi = {};

        for (let x in list_produk_id) {
          // digiflaz
          if (list_produk_digiflaz[list_produk_id[x]] != undefined) {
            if (list_koneksi[list_produk_id[x]] != undefined) {
              list_koneksi[list_produk_id[x]].push(
                list_produk_digiflaz[list_produk_id[x]]
              );
            } else {
              list_koneksi[list_produk_id[x]] = [
                list_produk_digiflaz[list_produk_id[x]],
              ];
            }
          }
          // iak
          if (list_produk_iak[list_produk_id[x]] != undefined) {
            if (list_koneksi[list_produk_id[x]] != undefined) {
              list_koneksi[list_produk_id[x]].push(
                list_produk_iak[list_produk_id[x]]
              );
            } else {
              list_koneksi[list_produk_id[x]] = [
                list_produk_iak[list_produk_id[x]],
              ];
            }
          }
          // tripay
          if (list_produk_tripay[list_produk_id[x]] != undefined) {
            if (list_koneksi[list_produk_id[x]] != undefined) {
              list_koneksi[list_produk_id[x]].push(
                list_produk_tripay[list_produk_id[x]]
              );
            } else {
              list_koneksi[list_produk_id[x]] = [
                list_produk_tripay[list_produk_id[x]],
              ];
            }
          }
        }
      }
      // looping
      for (let x in list) {
        if (list_koneksi[list[x].id] != undefined) {
          list[x].koneksi = list_koneksi[list[x].id];
        }
      }
    }

    return list;
  }
}

module.exports = Model_r;
