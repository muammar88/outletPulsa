"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Otps", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      member_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Members",
          key: "id",
        },
      },
      nomor_tujuan: {
        type: Sequelize.STRING,
      },
      otp: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.ENUM,
        values: ["register", "login", "edit_data_member"],
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
    await queryInterface.dropTable("Otps");
  },
};
