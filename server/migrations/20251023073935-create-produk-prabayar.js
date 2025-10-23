"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Produk_prabayars", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      operator_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Operators",
          key: "id",
        },
      },
      urutan: {
        type: Sequelize.INTEGER,
      },
      kode: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.ENUM,
        values: ["prabayar", "pascabayar"],
        defaultValue: "prabayar",
      },
      purchase_price: {
        type: Sequelize.INTEGER,
      },
      markup: {
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
        values: ["active", "inactive"],
        defaultValue: "inactive",
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
    await queryInterface.dropTable("Produk_prabayars");
  },
};
