const moment = require("moment");
const { Op, Company, Airlines } = require("../../../db/models");
const { getCompanyIdByCode } = require("../../../helpers/user/index");
const { db_list_server } = require("../../../helpers/db_ops");

class Data_serverside {
  constructor(req) {
    this.req = req;
  }
}
