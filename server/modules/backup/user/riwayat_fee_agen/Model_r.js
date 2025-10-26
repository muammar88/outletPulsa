const moment = require("moment");
const { Op, Member, Agen, Riwayat_fee_agen } = require("../../../db/models");
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
      "agen_id",
      "kode",
      "debet",
      "kredit",
      "status",
      "fee_agen_sebelum",
      "fee_agen_sesudah",
      "ket",
      "updatedAt",
    ];
    sql["where"] = where;

    sql["include"] = [
      {
        required: true,
        model: Agen,
        attributes: ["kode"],
        include: {
          required: true,
          model: Member,
          attributes: ["fullname", "whatsapp_number"],
        },
      },
    ];

    const query = await db_list_server(sql);
    const q = await Riwayat_fee_agen.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    if (total > 0) {
      await Riwayat_fee_agen.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              member_name: e.Agen.Member.fullname,
              whatsapp_number: e.Agen.Member.whatsapp_number,
              kode_agen: e.Agen.kode,
              kode: e.kode,
              debet: e.debet,
              kredit: e.kredit,
              status: e.status,
              fee_agen_sebelum: e.fee_agen_sebelum,
              fee_agen_sesudah: e.fee_agen_sesudah,
              ket: e.ket,
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
}

module.exports = Model_r;
