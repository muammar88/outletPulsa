"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transaction_pascabayars", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      tr_id: {
        type: Sequelize.STRING,
      },
      produk_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Produk_pascabayars",
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
        type: Sequelize.STRING,
      },
      tr_name: {
        type: Sequelize.STRING,
      },
      ket: {
        type: Sequelize.TEXT,
      },
      nominal: {
        type: Sequelize.INTEGER,
      },
      total_nominal: {
        type: Sequelize.INTEGER,
      },
      admin_fee: {
        type: Sequelize.INTEGER,
      },
      comission: {
        type: Sequelize.INTEGER,
      },
      outlet_comission: {
        type: Sequelize.INTEGER,
      },
      member_comission: {
        type: Sequelize.INTEGER,
      },
      noref: {
        type: Sequelize.STRING,
      },
      tarif: {
        type: Sequelize.STRING,
      },
      daya: {
        type: Sequelize.INTEGER,
      },
      total: {
        type: Sequelize.INTEGER,
      },
      kode_agen: {
        type: Sequelize.STRING,
      },
      laba: {
        type: Sequelize.INTEGER,
      },
      fee_agen: {
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
    await queryInterface.dropTable("Transaction_pascabayars");
  },
};
