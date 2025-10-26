const moment = require("moment");
const {
  Op,
  Transaction_deposit,
  Transaction,
  Member,
  Request_deposit,
  Bank_transfer,
  Bank,
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
    var where_member = {};

    if (body.search != undefined && body.search != "") {
      where = {
        kode: { [Op.like]: "%" + body.search + "%" },
      };
    }

    var sql = {};
    sql["limit"] = limit * 1;
    sql["offset"] = (page - 1) * limit;
    sql["order"] = [["updatedAt", "DESC"]];
    sql["attributes"] = ["id", "nominal", "updatedAt"];
    sql["include"] = [
      {
        required: true,
        model: Transaction,
        attributes: ["id", "kode", "saldo_before", "saldo_after"],
        where: where,
        include: [
          {
            required: true,
            model: Member,
            attributes: ["fullname", "whatsapp_number"],
            where: where_member,
          },
          {
            required: false,
            model: Request_deposit,
            attributes: [
              "kode",
              "nominal",
              "nominal_tambahan",
              "biaya_admin",
              "action_do",
            ],
            include: {
              required: false,
              model: Bank_transfer,
              attributes: ["account_name", "account_number"],
              include: {
                required: false,
                model: Bank,
                attributes: ["name", "kode"],
              },
            },
          },
        ],
      },
    ];

    const query = await db_list_server(sql);
    const q = await Transaction_deposit.findAndCountAll(query.total);
    const total = await q.count;
    var list = [];
    if (total > 0) {
      await Transaction_deposit.findAll(query.sql).then(async (value) => {
        var i = 0;
        await Promise.all(
          await value.map(async (e) => {
            var row = {
              id: e.Transaction.id,
              kode: e.Transaction.kode,
              nominal: e.nominal,
              saldo_before: e.Transaction.saldo_before,
              saldo_after: e.Transaction.saldo_after,
              nama_member: e.Transaction.Member.fullname,
              nomor_whatsapp: e.Transaction.Member.whatsapp_number,
              updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
            };

            if (e.Transaction.Request_deposits[0]) {
              const requestDeposit = e.Transaction.Request_deposits[0];
              row.kode_request = requestDeposit.kode;
              row.nominal_request = requestDeposit.nominal;
              row.nominal_tambahan = requestDeposit.nominal_tambahan;
              if (requestDeposit.Bank_transfer) {
                row.nomor_akun_bank =
                  requestDeposit.Bank_transfer.account_number;
                row.nama_akun_bank = requestDeposit.Bank_transfer.account_name;
                if (requestDeposit.Bank_transfer.Bank) {
                  row.nama_bank = requestDeposit.Bank_transfer.Bank.name;
                  row.kode_bank = requestDeposit.Bank_transfer.Bank.kode;
                }
              }
            }
            list[i] = row;
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
