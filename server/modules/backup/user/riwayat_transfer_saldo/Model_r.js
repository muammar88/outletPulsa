const moment = require("moment");
const {
  Op,
  Member,
  Transaction,
  Transfer_saldo,
  Terima_saldo,
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
        [Op.and]: [
          { kode: { [Op.like]: "%" + body.search + "%" } },
          { tipe: { [Op.in]: ["transfer_saldo", "terima_saldo"] } },
        ],
      };
    } else {
      where = {
        tipe: { [Op.in]: ["transfer_saldo", "terima_saldo"] },
      };
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["updatedAt", "DESC"]];
    sql["attributes"] = [
      "id",
      "kode",
      "saldo_before",
      "saldo_after",
      "tipe",
      "ket",
      "updatedAt",
    ];
    sql["where"] = where;

    sql["include"] = [
      {
        required: true,
        model: Member,
        attributes: ["kode", "fullname", "whatsapp_number"],
      },
    ];

    const query = await db_list_server(sql);
    const q = await Transaction.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    var list_transaction_id_transfer = {};
    var list_transaction_id_terima = {};
    if (total > 0) {
      await Transaction.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            list[i] = {
              id: e.id,
              kode_member: e.Member.kode,
              member_name: e.Member.fullname,
              whatsapp: e.Member.whatsapp_number,
              kode: e.kode,
              saldo_before: e.saldo_before,
              saldo_after: e.saldo_after,
              tipe: e.tipe,
              nominal: 0,
              invoice: "",
              nama_target: "",
              whatsapp_target: "",
              ket: e.ket,
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };
            if (e.tipe == "transfer_saldo") {
              list_transaction_id_transfer[i] = e.id;
            } else if (e.tipe == "terima_saldo") {
              list_transaction_id_terima[i] = e.id;
            }
            i++;
          })
        );
      });
    }

    if (Object.keys(list_transaction_id_transfer).length > 0) {
      let propertyValues = Object.values(list_transaction_id_transfer);
      var list_transfer_saldo = [];
      await Transfer_saldo.findAll({
        where: { transaction_id: { [Op.in]: propertyValues } },
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            list_transfer_saldo[e.transaction_id] = {
              biaya: e.biaya,
              invoice_terima: e.invoice_terima,
              nama_penerima: e.nama_penerima,
              whatsapp_penerima: e.whatsapp_penerima,
            };
          })
        );
      });

      if (Object.keys(list_transfer_saldo).length > 0) {
        for (let x in list_transaction_id_transfer) {
          list[x]["nominal"] =
            list_transfer_saldo[list_transaction_id_transfer[x]].biaya;
          list[x]["invoice"] =
            list_transfer_saldo[list_transaction_id_transfer[x]].invoice_terima;
          list[x]["nama_target"] =
            list_transfer_saldo[list_transaction_id_transfer[x]].nama_penerima;
          list[x]["whatsapp_target"] =
            list_transfer_saldo[
              list_transaction_id_transfer[x]
            ].whatsapp_penerima;
        }
      }
    }

    if (Object.keys(list_transaction_id_terima).length > 0) {
      let propertyValue = Object.values(list_transaction_id_terima);
      var list_terima_saldo = [];
      await Terima_saldo.findAll({
        where: { transaction_id: { [Op.in]: propertyValue } },
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            list_terima_saldo[e.transaction_id] = {
              biaya: e.biaya,
              invoice_transfer: e.invoice_transfer,
              nama_pengirim: e.nama_pengirim,
              whatsapp_pengirim: e.whatsapp_pengirim,
            };
          })
        );
      });

      if (Object.keys(list_terima_saldo).length > 0) {
        for (let x in list_transaction_id_terima) {
          list[x]["nominal"] =
            list_terima_saldo[list_transaction_id_terima[x]].biaya;
          list[x]["invoice"] =
            list_terima_saldo[list_transaction_id_terima[x]].invoice_transfer;
          list[x]["nama_target"] =
            list_terima_saldo[list_transaction_id_terima[x]].nama_pengirim;
          list[x]["whatsapp_target"] =
            list_terima_saldo[list_transaction_id_terima[x]].whatsapp_pengirim;
        }
      }
    }

    return {
      data: list,
      total: total,
    };
  }
}

module.exports = Model_r;
