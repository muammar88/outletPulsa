"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Iak_pascabayar_products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      produk_pascabayar_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Produk_pascabayars",
          key: "id",
        },
      },
      code: {
        type: Sequelize.STRING,
      },
      name: {
        type: Sequelize.STRING,
      },
      status: {
        type: Sequelize.ENUM,
        values: ["active", "non active"],
      },
      fee: {
        type: Sequelize.INTEGER,
      },
      komisi: {
        type: Sequelize.INTEGER,
      },
      type_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Iak_pascabayar_types",
          key: "id",
        },
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
    await queryInterface.dropTable("Iak_pascabayar_products");
  },
};
