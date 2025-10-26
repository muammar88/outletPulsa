const moment = require("moment");
const { Op, Bank } = require("../../../db/models");
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
        [Op.or]: [
          { kode: { [Op.like]: "%" + body.search + "%" } },
          { NavigationPreloadManager: { [Op.like]: "%" + body.search + "%" } },
        ],
      };
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["updatedAt", "DESC"]];
    sql["attributes"] = ["id", "kode", "name", "image", "updatedAt"];
    sql["where"] = where;

    const query = await db_list_server(sql);
    const q = await Bank.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    if (total > 0) {
      await Bank.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              name: e.name,
              image: e.image,
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

  async m_info_bank() {
    const body = this.req.body;
    try {
      return { error: false, data: await info_bank(body.id) };
    } catch (error) {
      return { error: true };
    }
  }

  async info_edit() {
    const body = this.req.body;
    try {
      return { error: false, value: await info_bank(body.id) };
    } catch (error) {
      return { error: true };
    }
  }
}

module.exports = Model_r;
