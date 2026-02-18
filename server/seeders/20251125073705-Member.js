"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const bcrypt = require("bcrypt");

    const users = [
      {
        kode: "ABCD12",
        fullname: "Administrator",
        whatsapp_number: "085262802141",
        password: bcrypt.hashSync("admin", 10),
        saldo: 0,
        biaya_admin: 0,
        status: "verified",
        agen_id: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("Members", users, {});
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete("Members", {}, {});
  },
};
