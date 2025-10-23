"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Riwayat_fee_agens", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      agen_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Agens",
          key: "id",
        },
      },
      kode: {
        type: Sequelize.STRING,
      },
      debet: {
        type: Sequelize.INTEGER,
      },
      kredit: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["fee_agen", "withdraw_fee_agen", "widthdraw_fee_to_saldo"],
      },
      fee_agen_sebelum: {
        type: Sequelize.INTEGER,
      },
      fee_agen_sesudah: {
        type: Sequelize.INTEGER,
      },
      ket: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("Riwayat_fee_agens");
  },
};
