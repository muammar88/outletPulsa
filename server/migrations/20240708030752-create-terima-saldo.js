"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Terima_saldos", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Transactions",
          key: "id",
        },
      },
      biaya: {
        type: Sequelize.INTEGER,
      },
      invoice_transfer: {
        type: Sequelize.STRING,
      },
      nama_pengirim: {
        type: Sequelize.STRING,
      },
      whatsapp_pengirim: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("Terima_saldos");
  },
};
