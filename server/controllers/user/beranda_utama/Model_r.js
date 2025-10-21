const moment = require("moment");
const { Op, Transaction, Member } = require("../../../db/models");
const { db_list_server } = require("../../../helpers/db_ops");
// const { info } = require("../../../helpers/user/bank_transfer/index");

class Model_r {
  constructor(req) {
    this.req = req;
  }

  async get_transaksi_hari_ini() {
    const TODAY_START = new Date().setHours(0, 0, 0, 0);
    const NOW = new Date();
    try {
      var i = 0;
      await Transaction.findAll({
        where: {
          tipe: { [Op.in]: ["beli_produk_prabayar", "beli_produk_pascabayar"] },
          createdAt: {
            [Op.gte]: TODAY_START,
            [Op.lte]: NOW,
          },
        },
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            i++;
          })
        );
      });

      return { error: false, data: i };
    } catch (error) {
      return { error: true };
    }
  }

  async get_member_baru_hari_ini() {
    const TODAY_START = new Date().setHours(0, 0, 0, 0);
    const NOW = new Date();
    try {
      var i = 0;
      await Member.findAll({
        where: {
          createdAt: {
            [Op.gte]: TODAY_START,
            [Op.lte]: NOW,
          },
        },
      }).then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            i++;
          })
        );
      });

      return { error: false, data: i };
    } catch (error) {
      return { error: true };
    }
  }

  // total_member
  async total_member() {
    try {
      var i = 0;
      var total_saldo = 0;
      await Member.findAll().then(async (value) => {
        await Promise.all(
          await value.map(async (e) => {
            total_saldo = total_saldo + e.saldo;
            i++;
          })
        );
      });

      return { error: false, data: { total: i, total_saldo: total_saldo } };
    } catch (error) {
      return { error: true };
    }
  }

  // // get data in server side
  // async server_side() {
  //   const body = this.req.body;
  //   var limit = body.perpage;
  //   var page = 1;

  //   if (body.pageNumber != undefined) page = body.pageNumber;

  //   var where = {};
  //   if (body.search != undefined && body.search != "") {
  //     where = {
  //       account_name: { [Op.like]: "%" + body.search + "%" },
  //     };
  //   }

  //   var sql = {};
  //   sql["limit"] = limit * 1;
  //   sql["offset"] = (page - 1) * limit;
  //   sql["order"] = [["updatedAt", "DESC"]];
  //   sql["attributes"] = [
  //     "id",
  //     "account_name",
  //     "account_number",
  //     "biaya_admin",
  //     "updatedAt",
  //   ];
  //   sql["where"] = where;
  //   sql["include"] = [
  //     {
  //       require: true,
  //       model: Bank,
  //       attributes: ["kode", "name"],
  //     },
  //   ];

  //   const query = await db_list_server(sql);
  //   const q = await Bank_transfer.findAndCountAll(query.total);
  //   const total = await q.count;
  //   var list = [];
  //   if (total > 0) {
  //     await Bank_transfer.findAll(query.sql).then(async (value) => {
  //       var i = 0;
  //       await Promise.all(
  //         await value.map(async (e) => {
  //           list[i] = {
  //             id: e.id,
  //             account_name: e.account_name,
  //             account_number: e.account_number,
  //             biaya_admin: e.biaya_admin,
  //             kode_bank: e.Bank.kode,
  //             nama_bank: e.Bank.name,
  //             updatedAt: moment(e.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
  //           };
  //           i++;
  //         })
  //       );
  //     });
  //   }

  //   return {
  //     data: list,
  //     total: total,
  //   };
  // }

  // if (memberId.length > 0) {
  //   var list_member = {};
  //   await Member.findAll({ where: { id: { [Op.in]: memberId } } }).then(
  //     async (value) => {
  //       await Promise.all(
  //         await value.map(async (e) => {
  //           list_member[e.id] = {
  //             fullname: e.fullname,
  //             whatsapp_number: e.whatsapp_number,
  //           };
  //         })
  //       );
  //     }
  //   );

  //   for (let x in list) {
  //     if (list_member[list[x].member_id] != undefined) {
  //       list[x].name = list_member[list[x].member_id].fullname;
  //       list[x].whatsapp_number =
  //         list_member[list[x].member_id].whatsapp_number;
  //       delete list[x].member_id;
  //     }
  //   }
  // }

  // // hitung jumlah konsumen masing-masing agen
  // async count_consumen() {
  //   var list = [];
  //   await Member.findAll().then(async (value) => {
  //     await Promise.all(
  //       await value.map(async (e) => {
  //         if (e.agen_id != null) {
  //           if (list.includes(e.agen_id)) {
  //             list[e.agen_id] = list[e.agen_id] + 1;
  //           } else {
  //             list[e.agen_id] = 1;
  //           }
  //         }
  //       })
  //     );
  //   });
  //   return list;
  // }

  // async info_edit() {
  //   const body = this.req.body;

  //   try {
  //     var bank = [];
  //     await Bank.findAll().then(async (value) => {
  //       var i = 0;
  //       await Promise.all(
  //         await value.map(async (e) => {
  //           bank[i] = {
  //             id: e.id,
  //             kode: e.kode,
  //             name: "(" + e.kode + ") " + e.name,
  //           };
  //           i++;
  //         })
  //       );
  //     });

  //     var value = {};
  //     await Bank_transfer.findOne({
  //       where: { id: body.id },
  //     }).then(async (val) => {
  //       if (val) {
  //         value["id"] = val.id;
  //         value["bank_id"] = val.bank_id;
  //         value["account_name"] = val.account_name;
  //         value["account_number"] = val.account_number;
  //         value["biaya_admin"] = val.biaya_admin;
  //       }
  //     });
  //     return { error: false, value, data: { bank } };
  //   } catch (error) {
  //     return { error: true };
  //   }
  // }

  // async info_add() {
  //   try {
  //     var bank = [];
  //     await Bank.findAll().then(async (value) => {
  //       var i = 0;
  //       await Promise.all(
  //         await value.map(async (e) => {
  //           bank[i] = {
  //             id: e.id,
  //             kode: e.kode,
  //             name: "(" + e.kode + ") " + e.name,
  //           };
  //           i++;
  //         })
  //       );
  //     });
  //     return { error: false, data: { bank } };
  //   } catch (error) {
  //     return { error: true };
  //   }

  //   // const body = this.req.body;
  //   // // get info agen
  //   // const infos = await info(body.id);
  //   // // filter
  //   // if (infos.fee == 0) {
  //   //   return { error: true };
  //   // } else {
  //   //   return { error: false, data: infos.fee };
  //   // }
  // }
}

module.exports = Model_r;
