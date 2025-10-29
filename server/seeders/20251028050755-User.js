"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require("bcrypt");

    const users = [
      {
        kode: "ADM001",
        fullname: "Administrator",
        username: "admin",
        password: bcrypt.hashSync("admin", 10),
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        kode: "OPR001",
        fullname: "Operator Outlet",
        username: "operator",
        password: bcrypt.hashSync("Operator@123", 10),
        refreshToken: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Users", users, {});
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete(
      "Users",
      { username: { [Op.in]: ["admin", "operator"] } },
      {}
    );
  },
};
