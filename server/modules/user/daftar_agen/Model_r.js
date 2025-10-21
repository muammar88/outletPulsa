const moment = require("moment");
const { Op, Member, Agen } = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");
const { info } = require("../../../helpers/user/daftar_agen/index");

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
        kode: { [Op.like]: "%" + body.search + "%" },
      };
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["updatedAt", "DESC"]];
    sql["attributes"] = [
      "id",
      "kode",
      "tipe_agen",
      "member_id",
      "fee",
      "updatedAt",
    ];
    sql["where"] = where;

    const query = await db_list_server(sql);
    const q = await Agen.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    var memberId = [];
    const countConsumen = await this.count_consumen();
    if (total > 0) {
      await Agen.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode: e.kode,
              name: "",
              tipe_agen: e.tipe_agen,
              whatsapp_number: "",
              jumlah_konsumen:
                countConsumen[e.id] == undefined ? 0 : countConsumen[e.id],
              fee_agen: e.fee,
              member_id: e.member_id,
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            memberId[i] = e.member_id;
            i++;
          })
        );
      });
    }

    if (memberId.length > 0) {
      var list_member = {};
      await Member.findAll({ where: { id: { [Op.in]: memberId } } }).then(
        async (value) => {
          await Promise.all(
            await value.map(async (e) => {
              list_member[e.id] = {
                fullname: e.fullname,
                whatsapp_number: e.whatsapp_number,
              };
            })
          );
        }
      );

      for (let x in list) {
        if (list_member[list[x].member_id] != undefined) {
          list[x].name = list_member[list[x].member_id].fullname;
          list[x].whatsapp_number =
            list_member[list[x].member_id].whatsapp_number;
          delete list[x].member_id;
        }
      }
    }

    return {
      data: list,
      total: total,
    };
  }

  // hitung jumlah konsumen masing-masing agen
  async count_consumen() {
    var list = [];
    await Member.findAll().then(async (value) => {
      await Promise.all(
        await value.map(async (e) => {
          if (e.agen_id != null) {
            if (list.includes(e.agen_id)) {
              list[e.agen_id] = list[e.agen_id] + 1;
            } else {
              list[e.agen_id] = 1;
            }
          }
        })
      );
    });
    return list;
  }

  async info_add_kostumer_agen() {
    const body = this.req.body;
    // get info agen
    const infos = await info(body.id);
    //process
    try {
      var data = [];
      await Member.findAll({
        attributes: ["id", "fullname", "whatsapp_number"],
        where: { agen_id: { [Op.is]: null }, id: { [Op.ne]: infos.member_id } },
      }).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            data[i] = {
              id: e.id,
              name: e.fullname,
              whatsapp_number: e.whatsapp_number,
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

  async info_pembayaran_fee_agen() {
    const body = this.req.body;
    // get info agen
    const infos = await info(body.id);
    // filter
    if (infos.fee == 0) {
      return { error: true };
    } else {
      return { error: false, data: infos.fee };
    }
  }
}

module.exports = Model_r;
