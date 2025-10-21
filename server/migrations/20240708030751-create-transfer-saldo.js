"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transfer_saldos", {
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
      invoice_terima: {
        type: Sequelize.STRING,
      },
      nama_penerima: {
        type: Sequelize.STRING,
      },
      whatsapp_penerima: {
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
    await queryInterface.dropTable("Transfer_saldos");
  },
};
