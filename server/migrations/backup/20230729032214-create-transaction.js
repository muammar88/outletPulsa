"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
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
      tipe: {
        type: Sequelize.ENUM,
        values: [
          "deposit_fee_agen",
          "deposit",
          "beli_produk_prabayar",
          "beli_produk_pascabayar",
          "rental_amra",
          "transfer_saldo",
          "terima_saldo",
        ],
      },
      saldo_before: {
        type: Sequelize.INTEGER,
      },
      saldo_after: {
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
    await queryInterface.dropTable("Transactions");
  },
};
