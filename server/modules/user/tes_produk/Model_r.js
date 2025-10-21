const moment = require("moment");
const {
  Op,
  Digiflazz_seller,
  Digiflazz_seller_product,
  Digiflazz_product,
  Testing_digiflaz,
  Validasi_seller_digiflaz,
} = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");
const { info } = require("../../../helpers/user/tripay_prabayar/index");

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

    // var where = {
    //   status: body.active == "active" ? "tersedia" : "tidak tersedia",
    // };
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

    // if (body.operator != 0) {
    //   where = { ...where, ...{ operator_id: body.operator } };
    // }

    // if (body.koneksi != "semua") {
    //   if (body.koneksi == "sudah_konek") {
    //     where = { ...where, ...{ produk_id: { [Op.ne]: null } } };
    //   } else {
    //     where = { ...where, ...{ produk_id: null } };
    //   }
    // }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["id", "DESC"]];
    sql["attributes"] = [
      "id",
      "kode",
      "produk_name",
      "buyer_sku_kode",
      "nomor_tujuan",
      "harga",
      "status",
      "waktu_kirim",
      "saldo_before",
      "saldo_after",
      "seller_id",
      "createdAt",
      "updatedAt",
    ];
    // sql["where"] = where;
    sql["include"] = [
      {
        required: true,
        model: Digiflazz_seller,
        attributes: ["name", "status"],
      },
    ];

    const query = await db_list_server(sql);
    const q = await Testing_digiflaz.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    var list_time_seller_id = [];
    var seller_id_to_num = [];
    var seller_id = [];
    if (total > 0) {
      await Testing_digiflaz.findAll(query.sql).then(async (value) => {
        var i = 0;
        var j = 0;

        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              produk_name: e.produk_name,
              buyer_sku_kode: e.buyer_sku_kode,
              nomor_tujuan: e.nomor_tujuan,
              harga: e.harga,
              status: e.status,
              status_seller: e.Digiflazz_seller.status,
              nama_seller: e.Digiflazz_seller.name,
              saldo_before: e.saldo_before,
              saldo_after: e.saldo_after,
              validasi: false,
              waktu_kirim: moment(e.waktu_kirim).format("YYYY-MM-DD HH:mm:ss"),
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            if (!seller_id.includes(e.seller_id)) {
              seller_id[j] = e.seller_id;
              j++;
            }
            seller_id_to_num[e.seller_id] = i;
            var timeString = moment(e.createdAt).format("YYYYMMDD");
            var kode = e.seller_id + timeString;

            if (list_time_seller_id[e.seller_id] != undefined) {
              if (!list_time_seller_id.includes(kode)) {
                list_time_seller_id.push(kode);
              }
            } else {
              list_time_seller_id.push(kode);
            }
            i++;
          })
        );
      });
    }

    if (list.length > 0) {
      await Validasi_seller_digiflaz.findAll({
        where: { seller_id: { [Op.in]: seller_id } },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (er) => {
            var timeString = moment(er.createdAt).format("YYYYMMDD");
            var kode = er.seller_id + timeString;
            if (list_time_seller_id.includes(kode)) {
              list[seller_id_to_num[er.seller_id]].validasi = true;
            }
          })
        );
      });
    }

    return {
      data: list,
      total: total,
    };
  }

  async info_list_tes() {}

  async info_tes() {
    try {
      var num = {};
      await Digiflazz_seller_product.findAll({
        include: {
          required: true,
          model: Digiflazz_seller,
          where: { status: "unbanned" },
        },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            var seller_id = e.seller_id;
            if (num[seller_id] != undefined) {
              num[seller_id] = num[seller_id] + 1;
            } else {
              num[seller_id] = 1;
            }
          })
        );
      });

      var list_seller = [];
      await Digiflazz_seller.findAll({ where: { status: "unbanned" } }).then(
        async (value) => {
          var i = 0;
          await Promise.all(
            await value.map(async (e) => {
              list_seller[i] = {
                id: e.id,
                name:
                  e.name +
                  " (" +
                  (num[e.id] == undefined ? 0 : num[e.id]) +
                  " Produk)",
              };
              i++;
            })
          );
        }
      );
      return { error: false, data: list_seller };
    } catch (error) {
      return { error: true };
    }
  }

  async get_produk_seller() {
    const body = this.req.body;
    try {
      var list_produk = [];
      await Digiflazz_seller_product.findAll({
        where: { seller_id: body.seller_id },
        include: [
          {
            required: true,
            model: Digiflazz_product,
            attributes: ["name"],
          },
        ],
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list_produk[i] = {
              id: e.id,
              price: e.price,
              name: e.Digiflazz_product.name,
            };
            i++;
          })
        );
      });
      return { error: false, data: list_produk };
    } catch (error) {
      return { error: true };
    }
  }

  // async info_saldo_digiflaz() {

  // }
  // async get_operator_tripay() {
  //   var list = [];
  //   await Tripay_prabayar_operator.findAll().then(async (value) => {
  //     var i = 0;
  //     await Promise.all(
  //       await value.map(async (e) => {
  //         list[i] = {
  //           id: e.id,
  //           kode: e.kode,
  //           name: e.name,
  //         };
  //         i++;
  //       })
  //     );
  //   });
  //   return { error: false, data: list };
  // }

  // async info_sinkronisasi_produk_tripay() {
  //   try {
  //     var list_produk_id = [];
  //     await Tripay_prabayar_produk.findAll({
  //       where: { produk_id: { [Op.ne]: null } },
  //     }).then(async (value) => {
  //       var i = 0;
  //       await Promise.all(
  //         await value.map(async (e) => {
  //           list_produk_id[i] = e.produk_id;
  //           i++;
  //         })
  //       );
  //     });

  //     var where = {};
  //     if (list_produk_id.length > 0) {
  //       where = { id: { [Op.notIn]: list_produk_id } };
  //     }

  //     var list = [];
  //     await Produk_prabayar.findAll({
  //       where: where,
  //       include: {
  //         required: true,
  //         model: Operator,
  //         attributes: ["name"],
  //       },
  //     }).then(async (value) => {
  //       var i = 0;
  //       await Promise.all(
  //         await value.map(async (e) => {
  //           list[i] = {
  //             id: e.id,
  //             kode: e.kode,
  //             name: e.name,
  //             operator: e.Operator.name,
  //           };
  //           i++;
  //         })
  //       );
  //     });

  //     return { error: false, data: list };
  //   } catch (error) {
  //     return { error: true };
  //   }
  // }

  // async update_produk_prabayar_tripay() {
  //   const tripay = new Tripay();
  //   const myDate = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
  //   try {
  //     await tripay.get_produk(async (json) => {
  //       if (json.success == true) {
  //         var operator_id = [];
  //         await Tripay_prabayar_operator.findAll({
  //           attributes: ["id"],
  //         }).then(async (value) => {
  //           var i = 0;
  //           await Promise.all(
  //             value.map(async (e) => {
  //               operator_id[i] = e.id;
  //               i++;
  //             })
  //           );
  //         });
  //         var data = json.data;
  //         await Tripay_prabayar_produk.update(
  //           {
  //             status: "tidak tersedia",
  //             updatedAt: myDate,
  //           },
  //           { where: {} }
  //         );
  //         await data.map(async (e) => {
  //           const q_total = await Tripay_prabayar_produk.findAndCountAll({
  //             where: { kode: e.code },
  //           });
  //           const total = await q_total.count;
  //           if (total > 0) {
  //             await Tripay_prabayar_produk.update(
  //               {
  //                 price: e.price,
  //                 status: e.status == 1 ? "tersedia" : "tidak tersedia",
  //                 updatedAt: myDate,
  //               },
  //               { where: { kode: e.code } }
  //             );
  //           } else {
  //             if (operator_id.includes(e.pembelianoperator_id)) {
  //               await Tripay_prabayar_produk.create({
  //                 operator_id: e.pembelianoperator_id,
  //                 kode: e.code,
  //                 name: e.product_name,
  //                 price: e.price,
  //                 deskripsi: e.desc,
  //                 status: e.status == 1 ? "tersedia" : "tidak tersedia",
  //                 createdAt: myDate,
  //                 updatedAt: myDate,
  //               });
  //             }
  //           }
  //         });
  //       }
  //     });
  //     return { error: false };
  //   } catch (error) {
  //     return { error: true };
  //   }
  // }
}

module.exports = Model_r;
