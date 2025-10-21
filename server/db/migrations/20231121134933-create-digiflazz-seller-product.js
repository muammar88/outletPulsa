"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Digiflazz_seller_products", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      product_digiflazz_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Digiflazz_products",
          key: "id",
        },
      },
      seller_id: {
        type: Sequelize.INTEGER,
        references: {
          model: "Digiflazz_sellers",
          key: "id",
        },
      },
      buyerSkuKode: {
        type: Sequelize.STRING,
      },
      price: {
        type: Sequelize.INTEGER,
      },
      sellerProductStatus: {
        type: Sequelize.BOOLEAN,
      },
      startCutOff: {
        type: Sequelize.TIME,
      },
      endCutOff: {
        type: Sequelize.TIME,
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
    await queryInterface.dropTable("Digiflazz_seller_products");
  },
};
