const { sequelize, Op, Member, Agen } = require("../../models");
// const { writeLog } = require("../../helpers/writeLogHelper");

class Models {
  constructor(req) {
    this.req = req;
    this.message = "";
    this.state = true;
  }

  async initialize() {
    this.t = await sequelize.transaction();
  }

  async m_list() {
    try {
      const body = this.req.body;
      const limit = parseInt(body.perpage, 10) || 10;
      const page =
        body.pageNumber && body.pageNumber !== "0"
          ? parseInt(body.pageNumber, 10)
          : 1;

      const where = body.search
        ? {
            [Op.or]: [
              { kode: { [Op.like]: `%${body.search}%` } },
              { fullname: { [Op.like]: `%${body.search}%` } },
              { whatsapp_number: { [Op.like]: `%${body.search}%` } },
            ],
          }
        : {};

      const { rows, count } = await Member.findAndCountAll({
        limit,
        offset: (page - 1) * limit,
        order: [["id", "ASC"]],
        attributes: [
          "id",
          "kode",
          "fullname",
          "whatsapp_number",
          "saldo",
          "status",
        ],
        where,
        include: {
          required: false,
          model: Agen,
          attributes: ["kode"],
        },
      });

      var data = [];
      await Promise.all(
        await rows.map(async (e) => {
          data.push({
            id: e.id,
            kode: e.kode,
            fullname: e.fullname,
            whatsapp_number: e.whatsapp_number,
            saldo: e.saldo,
            status: e.status,
            agen: e.Agen?.kode ? "-" : e.Agen?.kode,
          });
        })
      );

      // result.rows.map((e) => ({
      //   id: e.id,
      //   kode: e.kode,
      //   fullname: e.fullname,
      //   whatsapp_number: e.whatsapp_number,
      //   saldo: e.saldo,
      //   status: e.status,
      //   agen: e.Agen?.kode ? "-" : e.Agen?.kode,
      // }));

      return {
        data: data,
        total: count,
      };
    } catch (error) {
      console.log("DDDDD");
      console.log(error);
      console.log("DDDDD");
      return {};
    }
  }

  async info_member(id) {
    try {
      var q = await Member.findOne({
        where: {
          id: id,
        },
      });
      return {
        id: q.id,
        fullname: q.fullname,
        whatsapp_number: q.whatsapp_number,
      };
    } catch (error) {
      return {};
    }
  }

  async m_delete() {
    await this.initialize();
    const body = this.req.body;

    try {
      const info = await this.info_member(body.id);

      await Member.destroy({
        where: { id: body.id },
        transaction: this.t,
      });

      this.message = `Menghapus data Member dengan ID Member : ${info.id}, Nama Member: ${info.fullname} dan Nomor Whatsapp: ${info.whatsapp_number}`;
    } catch (error) {
      this.state = false;
    }
  }

  async response() {
    if (this.state) {
      // await writeLog(this.req, this.t, {
      //   msg: this.message,
      // });
      await this.t.commit();
      return true;
    } else {
      await this.t.rollback();
      return false;
    }
  }
}

module.exports = Models;
