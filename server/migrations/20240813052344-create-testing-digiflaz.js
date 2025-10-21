"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Testing_digiflazs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kode: {
        type: Sequelize.STRING,
      },
      // seller_id: {
      //   type: Sequelize.INTEGER
      // },
      seller_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Digiflazz_sellers",
          key: "id",
        },
      },
      produk_name: {
        type: Sequelize.STRING,
      },
      buyer_sku_kode: {
        type: Sequelize.STRING,
      },
      nomor_tujuan: {
        type: Sequelize.STRING,
      },
      harga: {
        type: Sequelize.INTEGER,
      },
      saldo_before: {
        type: Sequelize.INTEGER,
      },
      saldo_after: {
        type: Sequelize.INTEGER,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["proses", "gagal", "sukses", "reverse"],
      },
      waktu_kirim: {
        allowNull: false,
        type: Sequelize.DATE,
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
    await queryInterface.dropTable("Testing_digiflazs");
  },
};
