const moment = require("moment");
const {
  Op,
  Validasi_seller_digiflaz,
  Digiflazz_seller,
} = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");
const { info_bank } = require("../../../helpers/user/daftar_bank/index");

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
        [Op.or]: [{ kode: { [Op.like]: "%" + body.search + "%" } }],
      };
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["updatedAt", "DESC"]];
    sql["attributes"] = ["id", "createdAt", "updatedAt"];
    sql["include"] = {
      required: true,
      model: Digiflazz_seller,
      attributes: ["name", "status"],
    };
    const query = await db_list_server(sql);
    const q = await Validasi_seller_digiflaz.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    if (total > 0) {
      await Validasi_seller_digiflaz.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            var diff = moment().diff(e.createdAt, "days");
            var waktu_validasi = moment(e.createdAt).format(
              "YYYY-MM-DD HH:mm:ss"
            );

            console.log("+++++++++++++++diff");
            console.log(diff);
            console.log("+++++++++++++++diff");

            if (diff == 0) {
              waktu_validasi = "Hari ini";
            } else if (diff == 1) {
              waktu_validasi = "Kemarin";
            }

            list[i] = {
              id: e.id,
              seller_name: e.Digiflazz_seller.name,
              status_seller: e.Digiflazz_seller.status,
              waktu_validasi: waktu_validasi,
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
}

module.exports = Model_r;
