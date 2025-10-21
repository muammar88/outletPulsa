"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Agens", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kode: {
        type: Sequelize.STRING,
      },
      member_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Members",
          key: "id",
        },
      },
      fee: {
        type: Sequelize.INTEGER,
      },
      tipe_agen: {
        type: Sequelize.ENUM,
        values: ["silver", "gold", "platinum"],
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Agens");
  },
};
