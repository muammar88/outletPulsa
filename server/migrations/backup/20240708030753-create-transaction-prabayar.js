"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transaction_prabayars", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.ENUM,
        values: ["prabayar", "pascabayar"],
      },
      produk_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Produk_prabayars",
          key: "id",
        },
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Transactions",
          key: "id",
        },
      },
      nomor_tujuan: {
        type: Sequelize.INTEGER,
      },
      ket: {
        type: Sequelize.TEXT,
      },
      purchase_price: {
        type: Sequelize.INTEGER,
      },
      selling_price: {
        type: Sequelize.INTEGER,
      },
      kode_agen: {
        type: Sequelize.STRING,
      },
      fee_agen: {
        type: Sequelize.INTEGER,
      },
      laba: {
        type: Sequelize.INTEGER,
      },
      server_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Servers",
          key: "id",
        },
      },
      status: {
        type: Sequelize.ENUM,
        values: ["proses", "gagal", "sukses", "reverse"],
      },
      trx_id: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("Transaction_prabayars");
  },
};
