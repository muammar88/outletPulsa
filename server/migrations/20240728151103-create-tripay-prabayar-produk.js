"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Tripay_prabayar_produks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      produk_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: "Produk_prabayars",
          key: "id",
        },
      },
      operator_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Tripay_prabayar_operators",
          key: "id",
        },
      },
      kode: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      deskripsi: {
        type: Sequelize.TEXT,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["tersedia", "tidak tersedia"],
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
    await queryInterface.dropTable("Tripay_prabayar_produks");
  },
};
