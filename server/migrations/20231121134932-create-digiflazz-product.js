"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Digiflazz_products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      produk_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: "Produk_prabayars",
          key: "id",
        },
      },
      category_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: "Digiflazz_categories",
          key: "id",
        },
      },
      brand_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: "Digiflazz_brands",
          key: "id",
        },
      },
      type_id: {
        type: Sequelize.INTEGER,
        defaultValue: null,
        references: {
          model: "Digiflazz_types",
          key: "id",
        },
      },
      name: {
        type: Sequelize.STRING,
      },
      selectedSellerBuyerSkuKode: {
        type: Sequelize.STRING,
      },
      selectedSellerPrice: {
        type: Sequelize.INTEGER,
      },
      selectedSellerStartCutOff: {
        type: Sequelize.TIME,
      },
      selectedSellerEndCutOff: {
        type: Sequelize.TIME,
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
    await queryInterface.dropTable("Digiflazz_products");
  },
};
