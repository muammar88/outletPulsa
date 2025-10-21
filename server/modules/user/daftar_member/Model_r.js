const moment = require("moment");
const { Op, Member, Agen } = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  // get data from server side
  async server_side() {
    const body = this.req.body;
    var limit = body.perpage;
    var page = 1;

    if (body.pageNumber != undefined) page = body.pageNumber;

    var where = {};
    if (body.search != undefined && body.search != "") {
      where = {
        [Op.or]: [
          {
            fullname: { [Op.like]: "%" + body.search + "%" },
          },
          {
            kode: { [Op.like]: "%" + body.search + "%" },
          },
        ],
      };
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["updatedAt", "DESC"]];
    sql["attributes"] = [
      "id",
      "kode",
      "fullname",
      "whatsapp_number",
      "saldo",
      "status",
      "type",
      "updatedAt",
    ];
    sql["where"] = where;

    const query = await db_list_server(sql);
    const q = await Member.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    var memberId = [];
    if (total > 0) {
      await Member.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              name: e.fullname,
              whatsapp_number: e.whatsapp_number,
              saldo: e.saldo,
              status: e.status,
              type: e.type,
              agen_status: "notagen",
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            memberId[i] = e.id;
            i++;
          })
        );
      });
    }

    if (memberId.length > 0) {
      var listAgen = [];
      await Agen.findAll({
        where: { member_id: { [Op.in]: memberId } },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            listAgen[i] = e.member_id;
            i++;
          })
        );
      });

      for (let x in list) {
        if (listAgen.includes(list[x].id)) {
          list[x].agen_status = "agen";
        }
      }
    }
    return {
      data: list,
      total: total,
    };
  }

  // get info for edit member
  async info_edit() {
    const body = this.req.body;
    var data = {};
    try {
      await Member.findOne({
        where: { id: body.id },
      }).then(async (val) => {
        if (val) {
          data["id"] = val.id;
          data["kode"] = val.kode;
          data["fullname"] = val.fullname;
          data["whatsapp_number"] = val.whatsapp_number;
        }
      });
      return { error: false, data: data };
    } catch (error) {
      return { error: true };
    }
  }

  async info_member(id) {
    var list = [];
    await Member.findAll({
      where: { id: { [Op.ne]: id } },
    }).then(async (value) => {
      var i = 0;
      await Promise.all(
        await value.map(async (e) => {
          list[i] = {
            id: e.id,
            name: e.fullname,
            whatsapp_number: e.whatsapp_number,
          };
          i++;
        })
      );
    });
    return list;
  }
}

module.exports = Model_r;
