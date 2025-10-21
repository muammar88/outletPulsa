"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Produk_pascabayars", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kategori_id: {
        type: Sequelize.INTEGER,
      },
      kode: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      fee: {
        type: Sequelize.INTEGER,
      },
      comission: {
        type: Sequelize.INTEGER,
      },
      outletFee: {
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
    await queryInterface.dropTable("Produk_pascabayars");
  },
};
