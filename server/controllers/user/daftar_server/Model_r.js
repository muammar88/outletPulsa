const moment = require("moment");
const {
  Op,
  Server,
  Iak_prabayar_produk,
  Tripay_prabayar_produk,
  Digiflazz_product,
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

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["updatedAt", "DESC"]];
    sql["attributes"] = ["id", "kode", "name", "status", "updatedAt"];
    sql["where"] = where;

    const query = await db_list_server(sql);
    const q = await Server.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    var server_id = [];
    if (total > 0) {
      await Server.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              name: e.name,
              status: e.status,
              total_produk: 0,
              total_produk_terkoneksi: 0,
              total_produk_belum_terkoneksi: 0,
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            server_id[e.id] = i;
            i++;
          })
        );
      });
    }

    if (server_id.length > 0) {
      for (let x in server_id) {
        if (x == 1) {
          let q_total_produk = await Iak_prabayar_produk.findAndCountAll();
          let total_produk = await q_total_produk.count;
          list[server_id[x]].total_produk = total_produk;

          let q_konek = await Iak_prabayar_produk.findAndCountAll({
            where: { produk_id: { [Op.ne]: null } },
          });
          let total_konek = await q_konek.count;
          list[server_id[x]].total_produk_terkoneksi = total_konek;

          let q_belum_konek = await Iak_prabayar_produk.findAndCountAll({
            where: { produk_id: { [Op.eq]: null } },
          });
          let total_belum_konek = await q_belum_konek.count;
          list[server_id[x]].total_produk_belum_terkoneksi = total_belum_konek;

          //total_produk_belum_terkoneksi: 0,
        } else if (x == 2) {
          let q_total_produk = await Tripay_prabayar_produk.findAndCountAll();
          let total_produk = await q_total_produk.count;
          list[server_id[x]].total_produk = total_produk;

          let q_konek = await Tripay_prabayar_produk.findAndCountAll({
            where: { produk_id: { [Op.ne]: null } },
          });
          let total_konek = await q_konek.count;
          list[server_id[x]].total_produk_terkoneksi = total_konek;

          let q_belum_konek = await Tripay_prabayar_produk.findAndCountAll({
            where: { produk_id: { [Op.eq]: null } },
          });
          let total_belum_konek = await q_belum_konek.count;
          list[server_id[x]].total_produk_belum_terkoneksi = total_belum_konek;
        } else if (x == 3) {
          let q_total_produk = await Digiflazz_product.findAndCountAll();
          let total_produk = await q_total_produk.count;
          list[server_id[x]].total_produk = total_produk;

          let q_konek = await Digiflazz_product.findAndCountAll({
            where: { produk_id: { [Op.ne]: null } },
          });
          let total_konek = await q_konek.count;
          list[server_id[x]].total_produk_terkoneksi = total_konek;

          let q_belum_konek = await Digiflazz_product.findAndCountAll({
            where: { produk_id: { [Op.eq]: null } },
          });
          let total_belum_konek = await q_belum_konek.count;
          list[server_id[x]].total_produk_belum_terkoneksi = total_belum_konek;
        }
      }
    }

    return {
      data: list,
      total: total,
    };
  }

  async info_edit() {
    const body = this.req.body;
    var data = {};
    try {
      await Server.findOne({
        where: { id: body.id },
      }).then(async (val) => {
        if (val) {
          data["id"] = val.id;
          data["kode"] = val.kode;
          data["name"] = val.name;
        }
      });
      return { error: false, data: data };
    } catch (error) {
      return { error: true };
    }
  }

  async info_server() {
    const body = this.req.body;
    var data = {};
    try {
      await Server.findOne({
        where: { id: body.id },
      }).then(async (val) => {
        if (val) {
          data["id"] = val.id;
          data["kode"] = val.kode;
          data["name"] = val.name;
          data["status"] = val.status;
        }
      });

      return { error: false, data: data };
    } catch (error) {
      return { error: true };
    }
  }
}

module.exports = Model_r;
