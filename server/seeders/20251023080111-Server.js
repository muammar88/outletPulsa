"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert(
      "servers",
      [
        {
          kode: "IAK",
          name: "IAK",
          status: "active",
          createdAt: new Date("2023-07-28T20:35:46.000Z"),
          updatedAt: new Date("2024-01-08T13:33:20.000Z"),
        },
        {
          kode: "TRI",
          name: "Tripay",
          status: "active",
          createdAt: new Date("2023-07-28T20:35:46.000Z"),
          updatedAt: new Date("2024-01-08T13:33:20.000Z"),
        },
        {
          kode: "DIGI",
          name: "Digiflazz",
          status: "active",
          createdAt: new Date("2023-11-19T00:00:00.000Z"),
          updatedAt: new Date("2024-01-08T13:33:20.000Z"),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "servers",
      {
        kode: { [Sequelize.Op.in]: ["IAK", "TRI", "DIGI"] },
      },
      {}
    );
  },
};
